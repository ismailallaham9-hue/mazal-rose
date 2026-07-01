"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import type { SiteSettings } from "@/lib/store";

export function FooterNewsletter({
  title = "Join the MAZAL world",
  body = "Private previews, new arrivals, and quiet notes on craft - plus",
  settings,
}: {
  title?: string;
  body?: string;
  settings?: SiteSettings;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const firstOrderDiscount = settings?.firstOrderDiscount ?? SITE.firstOrderDiscount;
  const firstOrderCode = settings?.firstOrderCode ?? SITE.firstOrderCode;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !email.trim()) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "footer" }),
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
    <div className="max-w-md">
      <h3 className="font-serif text-2xl text-cream-soft">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-cream-soft/65">
        {body} {firstOrderDiscount}% off your first order with code{" "}
        <strong className="font-medium text-cream-soft">
          {firstOrderCode}
        </strong>
        .
      </p>

      {done ? (
        <p role="status" className="mt-5 font-serif text-xl text-bronze">
          Thank you - you&apos;re on the list.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="footer-email" className="sr-only">
            Email address
          </label>
          <input
            id="footer-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 rounded-full border border-cream-soft/25 bg-transparent px-5 py-3 text-sm text-cream-soft placeholder:text-cream-soft/40 focus:border-bronze focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-bronze px-7 py-3 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
          >
            {submitting ? "Saving..." : "Subscribe"}
          </button>
        </form>
      )}
      {error && <p className="mt-3 text-xs text-[#f4b8aa]">{error}</p>}
    </div>
  );
}
