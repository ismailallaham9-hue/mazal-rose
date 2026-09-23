import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { formatAED } from "@/lib/format";
import {
  getNoonOrder,
  noonPaymentsConfigured,
  paymentStatusFromNoon,
} from "@/lib/noon-payments";
import { orderEmails, sendEmails } from "@/lib/email";
import { applyOrderInventoryDeduction } from "@/lib/inventory";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import {
  getFreshStoreData,
  updateStoreData,
  type StoreOrder,
} from "@/lib/store";
import { ClearCartOnPaid } from "./ClearCartOnPaid";

export const metadata: Metadata = {
  title: "Payment status | MAZAL",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function refreshOrderFromNoon(order: StoreOrder) {
  if (!order.paymentSessionId || !noonPaymentsConfigured()) return order;

  try {
    const noonOrder = await getNoonOrder(order.paymentSessionId);
    const paymentStatus = paymentStatusFromNoon(noonOrder);
    const updated = await updateStoreData((store) => {
      const orders = store.orders.map((entry) =>
        entry.id === order.id
          ? {
              ...entry,
              paymentProvider: "noon" as const,
              paymentStatus,
              updatedAt: new Date().toISOString(),
            }
          : entry,
      );
      return {
        store: { ...store, orders },
        result: orders.find((entry) => entry.id === order.id) ?? order,
      };
    });
    if (paymentStatus !== "paid") return updated;

    const eventId = `noon:${order.paymentSessionId}:${String(
      noonOrder.result?.order?.status ?? "paid",
    )}`;
    const adjustment = await applyOrderInventoryDeduction({
      orderId: order.id,
      paymentEventId: eventId,
      reason: "noon_paid_return_verification",
      markPaid: true,
    });
    if (adjustment.changed && adjustment.order) {
      const latestStore = await getFreshStoreData();
      const emailEvents = await sendEmails(
        latestStore.settings,
        orderEmails(latestStore.settings, adjustment.order),
      );
      if (emailEvents.length) {
        await updateStoreData((store) => ({
          store: { ...store, emailEvents: [...emailEvents, ...store.emailEvents] },
          result: null,
        }));
      }
      revalidateStorefront({
        products: latestStore.products,
        articles: latestStore.articles,
      });
    }
    return adjustment.order ?? updated;
  } catch (error) {
    console.error("Unable to refresh Noon payment status", error);
    return order;
  }
}

export default async function NoonReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const store = await getFreshStoreData();
  const found = store.orders.find((entry) => entry.id === orderId);
  const order = found ? await refreshOrderFromNoon(found) : undefined;
  const paid = order?.paymentStatus === "paid";
  const failed = order?.paymentStatus === "failed";

  return (
    <Container className="flex flex-col items-center py-24 text-center">
      <ClearCartOnPaid paid={paid} />
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bronze/15 text-bronze">
        {paid ? (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M12 8v5" strokeLinecap="round" />
            <path d="M12 17h.01" strokeLinecap="round" />
            <path d="M10.3 4.2h3.4L21 18.5 19.3 21H4.7L3 18.5 10.3 4.2Z" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <p className="eyebrow mt-6">
        {paid ? "Payment confirmed" : failed ? "Payment not completed" : "Payment status pending"}
      </p>
      <h1 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
        {paid ? "Thank you for your order." : "You are back at MAZAL."}
      </h1>
      <p className="mt-4 max-w-md text-ink-soft">
        {order ? (
          <>
            Order <strong className="text-ink">{order.orderNumber}</strong> ·{" "}
            {formatAED(order.total)}.{" "}
            {paid
              ? "Your Noon payment is confirmed and we will prepare your pieces."
              : failed
                ? "Noon reported that payment was not completed. Your bag should still be available if you want to try again."
                : "Noon has returned you to MAZAL. We are still waiting for final confirmation."}
          </>
        ) : (
          "Noon has returned you to MAZAL. We could not match the local order, so please contact client care if you need help."
        )}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {!paid && (
          <Link
            href="/checkout"
            className="bg-bronze px-8 py-3 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
          >
            Return to Checkout
          </Link>
        )}
        <Link
          href="/shop"
          className="border border-ink/25 px-8 py-3 text-xs uppercase tracking-[0.18em] text-ink transition-colors hover:border-bronze hover:text-bronze"
        >
          Continue Shopping
        </Link>
        <Link
          href="/contact"
          className="border border-ink/25 px-8 py-3 text-xs uppercase tracking-[0.18em] text-ink transition-colors hover:border-bronze hover:text-bronze"
        >
          Contact Client Care
        </Link>
      </div>
    </Container>
  );
}
