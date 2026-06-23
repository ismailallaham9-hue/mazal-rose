import Link from "next/link";
import { clsx } from "@/lib/clsx";

/**
 * Signature MAZAL call-to-action: a dark pill with a small circular,
 * accent-coloured arrow badge on the trailing edge. On hover the badge
 * fills and the arrow tilts. RTL-aware (the arrow mirrors automatically).
 *
 * Renders an <a> (Next Link) when `href` is given, otherwise a <button>.
 */
type CommonProps = {
  children: React.ReactNode;
  className?: string;
  /** Visual tone — dark ink pill (default) or light cream pill for dark backgrounds. */
  tone?: "ink" | "cream";
};

type AsLink = CommonProps & { href: string };
type AsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

function ArrowBadge() {
  return (
    <span className="btn-pill-badge" aria-hidden>
      <svg
        className="btn-pill-arrow"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <path
          d="M5 12h14M13 6l6 6-6 6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function PillButton(props: AsLink | AsButton) {
  const { children, className, tone = "ink" } = props;
  const classes = clsx(
    "btn-pill group font-sans font-medium",
    tone === "cream" && "!bg-cream-soft !text-ink hover:!bg-cream",
    className,
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        <span>{children}</span>
        <ArrowBadge />
      </Link>
    );
  }

  const {
    href: _href,
    tone: _tone,
    children: _children,
    className: _className,
    ...rest
  } = props as AsButton & { tone?: "ink" | "cream"; href?: string };
  return (
    <button className={classes} {...rest}>
      <span>{children}</span>
      <ArrowBadge />
    </button>
  );
}
