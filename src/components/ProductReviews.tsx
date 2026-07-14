import { SITE } from "@/lib/site";
import type { Product } from "@/lib/products";
import type { SiteSettings } from "@/lib/store";

function hasRealGoogleReviewUrl(url?: string) {
  return Boolean(
    url &&
      /^https?:\/\//.test(url) &&
      !url.includes("YOUR_PLACE_ID") &&
      !url.includes("PLACE_ID"),
  );
}

export function ProductReviews({
  product,
  googleReviewUrl = SITE.googleReviewUrl,
}: {
  product: Product;
  googleReviewUrl?: SiteSettings["googleReviewUrl"];
}) {
  const fallbackReviewUrl = "/contact#review-form";
  const useExternalReviewUrl = hasRealGoogleReviewUrl(googleReviewUrl);
  const reviewUrl = useExternalReviewUrl ? googleReviewUrl : fallbackReviewUrl;

  return (
    <section id="reviews" aria-label="Customer reviews" className="scroll-mt-28">
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div>
          <p className="eyebrow">Reviews</p>
          <h2 className="mt-3 font-serif text-4xl text-ink">No reviews yet</h2>
          <p className="mt-3 text-sm text-ink-soft">
            Be the first to share your experience with this piece.
          </p>
          <a
            href={reviewUrl}
            target={useExternalReviewUrl ? "_blank" : undefined}
            rel={useExternalReviewUrl ? "noopener noreferrer" : undefined}
            aria-label={`Write a review for ${product.name}`}
            className="mt-6 inline-block bg-bronze px-6 py-3 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
          >
            Write a review
          </a>
        </div>

        <div className="bg-cream-soft p-8 ring-1 ring-sand-deep/40">
          <p className="font-serif text-2xl text-ink">
            Real customer reviews will appear here once they are submitted.
          </p>
          <p className="mt-3 max-w-xl text-sm text-ink-soft">
            Until then, MAZAL does not display sample ratings, sample review text,
            or customer photos.
          </p>
          <p className="mt-3 max-w-xl text-sm text-ink-soft">
            When a customer leaves a real review, this area will show practical
            details such as fabric feel, fit, delivery experience, styling notes,
            and the occasion the piece was worn for.
          </p>
          <p className="mt-3 max-w-xl text-sm text-ink-soft">
            We keep product feedback tied to genuine submissions only, so every
            visible rating and comment on MAZAL can be trusted by shoppers
            comparing luxury abayas, kaftans, and modest occasionwear.
          </p>
        </div>
      </div>
    </section>
  );
}
