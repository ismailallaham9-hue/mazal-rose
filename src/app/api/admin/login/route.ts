import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidPassword, sessionToken } from "@/lib/admin-auth";
import {
  clientIp,
  payloadTooLarge,
  rateLimit,
  readJsonBody,
  RequestTooLarge,
  tooManyRequests,
} from "@/lib/request-guard";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Slow down password guessing: 10 attempts per 15 minutes per IP.
  if (!rateLimit(`login:${clientIp(req)}`, 10, 15 * 60 * 1000)) return tooManyRequests();
  let body: Record<string, unknown>;
  try {
    body = await readJsonBody(req, 2 * 1024);
  } catch (error) {
    if (error instanceof RequestTooLarge) return payloadTooLarge();
    throw error;
  }
  const password = String(body.password ?? "");
  if (!(await isValidPassword(password))) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
