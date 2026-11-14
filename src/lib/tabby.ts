import "server-only";
import { getFreshStoreData, updateStoreData, type StoreOrder } from "./store";

export function tabbyConfigured() {
  return process.env.TABBY_ENABLED === "true" &&
    Boolean(process.env.TABBY_SECRET_KEY?.startsWith("sk_test_")) &&
    Boolean(process.env.TABBY_MERCHANT_CODE) &&
    Boolean(process.env.TABBY_WEBHOOK_SECRET);
}

async function request(path: string, body?: unknown) {
  if (!tabbyConfigured()) throw new Error("Tabby test checkout is unavailable.");
  const response = await fetch(`https://api.tabby.ai/api/v2/${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${process.env.TABBY_SECRET_KEY}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Tabby API request failed (${response.status}).`);
  return response.json();
}

export async function createTabbyCheckout(order: StoreOrder, baseUrl: string) {
  const resultUrl = new URL("/checkout/tabby/return", baseUrl);
  resultUrl.searchParams.set("order", order.id);
  const session = await request("checkout", {
    payment: {
      amount: order.total.toFixed(2), currency: "AED",
      buyer: { name: `${order.customer.firstName} ${order.customer.lastName}`, email: order.customer.email, phone: order.customer.phone },
      shipping_address: { city: order.shipping.city, address: order.shipping.address },
      order: { reference_id: order.id, tax_amount: "0.00", shipping_amount: order.deliveryFee.toFixed(2), discount_amount: order.discount.toFixed(2),
        items: order.items.map(item => ({ title: item.name, reference_id: item.productId, quantity: item.quantity, unit_price: item.price.toFixed(2), category: "Clothes" })) },
    },
    lang: "en", merchant_code: process.env.TABBY_MERCHANT_CODE,
    merchant_urls: { success: resultUrl.href, cancel: resultUrl.href, failure: resultUrl.href },
  });
  if (session.status === "rejected") throw new Error("Tabby could not approve this purchase. Please choose card payment.");
  const paymentUrl = session.configuration?.available_products?.installments?.[0]?.web_url;
  const paymentId = session.payment?.id;
  if (typeof paymentUrl !== "string" || typeof paymentId !== "string") throw new Error("Tabby checkout is unavailable. Please choose card payment.");
  const url = new URL(paymentUrl);
  if (url.protocol !== "https:" || !(url.hostname === "tabby.ai" || url.hostname.endsWith(".tabby.ai"))) throw new Error("Invalid Tabby checkout URL.");
  return { paymentId, paymentUrl };
}

export async function verifyTabbyPayment(orderId: string) {
  const store = await getFreshStoreData();
  const order = store.orders.find(entry => entry.id === orderId && entry.paymentProvider === "tabby");
  if (!order?.paymentSessionId) throw new Error("Tabby order not found.");
  let payment = await request(`payments/${encodeURIComponent(order.paymentSessionId)}`);
  const validate = () => {
    if (payment.id !== order.paymentSessionId || payment.order?.reference_id !== order.id || payment.currency !== "AED" ||
      Math.round(Number(payment.amount) * 100) !== Math.round(order.total * 100) || payment.is_test !== true) {
      throw new Error("Tabby payment verification mismatch.");
    }
  };
  validate();
  if (payment.status === "AUTHORIZED" && !(payment.captures?.length)) {
    await request(`payments/${encodeURIComponent(payment.id)}/captures`, {
      amount: order.total.toFixed(2), reference_id: `mazal:${order.id}:capture`,
    });
    payment = await request(`payments/${encodeURIComponent(order.paymentSessionId)}`);
    validate();
  }
  const captured = (payment.captures ?? []).reduce((sum: number, capture: { amount: string }) => sum + Math.round(Number(capture.amount) * 100), 0);
  const complete = ["AUTHORIZED", "CLOSED"].includes(payment.status) && captured === Math.round(order.total * 100);
  const failed = ["REJECTED", "EXPIRED"].includes(payment.status);
  await updateStoreData(current => ({
    store: { ...current, orders: current.orders.map(entry => entry.id === order.id ? {
      ...entry, tabbyTestStatus: complete ? "captured" : failed ? "failed" : "pending", updatedAt: new Date().toISOString(),
    } : entry) }, result: null,
  }));
  // QA payments never enter the production paid/inventory/Meta lifecycle.
  return { complete, failed };
}
