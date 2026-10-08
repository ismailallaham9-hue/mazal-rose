"use client";

import { useEffect } from "react";
import { META_CURRENCY, type MetaEventPayload } from "@/lib/meta-events";
import { trackMetaPurchase } from "@/lib/meta-browser";

export function MetaPurchaseEvent({
  eventId,
  value,
  contents,
  contentIds,
  numItems,
}: {
  eventId: string;
  value: number;
  contents: MetaEventPayload["contents"];
  contentIds: string[];
  numItems: number;
}) {
  useEffect(() => {
    if (!eventId) return;
    try {
      const key = `mazal.meta.purchase.${eventId}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // If storage is unavailable, still allow the browser event once per mount.
    }

    trackMetaPurchase({
      event_id: eventId,
      value,
      currency: META_CURRENCY,
      content_type: "product",
      content_ids: contentIds,
      contents,
      num_items: numItems,
      event_source_url: window.location.href,
    });
  }, [contentIds, contents, eventId, numItems, value]);

  return null;
}
