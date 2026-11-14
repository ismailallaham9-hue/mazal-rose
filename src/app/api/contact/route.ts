import { NextResponse } from "next/server";
import { type StoreInquiry, updateStoreData } from "@/lib/store";
import { contactEmails, sendEmails } from "@/lib/email";
import {
  clientIp,
  limitText,
  payloadTooLarge,
  rateLimit,
  readJsonBody,
  RequestTooLarge,
  tooManyRequests,
} from "@/lib/request-guard";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60 * 1000)) return tooManyRequests();
  let body: Record<string, unknown>;
  try {
    body = await readJsonBody(req, 16 * 1024);
  } catch (error) {
    if (error instanceof RequestTooLarge) return payloadTooLarge();
    throw error;
  }
  const name = limitText(body.name, 120);
  const email = limitText(body.email, 200).toLowerCase();
  const subject = limitText(body.subject, 200);
  const message = limitText(body.message, 5000);

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
