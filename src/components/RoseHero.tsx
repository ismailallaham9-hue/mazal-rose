"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Container } from "./Container";
import { BrandLogo } from "./BrandLogo";
import { PillButton } from "./PillButton";

/**
 * Blush-satin editorial hero for the rose theme. A layered CSS gradient
 * evokes the silk of the monogram logo — no heavy media — with the wordmark
 * and CTA centred over it. Reduced-motion safe and RTL-ready.
 */
export function RoseHero() {
  const reduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.8,
        delay: reduceMotion ? 0 : 0.12 * i,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <section
      aria-label="MAZAL — the new season"
      className="relative flex h-[88vh] min-h-[560px] w-full items-center overflow-hidden"
      style={{
        backgroundColor: "#f3dccf",
        backgroundImage: [
          "radial-gradient(120% 85% at 18% 12%, rgba(255,247,242,0.95), transparent 58%)",
          "radial-gradient(95% 90% at 86% 28%, rgba(236,204,192,0.9), transparent 55%)",
          "radial-gradient(120% 110% at 62% 105%, rgba(226,180,166,0.95), transparent 60%)",
          "linear-gradient(135deg, #f8ece4 0%, #efd3c8 48%, #e4b8a9 100%)",
        ].join(","),
      }}
    >
      {/* Soft satin sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light"
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 48%, transparent 62%)",
        }}
      />

      <Container className="relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex justify-center"
          >
            <BrandLogo size={84} />
          </motion.div>

          <motion.p
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-7 text-[0.72rem] font-medium uppercase tracking-[0.34em] text-ink-soft"
          >
            Spring / Summer 2026
          </motion.p>

          <motion.h1
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-4 font-serif text-7xl leading-[0.95] tracking-[0.12em] text-ink md:text-8xl"
          >
            MAZAL
          </motion.h1>

          <motion.p
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mx-auto mt-5 max-w-md font-serif text-2xl text-ink/80 md:text-3xl"
          >
            Still elegance, draped in rose.
          </motion.p>

          <motion.p
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            dir="rtl"
            lang="ar"
            className="mt-3 font-serif text-xl text-ink-soft md:text-2xl"
          >
            الأناقة في السكون
          </motion.p>

          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-9 flex justify-center"
          >
            <PillButton href="/shop">Explore the collection</PillButton>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
