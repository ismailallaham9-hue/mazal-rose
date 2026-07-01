import { NextResponse } from "next/server";
import {
  getStoreData,
  saveStoreData,
  type StoreSubscriber,
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

  const store = await getStoreData();
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

  if (!exists) {
    const emailEvents = await sendEmails(
      store.settings,
      subscriberEmails(store.settings, subscriber),
    );
    await saveStoreData({
      ...store,
      subscribers: [subscriber, ...store.subscribers],
      emailEvents: [...emailEvents, ...store.emailEvents],
    });
  }

  return NextResponse.json({ subscriber, alreadySubscribed: exists });
}
