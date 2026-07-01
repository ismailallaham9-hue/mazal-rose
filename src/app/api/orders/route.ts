import { NextResponse } from "next/server";
import {
  totalStock,
  variantKey,
  variantStock,
  type Product,
} from "@/lib/products";
import {
  type StoreData,
  type StoreOrder,
  type StorePaymentMethod,
  updateStoreData,
} from "@/lib/store";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { orderEmails, sendEmails } from "@/lib/email";

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

function stockError(products: Product[], items: StoreOrder["items"]) {
  for (const item of items) {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) return `${item.name} is no longer available.`;
    if (variantStock(product, item.size, item.color) < item.quantity) {
      return `${item.name} (${item.size} / ${item.color}) has only ${variantStock(
        product,
        item.size,
        item.color,
      )} left.`;
    }
  }
  return null;
}

function reduceProductStock(product: Product, items: StoreOrder["items"]): Product {
  const ordered = items
    .filter((item) => item.productId === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);
  if (!ordered) return product;

  if (product.variantStock && Object.keys(product.variantStock).length) {
    const variantStockMap = { ...product.variantStock };
    for (const item of items.filter((entry) => entry.productId === product.id)) {
      const key = variantKey(item.size, item.color);
      variantStockMap[key] = Math.max(0, (variantStockMap[key] ?? 0) - item.quantity);
    }
    return { ...product, variantStock: variantStockMap, stock: totalStock({ ...product, variantStock: variantStockMap }) };
  }

  if (typeof product.stock !== "number") return product;
  return { ...product, stock: Math.max(0, product.stock - ordered) };
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
        carrier: "",
        trackingNumber: "",
        trackingUrl: "",
        internalNotes: "",
      };

      const products = store.products.map((product) =>
        reduceProductStock(product, items),
      );

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

      return {
        store: {
          ...store,
          products,
          orders: [order, ...store.orders],
          subscribers,
        },
        result: { order, products, articles: store.articles, settings: store.settings },
      };
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

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
  revalidateStorefront({ products: saved.products, articles: saved.articles });

  return NextResponse.json({ order: saved.order });
}
