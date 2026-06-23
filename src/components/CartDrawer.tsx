"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { formatAED } from "@/lib/format";
import { clsx } from "@/lib/clsx";
import { SITE } from "@/lib/site";

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    subtotal,
    count,
    setQuantity,
    removeItem,
  } = useCart();

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, closeCart]);

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden={!isOpen}
        onClick={closeCart}
        className={clsx(
          "fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm transition-opacity duration-500",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={clsx(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream-soft shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-sand-deep/50 px-6 py-5">
          <h2 className="font-serif text-xl tracking-wide">
            Your Bag{count > 0 && <span className="text-ink-soft"> ({count})</span>}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="text-ink transition-colors hover:text-bronze"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-serif text-2xl text-ink">Your bag is still.</p>
            <p className="text-sm text-ink-soft">
              Nothing here yet — explore pieces crafted with intention.
            </p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="mt-2 bg-bronze px-7 py-3 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
            >
              Discover the Collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-sand-deep/40 overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 py-5">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-sand">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-serif text-sm tracking-[0.3em] text-bronze/60">
                        M·L
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="font-serif text-lg leading-tight">{item.name}</p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="text-ink-soft transition-colors hover:text-bronze"
                        aria-label={`Remove ${item.name}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink-soft">
                      {item.color} · {item.size}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QtyStepper
                        value={item.quantity}
                        onChange={(q) => setQuantity(item.key, q)}
                      />
                      <p className="text-sm">{formatAED(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-sand-deep/50 px-6 py-6">
              {/* Free-shipping progress (AOV driver) */}
              {(() => {
                const threshold = SITE.freeShippingThreshold;
                const remaining = Math.max(0, threshold - subtotal);
                const pct = Math.min(100, (subtotal / threshold) * 100);
                return (
                  <div className="mb-5">
                    <p className="text-xs text-ink-soft">
                      {remaining > 0 ? (
                        <>
                          You&rsquo;re {formatAED(remaining)} away from{" "}
                          <strong className="text-ink">free delivery</strong>
                        </>
                      ) : (
                        <strong className="text-bronze">
                          You&rsquo;ve unlocked free delivery ✓
                        </strong>
                      )}
                    </p>
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-sand-deep/50">
                      <span
                        className="block h-full rounded-full bg-bronze transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-ink-soft">
                  Subtotal
                </span>
                <span className="font-serif text-2xl">{formatAED(subtotal)}</span>
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                Shipping & taxes calculated at checkout.
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-5 block w-full bg-bronze py-4 text-center text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="mt-3 block w-full text-center text-xs uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-bronze"
              >
                View Bag
              </Link>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

function QtyStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (q: number) => void;
}) {
  return (
    <div className="flex items-center border border-sand-deep">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="flex h-8 w-8 items-center justify-center text-ink-soft transition-colors hover:text-bronze"
        aria-label="Decrease quantity"
      >
        –
      </button>
      <span className="w-8 text-center text-sm" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-8 w-8 items-center justify-center text-ink-soft transition-colors hover:text-bronze"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
