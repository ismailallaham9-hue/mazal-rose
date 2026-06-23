import { clsx } from "@/lib/clsx";

/** Accessible star rating display (read-only). */
export function RatingStars({
  rating = 0,
  count,
  size = 14,
  className,
  showValue = false,
}: {
  rating?: number;
  count?: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span
      className={clsx("inline-flex items-center gap-1.5", className)}
      aria-label={`Rated ${rating} out of 5${count ? ` from ${count} reviews` : ""}`}
    >
      {/* Single shared half-star gradient (deterministic id, SSR-safe) */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <linearGradient id="mz-star-half">
            <stop offset="50%" stopColor="var(--color-bronze)" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
      <span className="inline-flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
          return <Star key={i} size={size} fill={fill} />;
        })}
      </span>
      {showValue && (
        <span className="text-xs font-medium text-ink">{rating.toFixed(1)}</span>
      )}
      {typeof count === "number" && (
        <span className="text-xs text-ink-soft">({count})</span>
      )}
    </span>
  );
}

function Star({ size, fill }: { size: number; fill: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="-mr-px">
      <path
        d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.9l-5.8 3.06 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z"
        fill={
          fill === 1
            ? "var(--color-bronze)"
            : fill === 0.5
              ? "url(#mz-star-half)"
              : "transparent"
        }
        stroke="var(--color-bronze)"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
