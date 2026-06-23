"use client";

import { useRef } from "react";
import { clsx } from "@/lib/clsx";

/**
 * Interactive 3D tilt. Tracks the pointer and applies a real perspective
 * rotateX/rotateY transform with a subtle lift — premium depth, no deps.
 * Falls back to no motion when prefers-reduced-motion is set.
 */
export function Tilt3D({
  children,
  className,
  max = 9,
  scale = 1.02,
  glare = false,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  scale?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLSpanElement>(null);

  function prefersReduced() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height; // 0..1
    const rx = (0.5 - py) * max * 2;
    const ry = (px - 0.5) * max * 2;
    el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale})`;
    if (glare && glareRef.current) {
      glareRef.current.style.opacity = "1";
      glareRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.35), transparent 55%)`;
    }
  }

  function reset() {
    const el = ref.current;
    if (el) el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={clsx(
        "[transform-style:preserve-3d] [transition:transform_160ms_ease-out,box-shadow_300ms_ease-out] will-change-transform hover:shadow-2xl",
        className,
      )}
    >
      {children}
      {glare && (
        <span
          ref={glareRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        />
      )}
    </div>
  );
}
