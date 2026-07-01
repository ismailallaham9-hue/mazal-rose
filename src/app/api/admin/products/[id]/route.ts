import { NextResponse } from "next/server";
import { normalizeProduct } from "@/lib/admin-product";
import { updateStoreData } from "@/lib/store";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

export const runtime = "nodejs";

function uniqueSlug(
  slug: string,
  products: { id: string; slug: string }[],
  currentId: string,
) {
  let next = slug;
  let i = 2;
  while (products.some((p) => p.id !== currentId && p.slug === next)) {
    next = `${slug}-${i}`;
    i += 1;
  }
  return next;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const result = await updateStoreData((store) => {
    const existing = store.products.find((p) => p.id === id);
    if (!existing) return { store, result: null };

    const product = normalizeProduct(
      { ...(body as Record<string, unknown>), id },
      existing,
    );
    product.slug = uniqueSlug(product.slug, store.products, id);

    const nextStore = {
      ...store,
      products: store.products.map((p) => (p.id === id ? product : p)),
    };

    return {
      store: nextStore,
      result: {
        product,
        products:
          existing.slug === product.slug
            ? nextStore.products
            : [...nextStore.products, { slug: existing.slug }],
        articles: nextStore.articles,
      },
    };
  });
  if (!result) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const { product, products, articles } = result;
  revalidateStorefront({ products, articles });
  return NextResponse.json({ product });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await updateStoreData((store) => {
    const existing = store.products.find((p) => p.id === id);
    if (!existing) return { store, result: null };
    const nextStore = {
      ...store,
      products: store.products.filter((p) => p.id !== id),
    };
    return {
      store: nextStore,
      result: {
        products: [...nextStore.products, { slug: existing.slug }],
        articles: nextStore.articles,
      },
    };
  });
  if (!result) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  revalidateStorefront(result);
  return NextResponse.json({ ok: true });
}
