import "server-only";
import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import {
  META_CURRENCY,
  META_PIXEL_ID,
  type MetaEventPayload,
  type MetaStandardEventName,
} from "@/lib/meta-events";
import type { StoreOrder } from "@/lib/store";

type MetaUserData = {
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
  em?: string[];
  ph?: string[];
};

type SendMetaEventInput = {
  eventName: MetaStandardEventName;
  eventId: string;
  payload?: Omit<MetaEventPayload, "event_id">;
  request?: NextRequest;
  userData?: MetaUserData;
};

function graphVersion() {
  return process.env.META_GRAPH_API_VERSION || "v26.0";
}

function accessToken() {
  return process.env.META_CAPI_ACCESS_TOKEN || "";
}

function sha256(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function cookieValue(request: NextRequest | undefined, name: string) {
  return request?.cookies.get(name)?.value;
}

function requestUserData(request?: NextRequest): MetaUserData {
  const forwardedFor = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request?.headers.get("x-real-ip")?.trim();
  return {
    client_ip_address: forwardedFor || realIp,
    client_user_agent: request?.headers.get("user-agent") || undefined,
    fbp: cookieValue(request, "_fbp"),
    fbc: cookieValue(request, "_fbc"),
  };
}

function compact<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (Array.isArray(entry)) return entry.length > 0;
      return entry !== undefined && entry !== null && entry !== "";
    }),
  ) as T;
}

export function metaPurchaseEventId(order: StoreOrder) {
  return `purchase:${order.id}:${order.paymentSessionId || order.orderNumber}`;
}

export function metaOrderPayload(order: StoreOrder): MetaEventPayload {
  return {
    event_id: metaPurchaseEventId(order),
    value: order.total,
    currency: META_CURRENCY,
    content_type: "product",
    content_ids: order.items.map((item) => item.productId),
    contents: order.items.map((item) => ({
      id: item.productId,
      quantity: item.quantity,
      item_price: item.price,
    })),
    num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export function metaOrderUserData(order: StoreOrder): MetaUserData {
  return compact({
    em: order.customer.email ? [sha256(order.customer.email)] : undefined,
    ph: order.customer.phone ? [sha256(order.customer.phone.replace(/\D/g, ""))] : undefined,
  });
}

export async function sendMetaCapiEvent({
  eventName,
  eventId,
  payload,
  request,
  userData,
}: SendMetaEventInput) {
  const token = accessToken();
  if (!META_PIXEL_ID || !token) {
    console.warn("Meta CAPI skipped: missing pixel id or access token", {
      eventName,
      eventId,
      hasPixelId: Boolean(META_PIXEL_ID),
      hasAccessToken: Boolean(token),
    });
    return { sent: false, skipped: true };
  }

  const eventPayload = compact({
    event_name: eventName,
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_source_url: payload?.event_source_url,
    user_data: compact({
      ...requestUserData(request),
      ...userData,
    }),
    custom_data: compact({
      currency: payload?.currency ?? META_CURRENCY,
      value: payload?.value,
      content_ids: payload?.content_ids,
      content_name: payload?.content_name,
      content_type: payload?.content_type,
      contents: payload?.contents,
      num_items: payload?.num_items,
    }),
  });

  const body = compact({
    data: [eventPayload],
    test_event_code: process.env.META_TEST_EVENT_CODE,
  });

  const url = `https://graph.facebook.com/${graphVersion()}/${META_PIXEL_ID}/events`;
  const response = await fetch(`${url}?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Meta CAPI failed", {
      eventName,
      eventId,
      status: response.status,
      error: data,
    });
    return { sent: false, skipped: false, error: data };
  }

  console.info("Meta CAPI sent", { eventName, eventId });
  return { sent: true, skipped: false, response: data };
}
