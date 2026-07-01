import { NextResponse } from "next/server";
import {
  type StoreSubscriber,
  updateStoreData,
} from "@/lib/store";
import { sendEmails, subscriberEmails } from "@/lib/email";

export const runtime = "nodejs";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = clean(body.email).toLowerCase();
  const source =
    clean(body.source) === "footer" || clean(body.source) === "checkout"
      ? clean(body.source)
      : "newsletter";

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const result = await updateStoreData((store) => {
    const exists = store.subscribers.some(
      (subscriber) => subscriber.email.toLowerCase() === email,
    );
    const subscriber: StoreSubscriber = exists
      ? store.subscribers.find((item) => item.email.toLowerCase() === email)!
      : {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          email,
          source: source as StoreSubscriber["source"],
        };
    return {
      store: exists
        ? store
        : { ...store, subscribers: [subscriber, ...store.subscribers] },
      result: { subscriber, alreadySubscribed: exists, settings: store.settings },
    };
  });

  if (!result.alreadySubscribed) {
    const emailEvents = await sendEmails(
      result.settings,
      subscriberEmails(result.settings, result.subscriber),
    );
    if (emailEvents.length) {
      await updateStoreData((store) => ({
        store: { ...store, emailEvents: [...emailEvents, ...store.emailEvents] },
        result: null,
      }));
    }
  }

  return NextResponse.json({
    subscriber: result.subscriber,
    alreadySubscribed: result.alreadySubscribed,
  });
}
