"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductImage } from "./ProductImage";
import { ProductBadge, Pill } from "./Badge";
import { RatingStars } from "./RatingStars";
import { Accordion } from "./Accordion";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { formatAED } from "@/lib/format";
import { SITE, whatsappLink } from "@/lib/site";
import {
  CATEGORY_LABEL,
  discountPercent,
  type Product,
} from "@/lib/products";
import { clsx } from "@/lib/clsx";

const RECENT_KEY = "mazal.recent.v1";

export function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(product.id);

  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState<string | null>(
    product.sizes.length === 1 ? product.sizes[0] : null,
  );
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  const off = discountPercent(product);
  const lowStock = typeof product.stock === "number" && product.stock <= 6;

  // Track recently viewed.
  useEffect(() => {
    try {
      const prev: string[] = JSON.parse(
        localStorage.getItem(RECENT_KEY) ?? "[]",
      );
      const next = [product.id, ...prev.filter((id) => id !== product.id)].slice(
        0,
        8,
      );
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [product.id]);

  function addToCart() {
    if (!size) {
      setSizeError(true);
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image ?? "",
      size,
      color: color.name,
      quantity: qty,
    });
  }

  const inquiryMsg = `Hello MAZAL — I'm interested in the ${product.name} (${formatAED(
    product.price,
  )}). Could you help me?`;

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Gallery */}
      <div className="relative">
        <div className="relative aspect-[4/5] overflow-hidden bg-sand ring-1 ring-sand-deep/40">
          <ProductImage
            product={product}
            sizes="(min-width:1024px) 50vw, 100vw"
            priority
          />
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
            {off && <Pill className="bg-[#8a3f2b] text-cream-soft">-{off}%</Pill>}
            {product.badges?.map((b) => <ProductBadge key={b} badge={b} />)}
          </div>
        </div>
      </div>

      {/* Buy box */}
      <div className="lg:py-2">
        <p className="eyebrow !text-bronze/70">
          {CATEGORY_LABEL[product.category]}
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-tight text-ink md:text-5xl">
          {product.name}
        </h1>

        {typeof product.rating === "number" && (
          <a href="#reviews" className="mt-3 inline-flex">
            <RatingStars rating={product.rating} count={product.reviewCount} size={16} />
          </a>
        )}

        <div className="mt-5 flex items-end gap-3">
          <span className="font-serif text-3xl text-ink">
            {formatAED(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="pb-1 text-base text-ink-soft line-through">
              {formatAED(product.compareAtPrice)}
            </span>
          )}
          {off && (
            <span className="pb-1 text-sm font-medium text-[#8a3f2b]">
              Save {off}%
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          Or 4 interest-free payments. Taxes included.
        </p>

        <p className="mt-6 text-ink-soft">{product.description}</p>

        {/* Colour */}
        <div className="mt-8">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink">
            Colour — <span className="text-ink-soft">{color.name}</span>
          </p>
          <div className="mt-3 flex gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c)}
                title={c.name}
                aria-pressed={color.name === c.name}
                className={clsx(
                  "h-9 w-9 rounded-full ring-1 ring-ink/15 transition-all",
                  color.name === c.name &&
                    "ring-2 ring-bronze ring-offset-2 ring-offset-cream",
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink">
              Size
            </p>
            <a href="#size-guide" className="text-xs text-bronze hover:underline">
              Size guide
            </a>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSize(s);
                  setSizeError(false);
                }}
                className={clsx(
                  "min-w-12 border px-3 py-2.5 text-sm transition-colors",
                  size === s
                    ? "border-bronze bg-bronze text-cream-soft"
                    : "border-sand-deep text-ink hover:border-bronze",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          {sizeError && (
            <p className="mt-2 text-xs text-[#8a3f2b]">Please select a size.</p>
          )}
        </div>

        {/* Stock urgency */}
        {lowStock && (
          <p className="mt-5 inline-flex items-center gap-2 text-sm text-[#8a3f2b]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#8a3f2b]" />
            Selling fast — only {product.stock} left in stock
          </p>
        )}

        {/* Quantity + add to cart */}
        <div className="mt-6 flex gap-3">
          <div className="flex items-center border border-sand-deep">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-12 w-11 items-center justify-center text-ink-soft hover:text-bronze"
              aria-label="Decrease quantity"
            >
              –
            </button>
            <span className="w-8 text-center text-sm">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="flex h-12 w-11 items-center justify-center text-ink-soft hover:text-bronze"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={addToCart}
            className="flex-1 bg-bronze py-3 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
          >
            Add to Bag — {formatAED(product.price * qty)}
          </button>
          <button
            type="button"
            onClick={() => toggle(product.id)}
            aria-pressed={wished}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className="flex h-12 w-12 items-center justify-center border border-sand-deep text-ink transition-colors hover:border-bronze hover:text-bronze"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={wished ? "var(--color-bronze)" : "none"} stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M12 20s-7-4.35-9.3-8.5C1.1 8.7 2.3 5.5 5.3 5.1c1.9-.25 3.4.9 4.7 2.4 1.3-1.5 2.8-2.65 4.7-2.4 3 .4 4.2 3.6 2.6 6.4C19 15.65 12 20 12 20Z" />
            </svg>
          </button>
        </div>

        {/* WhatsApp inquiry */}
        <a
          href={whatsappLink(inquiryMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 border border-[#25D366] py-3 text-xs uppercase tracking-[0.18em] text-[#1f8a5b] transition-colors hover:bg-[#25D366]/10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M.06 24l1.68-6.13A11.86 11.86 0 0 1 .16 11.9C.16 5.33 5.5 0 12.06 0a11.82 11.82 0 0 1 8.41 3.49 11.82 11.82 0 0 1 3.48 8.42c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 0 1-5.69-1.45L.06 24zM6.6 20.13c1.68.99 3.28 1.59 5.45 1.59 5.45 0 9.89-4.43 9.89-9.88a9.82 9.82 0 0 0-2.9-6.99 9.82 9.82 0 0 0-6.98-2.9c-5.46 0-9.9 4.44-9.9 9.89 0 2.27.6 3.86 1.65 5.55l-.99 3.62 3.78-.99z" />
          </svg>
          Ask about this piece on WhatsApp
        </a>

        {/* Mini trust row */}
        <div className="mt-6 grid grid-cols-3 gap-3 border-y border-sand-deep/50 py-4 text-center text-[0.68rem] text-ink-soft">
          <span>Free delivery over {SITE.currency} {SITE.freeShippingThreshold}</span>
          <span>14-day easy returns</span>
          <span>Secure checkout</span>
        </div>

        {/* Detail accordions */}
        <div className="mt-6">
          <Accordion
            items={[
              {
                title: "Material & Composition",
                content: (
                  <p>{product.material ?? "Premium fabric, ethically sourced."}</p>
                ),
              },
              {
                title: "Care Instructions",
                content: (
                  <ul className="list-inside list-disc space-y-1">
                    {(product.care ?? ["Dry clean only"]).map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                ),
              },
              {
                title: "Delivery & Shipping",
                content: (
                  <p>
                    Express delivery across the GCC in 2–4 working days, and
                    worldwide in 5–9 days. Complimentary on orders over{" "}
                    {SITE.currency} {SITE.freeShippingThreshold}. Each piece ships
                    in MAZAL signature packaging.
                  </p>
                ),
              },
              {
                title: "Returns & Exchanges",
                content: (
                  <p>
                    Enjoy 14-day hassle-free returns and exchanges on unworn
                    pieces with tags attached. Refunds are processed within 5–7
                    working days to your original payment method.
                  </p>
                ),
              },
            ]}
            defaultOpen={null}
          />
        </div>
      </div>
    </div>
  );
}
