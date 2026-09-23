import { NextResponse } from "next/server";
import type { Product } from "@/lib/products";
import {
  deductOrderInventoryFromProducts,
  InventoryError,
  stockError,
} from "@/lib/inventory";
import {
  type StoreData,
  type StoreOrder,
  type StorePaymentMethod,
  updateStoreData,
} from "@/lib/store";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { orderEmails, sendEmails } from "@/lib/email";
import {
  createNoonCheckout,
  noonPaymentsConfigured,
} from "@/lib/noon-payments";

export const runtime = "nodejs";

type IncomingItem = {
  productId?: string;
  name?: string;
  image?: string;
  size?: string;
  color?: string;
  quantity?: number;
  price?: number;
};

class CheckoutError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function clean(value: unknown, fallback = "") {
  return String(value ?? fallback).trim();
}

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function orderNumber(existing: StoreData["orders"]) {
  const suffix = String(existing.length + 1).padStart(4, "0");
  const day = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `MZL-${day}-${suffix}`;
}

async function removeUnpaidPaymentOrder(order: StoreOrder) {
  await updateStoreData((store) => ({
    store: {
      ...store,
      orders: store.orders.filter((entry) => entry.id !== order.id),
    },
    result: null,
  }));
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const rawItems = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];
  const items = rawItems
    .map((item) => {
      const quantity = Math.max(1, Math.floor(number(item.quantity, 1)));
      const price = Math.max(0, Math.round(number(item.price, 0)));
      return {
        productId: clean(item.productId),
        name: clean(item.name),
        image: clean(item.image),
        size: clean(item.size),
        color: clean(item.color),
        quantity,
        price,
        lineTotal: price * quantity,
      };
    })
    .filter((item) => item.productId && item.name && item.quantity > 0);

  const customer = body.customer as Record<string, unknown> | undefined;
  const shipping = body.shipping as Record<string, unknown> | undefined;
  const email = clean(customer?.email).toLowerCase();
  const phone = clean(customer?.phone);
  const firstName = clean(customer?.firstName);
  const lastName = clean(customer?.lastName);
  const address = clean(shipping?.address);
  const city = clean(shipping?.city);
  const country = clean(shipping?.country, "United Arab Emirates");

  if (!items.length) {
    return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
  }
  if (!email || !phone || !firstName || !lastName || !address || !city) {
    return NextResponse.json(
      { error: "Please complete your contact and shipping details." },
      { status: 400 },
    );
  }

  let saved:
    | {
        order: StoreOrder;
        products: Product[];
        articles: StoreData["articles"];
        settings: StoreData["settings"];
      }
    | undefined;
  let redirectUrl: string | undefined;

  try {
    saved = await updateStoreData((store) => {
      const unavailable = stockError(store.products, items);
      if (unavailable) throw new CheckoutError(unavailable, 409);

      const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
      const promoCode = clean(body.promoCode) || null;
      const discount = promoCode
        ? Math.round((subtotal * store.settings.firstOrderDiscount) / 100)
        : 0;
      const deliveryMethod =
        clean(body.deliveryMethod) === "express" ? "express" : "standard";
      const deliveryFee =
        deliveryMethod === "express" &&
        subtotal < store.settings.freeShippingThreshold
          ? 30
          : 0;
      const total = Math.max(0, subtotal - discount + deliveryFee);
      const paymentMethod = (
        ["cod", "card", "tabby"].includes(clean(body.paymentMethod))
          ? clean(body.paymentMethod)
          : "cod"
      ) as StorePaymentMethod;
      if (paymentMethod === "tabby") {
        throw new CheckoutError(
          "Tabby checkout is not connected yet. Please choose card payment or cash on delivery.",
          503,
        );
      }
      const now = new Date().toISOString();

      const order: StoreOrder = {
        id: crypto.randomUUID(),
        orderNumber: orderNumber(store.orders),
        createdAt: now,
        updatedAt: now,
        status: "new",
        paymentMethod,
        paymentStatus:
          paymentMethod === "cod" ? "pending" : "payment_link_requested",
        paymentProvider:
          paymentMethod === "card"
            ? "noon"
            : "manual",
        deliveryMethod,
        customer: { email, phone, firstName, lastName },
        shipping: { address, city, country },
        items,
        subtotal,
        discount,
        deliveryFee,
        total,
        promoCode,
        note: clean(body.note),
        carrier: "",
        trackingNumber: "",
        trackingUrl: "",
        internalNotes: "",
      };

      const subscribers =
        clean(body.newsletterOptIn) === "true" &&
        !store.subscribers.some((subscriber) => subscriber.email === email)
          ? [
              {
                id: crypto.randomUUID(),
                createdAt: now,
                email,
                source: "checkout" as const,
              },
              ...store.subscribers,
            ]
          : store.subscribers;

      const resultOrder =
        paymentMethod === "cod"
          ? {
              ...order,
              status: "confirmed" as const,
              inventoryAdjustedAt: now,
              inventoryAdjustmentReason: "cod_order_created",
              inventoryPaymentEventId: `cod:${order.id}`,
            }
          : order;
      const products =
        paymentMethod === "cod"
          ? deductOrderInventoryFromProducts(store.products, resultOrder)
          : store.products;
      return {
        store: {
          ...store,
          products,
          orders: [resultOrder, ...store.orders],
          subscribers,
        },
        result: { order: resultOrder, products, articles: store.articles, settings: store.settings },
      };
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof InventoryError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }

  if (saved.order.paymentMethod === "card" && saved.order.total > 0) {
    if (!noonPaymentsConfigured()) {
      await removeUnpaidPaymentOrder(saved.order);
      return NextResponse.json(
        { error: "Card checkout is not available right now. Please try again or choose cash on delivery." },
        { status: 503 },
      );
    }

    try {
      const checkout = await createNoonCheckout({
        order: saved.order,
        baseUrl: saved.settings.url,
      });
      redirectUrl = checkout.paymentUrl;
      const gatewayOrder = await updateStoreData((store) => {
        const orders = store.orders.map((order) =>
          order.id === saved!.order.id
            ? {
                ...order,
                paymentProvider: "noon" as const,
                paymentSessionId: checkout.noonOrderId,
                paymentUrl: checkout.paymentUrl,
                updatedAt: new Date().toISOString(),
              }
            : order,
        );
        return {
          store: { ...store, orders },
          result: orders.find((order) => order.id === saved!.order.id) ?? saved!.order,
        };
      });
      saved = { ...saved, order: gatewayOrder };
    } catch (error) {
      console.error("Noon Payments checkout failed", error);
      await removeUnpaidPaymentOrder(saved.order);
      return NextResponse.json(
        { error: "Secure card checkout could not be opened. Please try again or choose cash on delivery." },
        { status: 502 },
      );
    }
  }

  if (saved.order.inventoryAdjustedAt || saved.order.paymentMethod === "cod") {
    const emailEvents = await sendEmails(
      saved.settings,
      orderEmails(saved.settings, saved.order),
    );
    if (emailEvents.length) {
      await updateStoreData((store) => ({
        store: { ...store, emailEvents: [...emailEvents, ...store.emailEvents] },
        result: null,
      }));
    }
  }
  revalidateStorefront({ products: saved.products, articles: saved.articles });

  return NextResponse.json({ order: saved.order, redirectUrl });
}
