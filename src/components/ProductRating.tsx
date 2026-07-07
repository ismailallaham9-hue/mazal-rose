"use client";

import { useMemo, useState } from "react";
import type { RatingSummary } from "@/lib/store";
import { clsx } from "@/lib/clsx";

const SESSION_KEY = "mazal.rating.session.v1";

function ratingText(summary: RatingSummary | null) {
  if (!summary) return "No ratings yet";
  const label = summary.ratingCount === 1 ? "rating" : "ratings";
  return `${summary.ratingValue.toFixed(1)} stars from ${summary.ratingCount} ${label}`;
}

function sessionId() {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return "anonymous";
  }
}

export function ProductRating({
  productId,
  productSlug,
  initialSummary,
}: {
  productId: string;
  productSlug: string;
  initialSummary: RatingSummary | null;
}) {
  const [summary, setSummary] = useState<RatingSummary | null>(initialSummary);
  const [selected, setSelected] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const visibleText = useMemo(() => ratingText(summary), [summary]);

  async function submitRating(rating: number) {
    setSelected(rating);
    setPending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mazal-rating-session": sessionId(),
        },
        body: JSON.stringify({
          targetType: "product",
          targetId: productId,
          targetSlug: productSlug,
          rating,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
        summary?: RatingSummary;
      };

      if (!response.ok) {
        if (body.summary) setSummary(body.summary);
        setError(body.error || "We could not save your rating. Please try again.");
        return;
      }

      setSummary(body.summary ?? null);
      setMessage("Thank you. Your rating was saved.");
    } catch {
      setError("We could not save your rating. Please check your connection.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="bg-cream-soft p-6 ring-1 ring-sand-deep/40" aria-label="Product rating">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow">Customer rating</p>
          <p className="mt-2 font-serif text-2xl text-ink">{visibleText}</p>
          {!summary && (
            <p className="mt-1 text-sm text-ink-soft">
              Be the first to rate this piece.
            </p>
          )}
        </div>

        <div>
          <div className="flex gap-1" role="group" aria-label="Rate this product">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                disabled={pending}
                onClick={() => submitRating(rating)}
                aria-label={`Rate ${rating} out of 5 stars`}
                className={clsx(
                  "text-3xl leading-none text-bronze/40 transition hover:text-bronze focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze disabled:cursor-wait disabled:opacity-60",
                  (selected ?? Math.round(summary?.ratingValue ?? 0)) >= rating &&
                    "text-bronze",
                )}
              >
                ★
              </button>
            ))}
          </div>
          <p className="mt-2 min-h-5 text-sm text-ink-soft" aria-live="polite">
            {pending ? "Saving your rating..." : message || error}
          </p>
        </div>
      </div>
    </section>
  );
}
