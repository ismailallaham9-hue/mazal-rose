"use client";

import Link from "next/link";
import type { Product } from "@/lib/products";
import { CATEGORY_LABEL, discountPercent } from "@/lib/products";
import { formatAED } from "@/lib/format";
import { ProductImage } from "./ProductImage";
import { Tilt3D } from "./Tilt3D";
import { ProductBadge, Pill } from "./Badge";
import { RatingStars } from "./RatingStars";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(product.id);
  const off = discountPercent(product);
  const lowStock = typeof product.stock === "number" && product.stock <= 5;

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image ?? "",
      size: product.sizes[0],
      color: product.colors[0]?.name ?? "Default",
    });
  }

  return (
    <div className="group block">
      <Tilt3D className="relative aspect-[3/4] overflow-hidden bg-sand">
        <Link href={`/shop/${product.slug}`} aria-label={product.name}>
          <div className="relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105">
            <ProductImage product={product} priority={priority} />
          </div>
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col gap-1">
          {off && <Pill className="bg-[#8a3f2b] text-cream-soft">-{off}%</Pill>}
          {product.badges?.slice(0, 1).map((b) => (
            <ProductBadge key={b} badge={b} />
          ))}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={() => toggle(product.id)}
          aria-pressed={wished}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-cream-soft/85 text-ink backdrop-blur transition-colors hover:text-bronze"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={wished ? "var(--color-bronze)" : "none"} stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M12 20s-7-4.35-9.3-8.5C1.1 8.7 2.3 5.5 5.3 5.1c1.9-.25 3.4.9 4.7 2.4 1.3-1.5 2.8-2.65 4.7-2.4 3 .4 4.2 3.6 2.6 6.4C19 15.65 12 20 12 20Z" />
          </svg>
        </button>

        {/* Low stock + quick add */}
        {lowStock && (
          <div className="pointer-events-none absolute bottom-2 left-2">
            <Pill className="bg-ink/80 text-cream-soft">Only {product.stock} left</Pill>
          </div>
        )}
        <button
          type="button"
          onClick={quickAdd}
          className="absolute inset-x-0 bottom-0 translate-y-full bg-ink/90 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-cream-soft opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          Quick Add
        </button>
      </Tilt3D>

      <Link href={`/shop/${product.slug}`} className="mt-4 block">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow !text-bronze/70">{CATEGORY_LABEL[product.category]}</p>
            <h3 className="mt-1 font-serif text-xl leading-snug text-ink transition-colors group-hover:text-bronze">
              {product.name}
            </h3>
          </div>
          <div className="shrink-0 pt-1 text-right">
            <p className="text-sm text-ink">{formatAED(product.price)}</p>
            {product.compareAtPrice && (
              <p className="text-xs text-ink-soft line-through">
                {formatAED(product.compareAtPrice)}
              </p>
            )}
          </div>
        </div>

        {typeof product.rating === "number" && (
          <RatingStars rating={product.rating} count={product.reviewCount} className="mt-2" />
        )}

        <div className="mt-3 flex items-center gap-1.5">
          {product.colors.map((c) => (
            <span
              key={c.name}
              title={c.name}
              className="h-3 w-3 rounded-full ring-1 ring-ink/10"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </Link>
    </div>
  );
}
