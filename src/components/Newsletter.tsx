"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !email.trim()) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "newsletter" }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Could not subscribe. Please try again.");
      return;
    }
    setDone(true);
  }

  return (
    <div className="mx-auto max-w-xl text-center">
      <p className="eyebrow">Stay Still</p>
      <h2 className="mt-4 font-serif text-4xl text-ink md:text-5xl">
        Get {SITE.firstOrderDiscount}% off your first order
      </h2>
      <p className="mt-4 text-ink-soft">
        Join the MAZAL world for private previews, new arrivals, and quiet notes
        on craft — and we&rsquo;ll send your welcome code{" "}
        <strong className="font-medium text-ink">{SITE.firstOrderCode}</strong>{" "}
        straight away.
      </p>

      {done ? (
        <p
          role="status"
          className="mt-8 font-serif text-2xl text-bronze"
        >
          Thank you — you&rsquo;re on the list.
        </p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 border border-sand-deep bg-cream-soft px-5 py-4 text-sm text-ink placeholder:text-ink-soft/60 focus:border-bronze focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-bronze px-8 py-4 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
          >
            {submitting ? "Saving..." : "Subscribe"}
          </button>
        </form>
      )}
      {error && <p className="mt-3 text-sm text-[#8a3f2b]">{error}</p>}
    </div>
  );
}
