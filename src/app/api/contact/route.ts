import { NextResponse } from "next/server";
import { type StoreInquiry, updateStoreData } from "@/lib/store";
import { contactEmails, sendEmails } from "@/lib/email";

export const runtime = "nodejs";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = clean(body.name);
  const email = clean(body.email).toLowerCase();
  const subject = clean(body.subject);
  const message = clean(body.message);

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Please complete all message fields." },
      { status: 400 },
    );
  }

  const inquiry: StoreInquiry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "new",
    name,
    email,
    subject,
    message,
  };

  const settings = await updateStoreData((store) => ({
    store: { ...store, inquiries: [inquiry, ...store.inquiries] },
    result: store.settings,
  }));

  const emailEvents = await sendEmails(settings, contactEmails(settings, inquiry));
  if (emailEvents.length) {
    await updateStoreData((store) => ({
      store: { ...store, emailEvents: [...emailEvents, ...store.emailEvents] },
      result: null,
    }));
  }

  return NextResponse.json({ inquiry });
}
