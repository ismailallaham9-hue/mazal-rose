"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE } from "@/lib/site";

/**
 * Flash-sale urgency bar with a live countdown to the end of the day.
 * Rotates through a few promo messages for momentum.
 */
const MESSAGES = [
  `Flash Sale — up to 30% off selected styles`,
  `First order? Take ${SITE.firstOrderDiscount}% off with code ${SITE.firstOrderCode}`,
  `Complimentary express delivery over ${SITE.currency} ${SITE.freeShippingThreshold}`,
];

function nextMidnight(): number {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

export function CountdownPromoBar() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const target = nextMidnight();
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const r = setInterval(() => setIdx((i) => (i + 1) % MESSAGES.length), 5000);
    return () => clearInterval(r);
  }, []);

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  return (
    <div className="bg-ink text-cream-soft">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-6 py-2 text-center text-[0.68rem] tracking-[0.18em] uppercase">
        <Link href="/shop?sort=sale" className="hover:text-bronze transition-colors">
          {MESSAGES[idx]}
        </Link>
        {remaining !== null && remaining > 0 && (
          <span className="hidden items-center gap-1 text-bronze sm:inline-flex">
            <span aria-hidden>·</span>
            <span className="tabular-nums">Ends in {fmt(remaining)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
