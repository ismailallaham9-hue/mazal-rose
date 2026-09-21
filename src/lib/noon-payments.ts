import "server-only";
import type { StoreOrder } from "@/lib/store";

const TEST_API = "https://api-test.noonpayments.com/payment/v1";
const LIVE_API = "https://api.noonpayments.com/payment/v1";

type NoonMode = "test" | "live";

type NoonOrderStatus =
  | "INITIATED"
  | "AUTHORIZED"
  | "CANCELLED"
  | "CAPTURED"
  | "FAILED"
  | "PARTIALLY_CAPTURED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED"
  | "PAYMENT_INFO_ADDED"
  | "EXPIRED"
  | "REJECTED"
  | "PENDING"
  | string;

export type NoonGatewayOrder = {
  id?: string | number;
  status?: NoonOrderStatus;
  amount?: number;
  currency?: string;
  reference?: string;
  errorCode?: number;
  errorMessage?: string;
};

type NoonTransaction = {
  type?: string;
  status?: string;
  identifier?: string;
  id?: string;
  amount?: number;
  currency?: string;
};

export type NoonPaymentResponse = {
  resultCode: number;
  message?: string;
  result?: {
    order?: NoonGatewayOrder;
    transactions?: NoonTransaction[];
    checkoutData?: {
      postUrl?: string;
      shortUrl?: string;
      jsUrl?: string;
    };
  } | null;
};

export type NoonCheckout = {
  noonOrderId: string;
  paymentUrl: string;
  raw: NoonPaymentResponse;
};

export function noonPaymentsConfigured() {
  return Boolean(
    process.env.NOON_PAYMENTS_BUSINESS_ID &&
      process.env.NOON_PAYMENTS_APP_NAME &&
      process.env.NOON_PAYMENTS_APP_KEY,
  );
}

function mode(): NoonMode {
  return process.env.NOON_PAYMENTS_MODE === "live" ? "live" : "test";
}

function endpoint() {
  return (process.env.NOON_PAYMENTS_API_URL || (mode() === "live" ? LIVE_API : TEST_API)).replace(/\/$/, "");
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function authorizationHeader() {
  const businessId = requiredEnv("NOON_PAYMENTS_BUSINESS_ID");
  const appName = requiredEnv("NOON_PAYMENTS_APP_NAME");
  const appKey = requiredEnv("NOON_PAYMENTS_APP_KEY");
  const encoded = Buffer.from(`${businessId}.${appName}:${appKey}`, "utf8").toString("base64");
  const defaultScheme = mode() === "live" ? "Key_Live" : "Key_Test";
  return `${process.env.NOON_PAYMENTS_AUTH_SCHEME || defaultScheme} ${encoded}`;
}

function absoluteBaseUrl(baseUrl: string) {
  const fallback = "https://mazal.ae";
  try {
    return new URL(baseUrl || fallback).origin;
  } catch {
    return fallback;
  }
}

function amount(value: number) {
  return Number(value.toFixed(2));
}

function orderName(order: StoreOrder) {
  return `MAZAL ${order.orderNumber}`.replace(/\s+/g, " ").trim().slice(0, 50);
}

function orderDescription(order: StoreOrder) {
  return order.items
    .map((item) => `${item.quantity}x ${item.name} (${item.size}, ${item.color})`)
    .join("; ")
    .replace(/\s+/g, " ")
    .slice(0, 500);
}

function noonLocale(locale?: string) {
  return locale?.toLowerCase().startsWith("ar") ? "ar" : "en";
}

async function noonFetch(path: string, init?: RequestInit) {
  const response = await fetch(`${endpoint()}${path}`, {
    ...init,
    cache: "no-store",
    signal: init?.signal ?? AbortSignal.timeout(15_000),
    headers: {
      Authorization: authorizationHeader(),
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await response.text();
  let data: NoonPaymentResponse | null = null;
  try {
    data = text ? (JSON.parse(text) as NoonPaymentResponse) : null;
  } catch {
    // Keep non-JSON gateway errors out of the customer-facing response.
  }
  if (!data) {
    throw new Error(`Noon Payments request failed: HTTP ${response.status}`);
  }
  if (!response.ok || (data && data.resultCode !== 0)) {
    const detail = data?.message || text || `HTTP ${response.status}`;
    throw new Error(`Noon Payments request failed: ${detail}`);
  }
  return data;
}

export async function createNoonCheckout({
  order,
  baseUrl,
  locale,
}: {
  order: StoreOrder;
  baseUrl: string;
  locale?: string;
}): Promise<NoonCheckout> {
  const origin = absoluteBaseUrl(baseUrl);
  const configuredCategory = process.env.NOON_PAYMENTS_ORDER_CATEGORY || "pay";
  const configuredAction = process.env.NOON_PAYMENTS_PAYMENT_ACTION || "SALE";
  const payload = {
    apiOperation: "INITIATE",
    order: {
      amount: amount(order.total),
      currency: process.env.NOON_PAYMENTS_CURRENCY || "AED",
      name: orderName(order),
      reference: order.orderNumber,
      category: configuredCategory,
      channel: process.env.NOON_PAYMENTS_CHANNEL || "WEB",
      description: orderDescription(order),
      items: order.items.map((item) => ({
        name: item.name.slice(0, 100),
        quantity: item.quantity,
        unitPrice: amount(item.price),
      })),
    },
    configuration: {
      locale: noonLocale(locale),
      paymentAction: configuredAction,
      returnUrl: `${origin}/checkout/noon/return?order=${order.id}`,
      allowedRetries: Number(process.env.NOON_PAYMENTS_ALLOWED_RETRIES || 2),
    },
  };

  const data = await noonFetch("/order", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const noonOrderId = data?.result?.order?.id ? String(data.result.order.id) : "";
  const paymentUrl = data?.result?.checkoutData?.postUrl || data?.result?.checkoutData?.shortUrl || "";
  if (!noonOrderId || !paymentUrl) {
    throw new Error("Noon Payments did not return a hosted checkout URL.");
  }
  return { noonOrderId, paymentUrl, raw: data };
}

export async function getNoonOrder(noonOrderId: string): Promise<NoonPaymentResponse> {
  return noonFetch(`/order/${encodeURIComponent(noonOrderId)}`);
}

export function paymentStatusFromNoon(response: NoonPaymentResponse | null | undefined) {
  const status = response?.result?.order?.status;
  const transactions = response?.result?.transactions ?? [];
  if (
    status === "CAPTURED" ||
    status === "PARTIALLY_CAPTURED" ||
    transactions.some((txn) =>
      ["SALE", "CAPTURE"].includes((txn.type || "").toUpperCase()) &&
      (txn.status || "").toUpperCase() === "SUCCESS",
    )
  ) {
    return "paid" as const;
  }
  if (["FAILED", "CANCELLED", "EXPIRED", "REJECTED"].includes(String(status))) {
    return "failed" as const;
  }
  if (status === "REFUNDED" || status === "PARTIALLY_REFUNDED") {
    return "refunded" as const;
  }
  return "payment_link_requested" as const;
}
