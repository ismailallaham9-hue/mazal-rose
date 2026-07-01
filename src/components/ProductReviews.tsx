import Image from "next/image";
import { RatingStars } from "./RatingStars";
import { SITE } from "@/lib/site";
import type { Product } from "@/lib/products";
import type { SiteSettings } from "@/lib/store";

/**
 * Reviews block: summary, rating distribution, verified sample reviews,
 * customer photos, and a Google-review CTA.
 * ⚠️ Sample reviews — wire to a real reviews source later.
 */
const SAMPLE = [
  {
    name: "Mariam S.",
    rating: 5,
    date: "2 weeks ago",
    title: "Beautifully made",
    text: "The quality exceeded my expectations. Fabric is luxurious and the fit is perfect. Will definitely order again.",
  },
  {
    name: "Hessa R.",
    rating: 5,
    date: "1 month ago",
    title: "My new favourite",
    text: "Elegant, comfortable, and true to size. The colour is exactly as shown. Fast delivery to Abu Dhabi.",
  },
  {
    name: "Fatima B.",
    rating: 4,
    date: "1 month ago",
    title: "Lovely piece",
    text: "Gorgeous and well finished. I sized up for a looser drape and it's perfect for evenings.",
  },
];

const PHOTOS = [
  "/images/brand/about-1.jpg",
  "/images/brand/lookbook-1.jpg",
  "/images/brand/collection-feature.jpg",
  "/images/brand/hero.jpg",
];

export function ProductReviews({
  product,
  googleReviewUrl = SITE.googleReviewUrl,
}: {
  product: Product;
  googleReviewUrl?: SiteSettings["googleReviewUrl"];
}) {
  const rating = product.rating ?? 4.8;
  const count = product.reviewCount ?? 0;
  const dist = [
    { stars: 5, pct: 82 },
    { stars: 4, pct: 12 },
    { stars: 3, pct: 4 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 1 },
  ];

  return (
    <section id="reviews" aria-label="Customer reviews" className="scroll-mt-28">
      <div className="grid gap-10 md:grid-cols-[300px_1fr]">
        {/* Summary */}
        <div>
          <p className="eyebrow">Reviews</p>
          <p className="mt-3 font-serif text-6xl text-ink">{rating.toFixed(1)}</p>
          <RatingStars rating={rating} size={18} className="mt-2" />
          <p className="mt-2 text-sm text-ink-soft">Based on {count} reviews</p>
          <div className="mt-5 space-y-1.5">
            {dist.map((d) => (
              <div key={d.stars} className="flex items-center gap-2 text-xs text-ink-soft">
                <span className="w-6">{d.stars}★</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand-deep/50">
                  <span
                    className="block h-full rounded-full bg-bronze"
                    style={{ width: `${d.pct}%` }}
                  />
                </span>
                <span className="w-8 text-right">{d.pct}%</span>
              </div>
            ))}
          </div>
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block bg-bronze px-6 py-3 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
          >
            Write a review
          </a>
          <p className="mt-2 text-[0.7rem] text-ink-soft">
            Earn 50 loyalty points for a verified review.
          </p>
        </div>

        {/* Reviews + photos */}
        <div>
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-ink">
              Customer photos
            </p>
            <div className="flex gap-3">
              {PHOTOS.map((src) => (
                <div
                  key={src}
                  className="relative h-20 w-20 overflow-hidden bg-sand ring-1 ring-sand-deep/40"
                >
                  <Image src={src} alt="Customer photo" fill sizes="80px" className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          <ul className="mt-8 divide-y divide-sand-deep/50">
            {SAMPLE.map((r) => (
              <li key={r.name} className="py-6">
                <div className="flex items-center justify-between gap-3">
                  <RatingStars rating={r.rating} size={14} />
                  <span className="text-xs text-ink-soft">{r.date}</span>
                </div>
                <p className="mt-2 font-serif text-lg text-ink">{r.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{r.text}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.1em] text-bronze">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                    <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {r.name} · Verified buyer
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
