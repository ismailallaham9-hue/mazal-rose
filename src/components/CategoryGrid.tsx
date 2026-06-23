import Image from "next/image";
import Link from "next/link";
import { Container } from "./Container";
import { Reveal } from "./Reveal";
import { CATEGORIES } from "@/lib/products";
import type { StoreCategory } from "@/lib/store";

/**
 * Editorial photography + descriptive alt text for each category card.
 * Images live in /public/images/categories/<value>.jpg (optimised 4:5).
 */
const CATEGORY_MEDIA: Record<string, { src: string; alt: string }> = {
  abayas: {
    src: "/images/categories/abayas.jpg",
    alt: "Three models in flowing white, black and grey abayas on a desert dune.",
  },
  kaftans: {
    src: "/images/categories/kaftans.jpg",
    alt: "Model walking in a mint-green embroidered kaftan.",
  },
  dresses: {
    src: "/images/categories/dresses.jpg",
    alt: "Model posing in a flowing mustard-yellow maxi dress.",
  },
  modest: {
    src: "/images/categories/modest.jpg",
    alt: "Three women in hijabs and jewel-tone modest dresses.",
  },
  formal: {
    src: "/images/categories/formal.jpg",
    alt: "Three women in tailored evening suits.",
  },
  casual: {
    src: "/images/categories/casual.jpg",
    alt: "Woman in a striped linen blazer and hijab on a sunlit street.",
  },
  throws: {
    src: "/images/categories/throws.jpg",
    alt: "Model draped in a black-and-white wave-patterned throw.",
  },
  scarves: {
    src: "/images/categories/scarves.jpg",
    alt: "Model wrapped in a soft red wool scarf in the snow.",
  },
};

/** Shop-by-category grid linking into the filtered collection. */
export function CategoryGrid({ categories }: { categories?: StoreCategory[] }) {
  const cats: StoreCategory[] = (categories?.length
    ? categories
    : CATEGORIES.map((c, order) => ({
        ...c,
        image: `/images/categories/${c.value}.jpg`,
        hidden: false,
        order,
      })))
    .filter((c) => !c.hidden)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 8);
  return (
    <section className="bg-cream" aria-label="Shop by category">
      <Container className="py-16 md:py-20">
        <Reveal className="text-center">
          <p className="eyebrow">Find your edit</p>
          <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
            Shop by category
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {cats.map((c, i) => {
            const media = c.image
              ? { src: c.image, alt: c.label }
              : CATEGORY_MEDIA[c.value];
            return (
              <Reveal key={c.value} delay={(i % 4) * 80}>
                <Link
                  href={`/shop?category=${c.value}`}
                  aria-label={`Shop ${c.label}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-[16px] bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                >
                  {media && (
                    <Image
                      src={media.src}
                      alt={media.alt}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                    />
                  )}

                  {/* Warm unifying tint — keeps every card soft & cohesive */}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[#cdb0a5] opacity-[0.12] mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0"
                  />

                  {/* Soft blush caption wash for readable cocoa text */}
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-cream via-cream/70 to-transparent"
                  />

                  <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                    <h3 className="font-serif text-xl text-ink transition-colors group-hover:text-bronze md:text-2xl">
                      {c.label}
                    </h3>
                    <p className="mt-0.5 text-xs text-ink-soft">{c.blurb}</p>
                    <span className="mt-2 inline-block text-[0.62rem] uppercase tracking-[0.22em] text-bronze">
                      Shop now →
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
