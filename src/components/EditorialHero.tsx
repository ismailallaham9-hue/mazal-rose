import Image from "next/image";
import { Container } from "./Container";
import { Reveal } from "./Reveal";
import { PillButton } from "./PillButton";

/**
 * Asymmetric editorial "magazine" hero grid.
 *  - Left: one large editorial image.
 *  - Right: a stacked "Magazine / MAZAL 2026 / portrait" card above a dark
 *    statement card with a headline, short paragraph and CTA.
 * Rounded ~20px corners; mirrors cleanly for dir="rtl" via the grid order.
 */
export function EditorialHero() {
  return (
    <section aria-labelledby="editorial-hero-heading" className="bg-cream">
      <Container className="py-12 md:py-16">
        <div className="grid gap-4 md:grid-cols-[1.35fr_1fr] md:gap-5">
          {/* Large editorial image */}
          <Reveal className="group relative overflow-hidden rounded-[20px] bg-sand">
            <div className="relative aspect-[4/5] md:aspect-auto md:h-full md:min-h-[560px]">
              <Image
                src="/images/brand/lookbook-1.jpg"
                alt="A MAZAL look — a hijab portrait in a warm marble corridor."
                fill
                priority
                sizes="(min-width: 768px) 56vw, 100vw"
                className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/45 to-transparent p-6">
                <PillButton href="/luxury-abaya" tone="cream">
                  Luxury Abaya
                </PillButton>
              </div>
            </div>
          </Reveal>

          {/* Right column — magazine card + dark statement card */}
          <div className="flex flex-col gap-4 md:gap-5">
            {/* Magazine card */}
            <Reveal
              delay={80}
              className="group relative overflow-hidden rounded-[20px] bg-sand"
            >
              <div className="relative aspect-[4/3] sm:aspect-[16/10] md:aspect-auto md:h-[46%] md:min-h-[230px]">
                <Image
                  src="/images/brand/collection-feature.jpg"
                  alt="MAZAL 2026 — a model in an embroidered abaya on a marble staircase."
                  fill
                  sizes="(min-width: 768px) 36vw, 100vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
                  <span className="rounded-full bg-cream-soft/90 px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-ink backdrop-blur">
                    Magazine
                  </span>
                </div>
                <h2
                  id="editorial-hero-heading"
                  className="absolute inset-x-5 bottom-4 font-serif text-3xl leading-none text-cream-soft md:text-4xl"
                >
                  MAZAL <span className="text-bronze">2026</span>
                </h2>
              </div>
            </Reveal>

            {/* Dark statement card */}
            <Reveal
              delay={160}
              className="flex flex-1 flex-col justify-between rounded-[20px] bg-ink p-7 text-cream-soft md:p-8"
            >
              <div>
                <p className="eyebrow !text-bronze/90">Still Elegant</p>
                <p className="mt-4 font-serif text-2xl leading-snug text-cream-soft md:text-[1.7rem]">
                  Modesty shaped by craft, worn with quiet confidence.
                </p>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-soft/70">
                  An edit of fluid silhouettes and warm, neutral tones —
                  considered down to the last seam, made to be worn and worn
                  again.
                </p>
              </div>
              <div className="mt-7">
                <PillButton href="/luxury-abaya" tone="cream">
                  Explore Luxury Abaya
                </PillButton>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
