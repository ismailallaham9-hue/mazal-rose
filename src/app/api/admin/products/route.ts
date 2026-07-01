import { NextResponse } from "next/server";
import { normalizeProduct } from "@/lib/admin-product";
import { updateStoreData } from "@/lib/store";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

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

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { product, products, articles } = await updateStoreData((store) => {
    const product = normalizeProduct(body as Record<string, unknown>);
    product.id = product.id || `p-${Date.now().toString(36)}`;
    product.slug = uniqueSlug(product.slug, store.products);
    const nextStore = {
      ...store,
      products: [product, ...store.products],
    };
    return {
      store: nextStore,
      result: { product, products: nextStore.products, articles: nextStore.articles },
    };
  });
  revalidateStorefront({ products, articles });
  return NextResponse.json({ product });
}
