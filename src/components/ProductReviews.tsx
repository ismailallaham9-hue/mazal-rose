import { SITE } from "@/lib/site";
import type { Product } from "@/lib/products";
import type { SiteSettings } from "@/lib/store";

export function ProductReviews({
  product,
  googleReviewUrl = SITE.googleReviewUrl,
}: {
  product: Product;
  googleReviewUrl?: SiteSettings["googleReviewUrl"];
}) {
  void product;

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
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
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
        </div>
      </div>
    </section>
  );
}
