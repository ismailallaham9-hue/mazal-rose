import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getStoreData, saveStoreData, type StoreData } from "@/lib/store";

export const runtime = "nodejs";

const PUBLIC_PATHS = [
  "/",
  "/shop",
  "/journal",
  "/about",
  "/contact",
  "/wishlist",
  "/cart",
  "/checkout",
  "/rewards",
  "/sitemap.xml",
  "/robots.txt",
];

function refreshAll() {
  for (const path of PUBLIC_PATHS) revalidatePath(path);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<StoreData>;
  const current = await getStoreData();
  const next: StoreData = {
    ...current,
    ...body,
    content: { ...current.content, ...(body.content ?? {}) },
    theme: { ...current.theme, ...(body.theme ?? {}) },
    settings: { ...current.settings, ...(body.settings ?? {}) },
    seo: { ...current.seo, ...(body.seo ?? {}) },
    seoRecords: { ...current.seoRecords, ...(body.seoRecords ?? {}) },
    pages: { ...current.pages, ...(body.pages ?? {}) },
    products: Array.isArray(body.products) ? body.products : current.products,
    categories: Array.isArray(body.categories)
      ? body.categories
      : current.categories,
    articles: Array.isArray(body.articles) ? body.articles : current.articles,
    media: Array.isArray(body.media) ? body.media : current.media,
  };

  await saveStoreData(next);
  refreshAll();
  for (const product of next.products) revalidatePath(`/shop/${product.slug}`);
  for (const article of next.articles) revalidatePath(`/journal/${article.slug}`);
  return NextResponse.json({ store: next });
}
