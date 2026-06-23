"use client";

import Link from "next/link";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/lib/wishlist-context";
import { PRODUCTS } from "@/lib/products";

export default function WishlistPage() {
  const { ids } = useWishlist();
  const items = PRODUCTS.filter((p) => ids.includes(p.id));

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      </Container>

      <Container className="py-12 text-center">
        <p className="eyebrow">Saved for later</p>
        <h1 className="mt-3 font-serif text-4xl text-ink md:text-6xl">
          Your Wishlist
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ink-soft">
          {items.length
            ? `${items.length} ${items.length === 1 ? "piece" : "pieces"} you love, kept in one place.`
            : "Tap the heart on any piece to save it here."}
        </p>
      </Container>

      <Container className="pb-24">
        {items.length ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {items.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 py-16 text-center">
            <p className="font-serif text-2xl text-ink">Nothing saved yet.</p>
            <Link
              href="/shop"
              className="bg-bronze px-8 py-3 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
            >
              Explore the Collection
            </Link>
          </div>
        )}
      </Container>
    </>
  );
}
