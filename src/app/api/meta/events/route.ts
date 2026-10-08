import { NextRequest, NextResponse } from "next/server";
import { sendMetaCapiEvent } from "@/lib/meta-capi";
import type { MetaEventPayload, MetaStandardEventName } from "@/lib/meta-events";

export const runtime = "nodejs";

const BROWSER_ALLOWED_EVENTS = new Set<MetaStandardEventName>([
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
]);

function isAllowedEvent(value: unknown): value is MetaStandardEventName {
  return typeof value === "string" && BROWSER_ALLOWED_EVENTS.has(value as MetaStandardEventName);
}

function isPayload(value: unknown): value is MetaEventPayload {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as MetaEventPayload).event_id === "string" &&
    (value as MetaEventPayload).event_id.length > 0
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const eventName = (body as { eventName?: unknown })?.eventName;
  const payload = (body as { payload?: unknown })?.payload;

  if (eventName === "Purchase") {
    return NextResponse.json(
      { error: "Purchase events must be sent by verified server-side order confirmation." },
      { status: 403 },
    );
  }

  if (!isAllowedEvent(eventName) || !isPayload(payload)) {
    return NextResponse.json({ error: "Invalid Meta event payload." }, { status: 400 });
  }

  const result = await sendMetaCapiEvent({
    eventName,
    eventId: payload.event_id,
    payload,
    request,
  });

  return NextResponse.json({
    ok: true,
    sent: result.sent,
    skipped: result.skipped ?? false,
  });
}
