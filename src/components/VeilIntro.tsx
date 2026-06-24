"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BrandLogo } from "./BrandLogo";

const SESSION_KEY = "mazal-veil-shown";
const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * First-visit "veil" opener: two elegant panels cover the screen, then part
 * to reveal the hero while the MAZAL logo fades/scales in. Plays once per
 * session (sessionStorage) and is skipped entirely — site shown immediately —
 * under prefers-reduced-motion. A failsafe timer guarantees it can never
 * trap the user even if an animation event is missed.
 */
export function VeilIntro() {
  const reduceMotion = useReducedMotion();
  // 'cover' on first paint so content never flashes; resolved in effect.
  const [phase, setPhase] = useState<"cover" | "part" | "done">("cover");

  useEffect(() => {
    const alreadyShown =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(SESSION_KEY) === "1";

    if (alreadyShown || reduceMotion) {
      const id = window.setTimeout(() => setPhase("done"), 0);
      return () => window.clearTimeout(id);
    }

    window.sessionStorage.setItem(SESSION_KEY, "1");

    // Lock scroll for the brief reveal.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const start = window.setTimeout(() => setPhase("part"), 380);
    const finish = window.setTimeout(() => setPhase("done"), 2100); // failsafe

    return () => {
      window.clearTimeout(start);
      window.clearTimeout(finish);
      document.body.style.overflow = prevOverflow;
    };
  }, [reduceMotion]);

  // Restore scroll the moment the veil is gone.
  useEffect(() => {
    if (phase === "done") document.body.style.overflow = "";
  }, [phase]);

  const parted = phase === "part";

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="veil"
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[100]"
          initial={false}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          {/* Left panel */}
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 bg-cream-soft"
            initial={{ x: "0%" }}
            animate={{ x: parted ? "-100%" : "0%" }}
            transition={{ duration: 1.2, ease: EASE }}
          />
          {/* Right panel */}
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 bg-cream-soft"
            initial={{ x: "0%" }}
            animate={{ x: parted ? "100%" : "0%" }}
            transition={{ duration: 1.2, ease: EASE }}
          />
          {/* Logo + wordmark */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={
              parted
                ? { opacity: 0, scale: 1.04, transition: { duration: 0.6, ease: EASE } }
                : { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE } }
            }
          >
            <BrandLogo size={72} />
            <span className="font-serif text-3xl tracking-[0.4em] text-ink">
              MAZAL
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
