"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // No backend yet — wire this to your ESP / API route later.
    if (email.trim()) setDone(true);
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
            className="bg-bronze px-8 py-4 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
