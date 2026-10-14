import { NextResponse } from "next/server";
import { getFreshStoreData } from "@/lib/store";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

export const runtime = "nodejs";

/** Called once by instrumentation.ts after boot; see the note there. */
export async function POST(req: Request) {
  const token = (globalThis as { __mazalWarmToken?: string }).__mazalWarmToken;
  if (!token || req.headers.get("x-warm-token") !== token) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { products, articles } = await getFreshStoreData();
  revalidateStorefront({ products, articles });
  return NextResponse.json({ ok: true });
}
