import { Container } from "./Container";
import { Reveal } from "./Reveal";
import { RatingStars } from "./RatingStars";
import { SITE } from "@/lib/site";

/**
 * Social proof: Google rating header, verified customer testimonials,
 * and a Google-review CTA. ⚠️ Sample testimonials — replace with real ones.
 */
const TESTIMONIALS = [
  {
    name: "Aisha K.",
    location: "Dubai, UAE",
    rating: 5,
    text: "The Sukoon abaya is the most elegant piece I own. The fabric drapes beautifully and the finishing is flawless. MAZAL has become my go-to.",
    product: "Sukoon Abaya",
  },
  {
    name: "Latifa A.",
    location: "Riyadh, KSA",
    rating: 5,
    text: "Quiet luxury, exactly as promised. Delivery to Riyadh was fast and the packaging felt like a gift. I've already ordered three more pieces.",
    product: "Dhahab Kaftan",
  },
  {
    name: "Noura M.",
    location: "Doha, Qatar",
    rating: 5,
    text: "Timeless and so well made. I wore the Noor abaya to an evening event and received endless compliments. Worth every dirham.",
    product: "Noor Abaya",
  },
];

export function Testimonials() {
  return (
    <section className="bg-sand" aria-label="Customer reviews">
      <Container className="py-20 md:py-24">
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <p className="eyebrow">Loved by thousands</p>
          <h2 className="font-serif text-3xl text-ink md:text-5xl">
            {SITE.ratingAverage} out of 5, from {SITE.ratingCount.toLocaleString()} reviews
          </h2>
          <RatingStars rating={SITE.ratingAverage} size={22} />
          <a
            href={SITE.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-bronze hover:text-bronze-deep"
          >
            <GoogleGlyph /> Review us on Google
          </a>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <figure className="flex h-full flex-col bg-cream-soft p-7 ring-1 ring-sand-deep/40">
                <RatingStars rating={t.rating} size={15} />
                <blockquote className="mt-4 flex-1 text-ink-soft">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-6 border-t border-sand-deep/40 pt-4">
                  <p className="font-medium text-ink">{t.name}</p>
                  <p className="text-xs text-ink-soft">{t.location}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.12em] text-bronze">
                    <CheckGlyph /> Verified purchase · {t.product}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6Z" />
      <path fill="#EA4335" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.9 9.4 6.1 12 6.1Z" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
