import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { normalizeProduct } from "@/lib/admin-product";
import { getStoreData, saveStoreData } from "@/lib/store";

export const runtime = "nodejs";

function uniqueSlug(slug: string, products: { slug: string }[]) {
  let next = slug;
  let i = 2;
  while (products.some((p) => p.slug === next)) {
    next = `${slug}-${i}`;
    i += 1;
  }
  return next;
}

function refreshPublicPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  if (slug) revalidatePath(`/shop/${slug}`);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const store = await getStoreData();
  const product = normalizeProduct(body as Record<string, unknown>);
  product.id = product.id || `p-${Date.now().toString(36)}`;
  product.slug = uniqueSlug(product.slug, store.products);

  await saveStoreData({
    ...store,
    products: [product, ...store.products],
  });
  refreshPublicPages(product.slug);
  return NextResponse.json({ product });
}
