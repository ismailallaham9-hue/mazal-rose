import Link from "next/link";
import { Reveal } from "./Reveal";
import { Container } from "./Container";
import { SITE } from "@/lib/site";
import type { SiteSettings } from "@/lib/store";

/**
 * Seasonal campaign band (Eid / Ramadan / Summer). Swap the copy and
 * href to run a campaign — drives urgency + first-order incentive.
 */
export function SeasonalBanner({
  eyebrow = "Limited Time · Seasonal Edit",
  title = "The Eid Edit",
  text = "Quiet statement pieces for the season of celebration — curated abayas, kaftans and accessories, ready to gift or keep.",
  ctaLabel = "Shop the Edit",
  ctaHref = "/shop?sort=new",
  settings,
}: {
  eyebrow?: string;
  title?: string;
  text?: string;
  ctaLabel?: string;
  ctaHref?: string;
  settings?: SiteSettings;
}) {
  const firstOrderCode = settings?.firstOrderCode ?? SITE.firstOrderCode;
  const firstOrderDiscount =
    settings?.firstOrderDiscount ?? SITE.firstOrderDiscount;

  return (
    <section
      className="bg-gradient-to-br from-bronze-deep via-bronze to-[#caa278] text-cream-soft"
      aria-label={title}
    >
      <Container className="flex flex-col items-center gap-5 py-16 text-center md:py-20">
        <Reveal className="flex flex-col items-center gap-5">
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.22em] text-cream-soft/90">
            {eyebrow}
          </p>
          <h2 className="max-w-2xl font-serif text-4xl leading-tight md:text-6xl">
            {title}
          </h2>
          <p className="max-w-xl text-cream-soft/90">{text}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={ctaHref}
              className="bg-cream-soft px-9 py-4 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:bg-cream"
            >
              {ctaLabel}
            </Link>
            <span className="text-sm text-cream-soft/90">
              New here? Use{" "}
              <strong className="font-semibold">{firstOrderCode}</strong> for{" "}
              {firstOrderDiscount}% off your first order
            </span>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
