"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "./Container";

/**
 * Auto-playing, full-bleed editorial hero slider (Dribbble-style) themed to
 * MAZAL. Slow Ken-Burns zoom, crossfade between collection slides, animated
 * text/CTA entrance, and story-style progress bars. Pure CSS motion + state.
 */

type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  align?: "left" | "right";
};

const SLIDES: Slide[] = [
  {
    image: "/images/brand/hero.jpg",
    eyebrow: "New Evening Collection · After Dark",
    title: "After Dark",
    subtitle: "Eveningwear that moves like night — fluid, quiet, unforgettable.",
    ctaLabel: "Explore the Edit",
    ctaHref: "/shop?category=abayas",
    align: "left",
  },
  {
    image: "/images/brand/collection-feature.jpg",
    eyebrow: "The Signature Edit",
    title: "Effortless by Day",
    subtitle: "Considered silhouettes in warm, neutral tones — made to endure.",
    ctaLabel: "Shop the Collection",
    ctaHref: "/shop",
    align: "right",
  },
  {
    image: "/images/brand/lookbook-1.jpg",
    eyebrow: "Just Arrived",
    title: "New In",
    subtitle: "The latest pieces, crafted with intention and ready to wear.",
    ctaLabel: "Discover New In",
    ctaHref: "/shop?sort=new",
    align: "left",
  },
];

const DURATION = 6500;

export function CinematicHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(
      () => setActive((a) => (a + 1) % SLIDES.length),
      DURATION,
    );
    return () => clearTimeout(t);
  }, [active, paused]);

  const go = (i: number) => setActive((i + SLIDES.length) % SLIDES.length);

  return (
    <section
      aria-label="Featured collections"
      aria-roledescription="carousel"
      className="relative h-[86vh] min-h-[560px] w-full overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((s, i) => {
        const isActive = i === active;
        return (
          <div
            key={i}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
              isActive ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
          >
            <div className="absolute inset-0 overflow-hidden">
              <Image
                key={`${i}-${isActive}`}
                src={s.image}
                alt={s.title}
                fill
                priority={i === 0}
                sizes="100vw"
                className={`object-cover ${isActive ? "mz-kenburns" : "scale-105"}`}
              />
            </div>
            {/* Scrim for legibility */}
            <div
              className={`absolute inset-0 ${
                s.align === "right"
                  ? "bg-gradient-to-l from-ink/80 via-ink/30 to-transparent"
                  : "bg-gradient-to-r from-ink/80 via-ink/30 to-transparent"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
          </div>
        );
      })}

      {/* Text overlay (re-mounts per slide to replay entrance) */}
      <div className="relative z-20 flex h-full items-center">
        <Container>
          <div
            key={active}
            className={`max-w-xl ${
              SLIDES[active].align === "right" ? "ml-auto text-right" : ""
            }`}
          >
            <p
              className="mz-hero-in text-[0.72rem] font-medium uppercase tracking-[0.28em] text-cream-soft/90"
              style={{ animationDelay: "120ms" }}
            >
              {SLIDES[active].eyebrow}
            </p>
            <h1
              className="mz-hero-in mt-5 font-serif text-6xl leading-[0.95] text-cream-soft md:text-8xl"
              style={{ animationDelay: "240ms" }}
            >
              {SLIDES[active].title}
            </h1>
            <p
              className="mz-hero-in mt-6 max-w-md text-base text-cream-soft/85 md:text-lg"
              style={{
                animationDelay: "380ms",
                marginLeft: SLIDES[active].align === "right" ? "auto" : undefined,
              }}
            >
              {SLIDES[active].subtitle}
            </p>
            <div
              className="mz-hero-in mt-9 flex items-center gap-4"
              style={{
                animationDelay: "520ms",
                justifyContent:
                  SLIDES[active].align === "right" ? "flex-end" : "flex-start",
              }}
            >
              <Link
                href={SLIDES[active].ctaHref}
                className="group inline-flex items-center gap-3 bg-cream-soft px-8 py-4 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:bg-bronze hover:text-cream-soft"
              >
                {SLIDES[active].ctaLabel}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                >
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Controls: arrows */}
      <button
        type="button"
        onClick={() => go(active - 1)}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream-soft/40 text-cream-soft transition-colors hover:bg-cream-soft hover:text-ink md:flex"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => go(active + 1)}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream-soft/40 text-cream-soft transition-colors hover:bg-cream-soft hover:text-ink md:flex"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Progress indicators */}
      <div className="absolute bottom-7 left-0 right-0 z-30">
        <Container>
          <div className="flex items-center gap-3">
            {SLIDES.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to ${s.title}`}
                aria-current={i === active}
                className="relative h-[3px] w-14 overflow-hidden rounded-full bg-cream-soft/30"
              >
                {i === active && (
                  <span
                    key={active}
                    className="absolute inset-y-0 left-0 block rounded-full bg-cream-soft"
                    style={
                      paused
                        ? { width: "40%" }
                        : { animation: `mz-progress ${DURATION}ms linear forwards` }
                    }
                  />
                )}
              </button>
            ))}
            <span className="ml-2 font-serif text-sm text-cream-soft/80 tabular-nums">
              0{active + 1} <span className="text-cream-soft/40">/ 0{SLIDES.length}</span>
            </span>
          </div>
        </Container>
      </div>
    </section>
  );
}
