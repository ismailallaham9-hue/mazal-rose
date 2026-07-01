"use client";

import { useCart } from "@/lib/cart-context";
import { formatAED } from "@/lib/format";
import { PromoCode } from "./PromoCode";

/** Order totals with free-shipping progress, used on cart + checkout. */
export function OrderSummary({
  showPromo = true,
  children,
}: {
  showPromo?: boolean;
  children?: React.ReactNode;
}) {
  const { subtotal, discount, total, freeShippingThreshold } = useCart();
  const threshold = freeShippingThreshold;
  const remaining = Math.max(0, threshold - total);
  const pct = Math.min(100, (total / threshold) * 100);
  const freeShipping = remaining === 0;

  return (
    <div className="bg-cream-soft p-6 ring-1 ring-sand-deep/40">
      <h2 className="font-serif text-2xl text-ink">Order summary</h2>

      {/* Free shipping progress */}
      <div className="mt-5">
        <p className="text-xs text-ink-soft">
          {freeShipping ? (
            <strong className="text-bronze">
              You&rsquo;ve unlocked free delivery ✓
            </strong>
          ) : (
            <>
              Add {formatAED(remaining)} for{" "}
              <strong className="text-ink">free delivery</strong>
            </>
          )}
        </p>
        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-sand-deep/50">
          <span
            className="block h-full rounded-full bg-bronze transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </span>
      </div>

      {showPromo && (
        <div className="mt-5">
          <PromoCode />
        </div>
      )}

      <dl className="mt-5 space-y-2.5 border-t border-sand-deep/40 pt-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Subtotal</dt>
          <dd className="text-ink">{formatAED(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-bronze">
            <dt>Discount</dt>
            <dd>−{formatAED(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-ink-soft">Delivery</dt>
          <dd className="text-ink">
            {freeShipping ? "Free" : "Calculated at checkout"}
          </dd>
        </div>
        <div className="flex justify-between border-t border-sand-deep/40 pt-3 text-base">
          <dt className="font-medium text-ink">Total</dt>
          <dd className="font-serif text-xl text-ink">{formatAED(total)}</dd>
        </div>
      </dl>

      {children && <div className="mt-6">{children}</div>}

      <p className="mt-4 text-center text-[0.7rem] text-ink-soft">
        Secure encrypted checkout · Cards · Tabby · Cash on delivery
      </p>
    </div>
  );
}
