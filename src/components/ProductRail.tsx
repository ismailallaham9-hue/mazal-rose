import Link from "next/link";
import { Container } from "./Container";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";
import type { Product } from "@/lib/products";
import { clsx } from "@/lib/clsx";

/**
 * Horizontal product rail (scroll-snap on mobile, 4-up grid on desktop).
 * Reused for New Arrivals / Best Sellers / Trending / Customer Favourites.
 */
export function ProductRail({
  eyebrow,
  title,
  products,
  viewAllHref = "/shop",
  tone = "cream",
  id,
}: {
  eyebrow?: string;
  title: string;
  products: Product[];
  viewAllHref?: string;
  tone?: "cream" | "sand";
  id?: string;
}) {
  if (!products.length) return null;
  return (
    <section
      id={id}
      aria-label={title}
      className={tone === "sand" ? "bg-sand" : "bg-cream"}
    >
      <Container className="py-16 md:py-20">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
              {title}
            </h2>
          </div>
          <Link
            href={viewAllHref}
            className="link-underline shrink-0 text-xs uppercase tracking-[0.2em] text-bronze"
          >
            View all
          </Link>
        </Reveal>

        <div
          className={clsx(
            "mt-10 flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory",
            "-mx-6 px-6 md:mx-0 md:grid md:grid-cols-4 md:gap-8 md:overflow-visible md:px-0 md:pb-0",
          )}
        >
          {products.map((p, i) => (
            <div
              key={p.id}
              className="w-[66%] shrink-0 snap-start sm:w-[42%] md:w-auto"
            >
              <ProductCard product={p} priority={i < 2} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
