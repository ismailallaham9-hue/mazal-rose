"use client";

import Link from "next/link";
import { ProductImage } from "./ProductImage";
import { useCart } from "@/lib/cart-context";
import { formatAED } from "@/lib/format";
import type { Product } from "@/lib/products";

/** "Frequently bought together" cross-sell with an add-all bundle action. */
export function FrequentlyBoughtTogether({
  main,
  extras,
}: {
  main: Product;
  extras: Product[];
}) {
  const { addItem } = useCart();
  const bundle = [main, ...extras];
  const total = bundle.reduce((s, p) => s + p.price, 0);

  function addAll() {
    bundle.forEach((p) =>
      addItem({
        productId: p.id,
        name: p.name,
        price: p.price,
        image: p.image ?? "",
        size: p.sizes[0],
        color: p.colors[0]?.name ?? "Default",
      }),
    );
  }

  if (!extras.length) return null;

  return (
    <section aria-label="Frequently bought together">
      <p className="eyebrow">Complete the set</p>
      <h2 className="mt-2 font-serif text-3xl text-ink">Frequently bought together</h2>

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-3">
          {bundle.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3">
              <Link
                href={`/shop/${p.slug}`}
                className="group w-28 shrink-0"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                  <ProductImage product={p} sizes="112px" />
                </div>
                <p className="mt-2 line-clamp-1 text-xs text-ink">{p.name}</p>
                <p className="text-xs text-ink-soft">{formatAED(p.price)}</p>
              </Link>
              {i < bundle.length - 1 && (
                <span className="text-2xl text-bronze">+</span>
              )}
            </div>
          ))}
        </div>

        <div className="lg:ml-auto lg:text-right">
          <p className="text-sm text-ink-soft">
            Total for {bundle.length} pieces
          </p>
          <p className="font-serif text-3xl text-ink">{formatAED(total)}</p>
          <button
            type="button"
            onClick={addAll}
            className="mt-3 bg-bronze px-7 py-3 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
          >
            Add all to bag
          </button>
        </div>
      </div>
    </section>
  );
}
