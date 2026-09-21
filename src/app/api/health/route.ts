import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  const release = process.env.RENDER_GIT_COMMIT?.slice(0, 12);
  return NextResponse.json({ ok: true, ...(release ? { release } : {}) });
}
