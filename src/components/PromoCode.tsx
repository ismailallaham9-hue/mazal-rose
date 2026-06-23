"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { SITE } from "@/lib/site";

/** Promo / discount code input, shared by the cart and checkout. */
export function PromoCode() {
  const { promoCode, applyPromo, removePromo } = useCart();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (applyPromo(value)) {
      setError(false);
      setValue("");
    } else {
      setError(true);
    }
  }

  if (promoCode) {
    return (
      <div className="flex items-center justify-between bg-bronze/10 px-4 py-3 text-sm">
        <span className="text-ink">
          Code <strong className="font-semibold">{promoCode}</strong> applied —{" "}
          {SITE.firstOrderDiscount}% off
        </span>
        <button
          type="button"
          onClick={removePromo}
          className="text-xs uppercase tracking-[0.14em] text-bronze hover:text-bronze-deep"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          placeholder={`Promo code (try ${SITE.firstOrderCode})`}
          className="flex-1 border border-sand-deep bg-cream-soft px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-bronze focus:outline-none"
        />
        <button
          type="submit"
          className="border border-ink/25 px-5 text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:border-bronze hover:text-bronze"
        >
          Apply
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-[#8a3f2b]">
          That code isn&rsquo;t valid. Try {SITE.firstOrderCode}.
        </p>
      )}
    </form>
  );
}
