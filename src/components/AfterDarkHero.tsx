"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";

/**
 * Full-bleed "After Dark" video hero. The clip is a self-contained editorial
 * (model, title and CTA are in the footage), so the whole banner is a single
 * accessible link to the collection rather than carrying duplicate overlay
 * text. Autoplays muted & looping with a poster for first paint and both
 * source formats (webm preferred, mp4 fallback). Under prefers-reduced-motion
 * the video is paused and the poster frame is shown instead.
 */
export function AfterDarkHero() {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduceMotion) {
      v.pause();
      v.removeAttribute("autoplay");
    } else {
      // Nudge autoplay for browsers that don't honour the attribute immediately.
      v.play().catch(() => {});
    }
  }, [reduceMotion]);

  return (
    <section
      aria-label="After Dark — the new evening collection"
      className="relative w-full overflow-hidden bg-ink"
    >
      <Link
        href="/shop?category=formal"
        className="group block aspect-[43/29] w-full md:aspect-auto md:h-[88vh] md:min-h-[560px]"
      >
        <span className="sr-only">
          Explore the After Dark evening collection
        </span>
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay={!reduceMotion}
          muted
          loop
          playsInline
          poster="/video/after-dark-poster.jpg"
          preload="metadata"
          aria-hidden
        >
          <source src="/video/after-dark.webm" type="video/webm" />
          <source src="/video/after-dark.mp4" type="video/mp4" />
        </video>
        {/* Subtle base wash for depth + a focus ring for keyboard users */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 to-transparent ring-inset ring-bronze/0 transition group-focus-visible:ring-2 group-focus-visible:ring-bronze"
        />
      </Link>
    </section>
  );
}
