import { NextResponse } from "next/server";
import { getFreshStoreData } from "@/lib/store";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

export const runtime = "nodejs";

/**
 * Called once by instrumentation.ts after boot (Render), or by the deploy
 * script with `Authorization: Bearer $REVALIDATE_SECRET` (Cloudflare).
 */
export async function POST(req: Request) {
  const token = (globalThis as { __mazalWarmToken?: string }).__mazalWarmToken;
  const secret = process.env.REVALIDATE_SECRET;
  const viaToken = !!token && req.headers.get("x-warm-token") === token;
  const viaSecret =
    !!secret && secret.length >= 32 && req.headers.get("authorization") === `Bearer ${secret}`;
  if (!viaToken && !viaSecret) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { products, articles } = await getFreshStoreData();
  revalidateStorefront({ products, articles });
  return NextResponse.json({ ok: true });
}
