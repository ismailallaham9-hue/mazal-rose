"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { PillButton } from "./PillButton";

export function HeroVideo({
  eyebrow = "MAZAL - Spring / Summer 2026",
  title = "Modern Modest Luxury",
  subtitle = "Fluid silhouettes and quiet confidence - pieces crafted to move with you, and to endure.",
  ctaText = "Explore the collection",
  ctaHref = "/shop",
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
}) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduceMotion) {
      v.pause();
      v.removeAttribute("autoplay");
    } else {
      v.play().catch(() => {});
    }
  }, [reduceMotion]);

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.9,
        delay: reduceMotion ? 0 : 0.15 * i,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <section
      aria-label={eyebrow}
      className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-ink"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay={!reduceMotion}
        muted
        loop
        playsInline
        poster="/video/hero-fashion-poster.jpg"
        preload="metadata"
        aria-hidden
      >
        <source src="/video/hero-fashion.webm" type="video/webm" />
        <source src="/video/hero-fashion.mp4" type="video/mp4" />
      </video>

      <div aria-hidden className="absolute inset-0 bg-ink/40" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/45"
      />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-[0.7rem] font-medium uppercase tracking-[0.36em] text-cream-soft/85 sm:text-xs"
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 max-w-4xl font-serif text-5xl font-light leading-[1.02] tracking-[0.01em] text-cream sm:text-6xl md:text-7xl lg:text-8xl"
        >
          {title}
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 max-w-xl text-sm leading-relaxed text-cream-soft/80 sm:text-base"
        >
          {subtitle}
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-9"
        >
          <PillButton href={ctaHref} tone="cream">
            {ctaText}
          </PillButton>
        </motion.div>
      </div>

      <Link
        href="#discover"
        aria-label="Scroll to discover the collection"
        className="group absolute inset-x-0 bottom-7 z-10 mx-auto flex w-fit flex-col items-center gap-2"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.3em] text-cream-soft/70 transition-colors group-hover:text-cream-soft">
          Scroll
        </span>
        <span
          aria-hidden
          className="relative flex h-10 w-[1.5px] justify-center overflow-hidden rounded-full bg-cream-soft/25"
        >
          <span className="mz-scroll-dot absolute top-0 h-3 w-[1.5px] rounded-full bg-cream-soft" />
        </span>
      </Link>
    </section>
  );
}
