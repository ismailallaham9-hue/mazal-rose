import { NextResponse } from "next/server";
import {
  getStoreData,
  saveStoreData,
  type StoreData,
  type StoreOrder,
  type StorePaymentMethod,
} from "@/lib/store";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

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

  const store = await getStoreData();
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const promoCode = clean(body.promoCode) || null;
  const discount = promoCode
    ? Math.round((subtotal * store.settings.firstOrderDiscount) / 100)
    : 0;
  const deliveryMethod =
    clean(body.deliveryMethod) === "express" ? "express" : "standard";
  const deliveryFee =
    deliveryMethod === "express" && subtotal < store.settings.freeShippingThreshold
      ? 30
      : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const paymentMethod = (
    ["cod", "card", "tabby"].includes(clean(body.paymentMethod))
      ? clean(body.paymentMethod)
      : "cod"
  ) as StorePaymentMethod;
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
  };

  const products = store.products.map((product) => {
    const ordered = items
      .filter((item) => item.productId === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    if (!ordered || typeof product.stock !== "number") return product;
    return { ...product, stock: Math.max(0, product.stock - ordered) };
  });

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

  await saveStoreData({
    ...store,
    products,
    orders: [order, ...store.orders],
    subscribers,
  });
  revalidateStorefront({ products, articles: store.articles });

  return NextResponse.json({ order });
}
