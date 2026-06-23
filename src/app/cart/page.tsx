"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { OrderSummary } from "@/components/OrderSummary";
import { TrustBadges } from "@/components/TrustBadges";
import { useCart } from "@/lib/cart-context";
import { formatAED } from "@/lib/format";

export default function CartPage() {
  const { items, setQuantity, removeItem } = useCart();

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Bag" }]} />
      </Container>

      <Container className="py-10">
        <h1 className="font-serif text-4xl text-ink md:text-5xl">Your Bag</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-20 text-center">
            <p className="font-serif text-2xl text-ink">Your bag is still.</p>
            <p className="text-ink-soft">
              Nothing here yet — explore pieces crafted with intention.
            </p>
            <Link
              href="/shop"
              className="bg-bronze px-8 py-3 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
            >
              Discover the Collection
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
            {/* Line items */}
            <ul className="divide-y divide-sand-deep/40 border-y border-sand-deep/40">
              {items.map((item) => (
                <li key={item.key} className="flex gap-5 py-6">
                  <Link
                    href={`/shop`}
                    className="relative h-32 w-24 shrink-0 overflow-hidden bg-sand"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-serif text-sm tracking-[0.3em] text-bronze/60">
                        M·L
                      </span>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-serif text-xl text-ink">{item.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink-soft">
                          {item.color} · {item.size}
                        </p>
                      </div>
                      <p className="text-sm text-ink">
                        {formatAED(item.price * item.quantity)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center border border-sand-deep">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center text-ink-soft hover:text-bronze"
                          aria-label="Decrease quantity"
                        >
                          –
                        </button>
                        <span className="w-9 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                          className="flex h-9 w-9 items-center justify-center text-ink-soft hover:text-bronze"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="text-xs uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-bronze"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Summary */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <OrderSummary>
                <Link
                  href="/checkout"
                  className="block w-full bg-bronze py-4 text-center text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/shop"
                  className="mt-3 block text-center text-xs uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-bronze"
                >
                  Continue Shopping
                </Link>
              </OrderSummary>
            </div>
          </div>
        )}
      </Container>

      <TrustBadges />
    </>
  );
}
