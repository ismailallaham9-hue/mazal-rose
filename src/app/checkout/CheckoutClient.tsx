"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { OrderSummary } from "@/components/OrderSummary";
import { useCart } from "@/lib/cart-context";
import { formatAED } from "@/lib/format";
import { SITE, whatsappLink } from "@/lib/site";
import type { SiteSettings } from "@/lib/store";

type Payment = "cod" | "card" | "tabby";

export function CheckoutClient({
  settings,
}: {
  settings?: SiteSettings;
}) {
  const whatsapp = settings?.whatsapp ?? SITE.whatsapp;
  const googleReviewUrl = settings?.googleReviewUrl ?? SITE.googleReviewUrl;
  const { items, total, clear } = useCart();
  const [payment, setPayment] = useState<Payment>("cod");
  const [placed, setPlaced] = useState<{ order: string; amount: number } | null>(
    null,
  );

  function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    const order = `MZL-${Math.floor(100000 + Math.random() * 900000)}`;
    setPlaced({ order, amount: total });
    clear();
  }

  // ── Confirmation ──
  if (placed) {
    return (
      <Container className="flex flex-col items-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bronze/15 text-bronze">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="eyebrow mt-6">Order confirmed</p>
        <h1 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
          Thank you — your order is placed.
        </h1>
        <p className="mt-4 max-w-md text-ink-soft">
          Order <strong className="text-ink">{placed.order}</strong> ·{" "}
          {formatAED(placed.amount)}. A confirmation has been sent to your email.
          We&rsquo;ll be in touch as your pieces are prepared.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/shop"
            className="bg-bronze px-8 py-3 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
          >
            Continue Shopping
          </Link>
          <a
            href={whatsappLink(
              `Hello MAZAL — a question about my order ${placed.order}.`,
              whatsapp.number,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#25D366] px-8 py-3 text-xs uppercase tracking-[0.18em] text-[#1f8a5b] transition-colors hover:bg-[#25D366]/10"
          >
            Order support on WhatsApp
          </a>
        </div>
        <div className="mt-10 border-t border-sand-deep/50 pt-8">
          <p className="text-sm text-ink-soft">Loved your experience?</p>
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs uppercase tracking-[0.2em] text-bronze hover:text-bronze-deep"
          >
            Leave us a Google review · earn 50 points →
          </a>
        </div>
      </Container>
    );
  }

  // ── Empty bag ──
  if (items.length === 0) {
    return (
      <Container className="flex flex-col items-center py-24 text-center">
        <h1 className="font-serif text-3xl text-ink">Your bag is empty</h1>
        <p className="mt-3 text-ink-soft">Add a few pieces before checking out.</p>
        <Link
          href="/shop"
          className="mt-6 bg-bronze px-8 py-3 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
        >
          Discover the Collection
        </Link>
      </Container>
    );
  }

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Bag", href: "/cart" },
            { label: "Checkout" },
          ]}
        />
      </Container>

      <Container className="py-10">
        <h1 className="font-serif text-4xl text-ink md:text-5xl">Checkout</h1>

        <form
          onSubmit={placeOrder}
          className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]"
        >
          <div className="space-y-10">
            {/* Contact */}
            <Section title="Contact">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Email" name="email" type="email" />
                <Input label="Phone" name="phone" type="tel" />
              </div>
            </Section>

            {/* Shipping */}
            <Section title="Shipping address">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="First name" name="firstName" />
                <Input label="Last name" name="lastName" />
              </div>
              <Input label="Address" name="address" className="mt-4" />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input label="City" name="city" />
                <div>
                  <Label>Country</Label>
                  <select
                    name="country"
                    className="w-full border border-sand-deep bg-cream-soft px-4 py-3 text-sm text-ink focus:border-bronze focus:outline-none"
                  >
                    {["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman"].map(
                      (c) => (
                        <option key={c}>{c}</option>
                      ),
                    )}
                  </select>
                </div>
              </div>
            </Section>

            {/* Delivery */}
            <Section title="Delivery method">
              <div className="space-y-3">
                <Radio name="delivery" defaultChecked label="Standard — 2–4 days" hint="Free" />
                <Radio name="delivery" label="Express — 1–2 days" hint="AED 30" />
              </div>
            </Section>

            {/* Payment */}
            <Section title="Payment">
              <div className="space-y-3">
                <Radio
                  name="payment"
                  checked={payment === "cod"}
                  onChange={() => setPayment("cod")}
                  label="Cash on delivery"
                  hint="Pay when it arrives"
                />
                <Radio
                  name="payment"
                  checked={payment === "card"}
                  onChange={() => setPayment("card")}
                  label="Credit / debit card"
                  hint="Secure"
                />
                <Radio
                  name="payment"
                  checked={payment === "tabby"}
                  onChange={() => setPayment("tabby")}
                  label="Tabby — 4 interest-free payments"
                />
              </div>
              {payment !== "cod" && (
                <p className="mt-3 rounded bg-sand/60 px-4 py-3 text-xs text-ink-soft">
                  You&rsquo;ll be securely redirected to our payment provider to
                  complete payment. We never store your card details.
                </p>
              )}
            </Section>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <OrderSummary>
              <button
                type="submit"
                className="block w-full bg-bronze py-4 text-center text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
              >
                Place Order
              </button>
            </OrderSummary>
          </div>
        </form>
      </Container>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 font-serif text-2xl text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-ink">
      {children}
    </label>
  );
}

function Input({
  label,
  name,
  type = "text",
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <input
        name={name}
        type={type}
        required
        className="w-full border border-sand-deep bg-cream-soft px-4 py-3 text-sm text-ink focus:border-bronze focus:outline-none"
      />
    </div>
  );
}

function Radio({
  name,
  label,
  hint,
  checked,
  defaultChecked,
  onChange,
}: {
  name: string;
  label: string;
  hint?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between border border-sand-deep px-4 py-3.5 text-sm transition-colors hover:border-bronze has-[:checked]:border-bronze has-[:checked]:bg-bronze/5">
      <span className="flex items-center gap-3">
        <input
          type="radio"
          name={name}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          className="accent-bronze"
        />
        <span className="text-ink">{label}</span>
      </span>
      {hint && <span className="text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}
