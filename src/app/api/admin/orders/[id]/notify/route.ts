import { NextResponse } from "next/server";
import { orderStatusEmails, sendEmails } from "@/lib/email";
import { updateStoreData } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await updateStoreData((store) => {
    const order = store.orders.find((item) => item.id === id);
    return { store, result: order ? { order, settings: store.settings } : null };
  });
  if (!result) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const emailEvents = await sendEmails(
    result.settings,
    orderStatusEmails(result.settings, result.order),
  );
  const now = new Date().toISOString();
  const savedOrder = await updateStoreData((store) => {
    const orders = store.orders.map((item) =>
      item.id === id
        ? { ...item, customerNotifiedAt: now, updatedAt: now }
        : item,
    );
    return {
      store: {
        ...store,
        orders,
        emailEvents: [...emailEvents, ...store.emailEvents],
      },
      result: orders.find((item) => item.id === id),
    };
  });

  return NextResponse.json({
    ok: true,
    order: savedOrder,
    emailEvents,
  });
}
