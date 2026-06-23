import type { Badge as BadgeType } from "@/lib/products";
import { clsx } from "@/lib/clsx";

const LABEL: Record<BadgeType, string> = {
  new: "New In",
  bestseller: "Bestseller",
  trending: "Trending",
  limited: "Limited",
  sale: "Sale",
};

const STYLE: Record<BadgeType, string> = {
  new: "bg-ink text-cream-soft",
  bestseller: "bg-bronze text-cream-soft",
  trending: "bg-cream-soft text-bronze ring-1 ring-bronze/40",
  limited: "bg-espresso text-cream-soft",
  sale: "bg-[#8a3f2b] text-cream-soft",
};

// espresso isn't a token utility; map to ink for the rare "limited" case
const STYLE_FIX: Record<BadgeType, string> = {
  ...STYLE,
  limited: "bg-[#5c4a3a] text-cream-soft",
};

export function ProductBadge({
  badge,
  className,
}: {
  badge: BadgeType;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.14em]",
        STYLE_FIX[badge],
        className,
      )}
    >
      {LABEL[badge]}
    </span>
  );
}

/** Generic pill for ad-hoc labels (e.g. discount %). */
export function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.14em]",
        className,
      )}
    >
      {children}
    </span>
  );
}
