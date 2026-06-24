"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * The rose-gold M·L monogram, shown as a circular badge. Uses the provided
 * logo.png when present; if the asset hasn't been dropped in yet, falls back
 * gracefully to a typographic monogram so the header never looks broken.
 */
export function BrandLogo({ size = 52 }: { size?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        aria-hidden
        className="flex items-center justify-center rounded-full border border-bronze/40 font-serif text-bronze"
        style={{ width: size, height: size, fontSize: size * 0.36 }}
      >
        M·L
      </span>
    );
  }

  return (
    <span
      className="block"
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/brand/logo-mark.png"
        alt="MAZAL"
        width={size * 2}
        height={size * 2}
        priority
        className="h-full w-full object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
