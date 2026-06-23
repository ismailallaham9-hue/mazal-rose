import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { DEFAULT_CONTENT, getStoreData, saveStoreData } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const input = body as Record<string, unknown>;
  const store = await getStoreData();
  const announcements = Array.isArray(input.announcements)
    ? input.announcements.map(String).filter(Boolean)
    : String(input.announcements ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

  const content = {
    heroEyebrow: String(input.heroEyebrow ?? DEFAULT_CONTENT.heroEyebrow).trim(),
    heroTitle: String(input.heroTitle ?? DEFAULT_CONTENT.heroTitle).trim(),
    heroSubtitle: String(input.heroSubtitle ?? DEFAULT_CONTENT.heroSubtitle).trim(),
    heroCtaText: String(input.heroCtaText ?? DEFAULT_CONTENT.heroCtaText).trim(),
    heroCtaHref: String(input.heroCtaHref ?? DEFAULT_CONTENT.heroCtaHref).trim(),
    announcements: announcements.length
      ? announcements
      : DEFAULT_CONTENT.announcements,
  };

  await saveStoreData({ ...store, content });
  revalidatePath("/");
  return NextResponse.json({ content });
}
