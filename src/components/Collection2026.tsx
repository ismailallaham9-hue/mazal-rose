import Link from "next/link";
import { Container } from "./Container";
import { Reveal } from "./Reveal";
import { PillButton } from "./PillButton";
import { ProductImage } from "./ProductImage";
import { formatAED } from "@/lib/format";
import { categoryLabel, type Product } from "@/lib/products";

/** Small circular accent arrow badge used on the editorial cards. */
function ArrowBadge({ light = false }: { light?: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
        light
          ? "bg-cream-soft text-ink"
          : "bg-bronze text-cream-soft group-hover:bg-ink"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="rtl:-scale-x-100 transition-transform duration-300 group-hover:-rotate-45"
      >
        <path
          d="M5 12h14M13 6l6 6-6 6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function EditorialCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group relative block overflow-hidden rounded-[20px] bg-sand"
      aria-label={product.name}
    >
      <div className="relative aspect-[3/4]">
        <div className="relative h-full w-full transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]">
          <ProductImage
            product={product}
            sizes="(min-width: 768px) 30vw, 100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/5 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
        <div className="min-w-0">
          <h3 className="font-serif text-2xl leading-tight text-cream-soft">
            {product.name}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cream-soft/75">
            {categoryLabel(product.category)} · {formatAED(product.price)}
          </p>
        </div>
        <span className="shrink-0">
          <ArrowBadge />
        </span>
      </div>
    </Link>
  );
}

/**
 * "Collection 2026" — editorial heading + intro, then a row of product cards
 * (image, name, short descriptor, circular arrow badge) with one dark card
 * for contrast. Pass any products; the first two render as image cards.
 */
export function Collection2026({ products }: { products: Product[] }) {
  const [a, b] = products;

  return (
    <section className="bg-cream">
      <Container className="py-20 md:py-28">
        {/* Heading + intro */}
        <Reveal className="grid items-end gap-6 md:grid-cols-[1fr_1fr] md:gap-12">
          <div>
            <p className="eyebrow">The Edit</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-ink md:text-5xl">
              Collection 2026
            </h2>
          </div>
          <p className="text-ink-soft md:pb-2">
            Fashion is shaped by more than trend — it is shaped by culture,
            identity, and the women who wear it. Each piece is a quiet study in
            proportion, fabric, and ease.
          </p>
        </Reveal>

        {/* Cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
          {a && (
            <Reveal>
              <EditorialCard product={a} />
            </Reveal>
          )}
          {b && (
            <Reveal delay={80}>
              <EditorialCard product={b} />
            </Reveal>
          )}

          {/* Dark contrast card */}
          <Reveal
            delay={160}
            className="flex flex-col justify-between rounded-[20px] bg-ink p-7 text-cream-soft"
          >
            <div>
              <p className="eyebrow !text-bronze/90">New Arrival</p>
              <h3 className="mt-4 font-serif text-3xl leading-tight text-cream-soft">
                Scarves &amp; throws
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-cream-soft/70">
                The finishing note — weightless layers in warm neutral tones,
                made to drape and move.
              </p>
            </div>
            <div className="mt-8">
              <PillButton href="/shop?category=scarves" tone="cream">
                Explore collection
              </PillButton>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
