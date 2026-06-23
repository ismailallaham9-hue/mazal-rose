import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { normalizeProduct } from "@/lib/admin-product";
import { getStoreData, saveStoreData } from "@/lib/store";

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

function refreshPublicPages(oldSlug?: string, newSlug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  if (oldSlug) revalidatePath(`/shop/${oldSlug}`);
  if (newSlug && newSlug !== oldSlug) revalidatePath(`/shop/${newSlug}`);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const store = await getStoreData();
  const existing = store.products.find((p) => p.id === id);
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const product = normalizeProduct(
    { ...(body as Record<string, unknown>), id },
    existing,
  );
  product.slug = uniqueSlug(product.slug, store.products, id);

  await saveStoreData({
    ...store,
    products: store.products.map((p) => (p.id === id ? product : p)),
  });
  refreshPublicPages(existing.slug, product.slug);
  return NextResponse.json({ product });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const store = await getStoreData();
  const existing = store.products.find((p) => p.id === id);
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await saveStoreData({
    ...store,
    products: store.products.filter((p) => p.id !== id),
  });
  refreshPublicPages(existing.slug);
  return NextResponse.json({ ok: true });
}
