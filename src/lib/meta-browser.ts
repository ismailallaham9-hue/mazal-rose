"use client";

import {
  META_CURRENCY,
  META_PIXEL_ID,
  newMetaEventId,
  type MetaEventPayload,
  type MetaStandardEventName,
} from "@/lib/meta-events";

declare global {
  interface Window {
    fbq?: (
      command: "init" | "track",
      eventNameOrPixelId: string,
      parameters?: Record<string, unknown>,
      options?: { eventID?: string },
    ) => void;
    _fbq?: unknown;
  }
}

function trackingAllowed() {
  if (typeof navigator === "undefined") return false;
  return navigator.doNotTrack !== "1";
}

function browserParams(payload: MetaEventPayload) {
  const parameters: Partial<MetaEventPayload> = { ...payload };
  delete parameters.event_id;
  delete parameters.event_source_url;
  return parameters;
}

function sendBrowserEvent(eventName: MetaStandardEventName, payload: MetaEventPayload) {
  const send = () =>
    window.fbq?.("track", eventName, browserParams(payload), {
      eventID: payload.event_id,
    });

  if (window.fbq) {
    send();
    return;
  }

  window.setTimeout(send, 500);
}

export async function trackMetaEvent(
  eventName: Exclude<MetaStandardEventName, "Purchase">,
  payload: Omit<MetaEventPayload, "event_id" | "currency"> &
    Partial<Pick<MetaEventPayload, "event_id" | "currency">> = {},
) {
  if (!trackingAllowed() || !META_PIXEL_ID) return null;

  const eventPayload: MetaEventPayload = {
    ...payload,
    event_id: payload.event_id ?? newMetaEventId(eventName),
    currency: payload.currency ?? META_CURRENCY,
    event_source_url:
      payload.event_source_url ??
      (typeof window !== "undefined" ? window.location.href : undefined),
  };

  sendBrowserEvent(eventName, eventPayload);

  try {
    await fetch("/api/meta/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, payload: eventPayload }),
      keepalive: true,
    });
  } catch {
    // Analytics must never block storefront behaviour.
  }

  return eventPayload.event_id;
}

export function trackMetaPurchase(payload: MetaEventPayload) {
  if (!trackingAllowed() || !META_PIXEL_ID) return;
  sendBrowserEvent("Purchase", payload);
}
