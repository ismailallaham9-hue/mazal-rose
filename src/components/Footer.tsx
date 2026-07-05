import Link from "next/link";
import { Container } from "./Container";
import { FooterNewsletter } from "./FooterNewsletter";
import type { SiteSettings } from "@/lib/store";

const LUXURY_ABAYA_LINK = { label: "Luxury Abaya", href: "/shop?category=luxury-abaya" };

const COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "The Journal", href: "/journal" },
      { label: "MAZAL Rewards", href: "/rewards" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Navigation",
    links: [
      { label: "New In", href: "/shop?sort=new" },
      { label: "Abayas", href: "/shop?category=abayas" },
      { label: "Kaftans", href: "/shop?category=kaftans" },
      { label: "Scarves", href: "/shop?category=scarves" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "My Account", href: "/account" },
      { label: "Returns & Exchanges", href: "/returns" },
      { label: "Shipping Policy", href: "/shipping" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "FAQ", href: "/contact" },
    ],
  },
];

export function Footer({
  content,
  showAccount = true,
  settings,
}: {
  content?: {
    newsletterTitle: string;
    newsletterBody: string;
    wordmark: string;
    columns: { title: string; links: { label: string; href: string }[] }[];
  };
  showAccount?: boolean;
  settings?: SiteSettings;
}) {
  const sourceColumns = content?.columns?.length ? content.columns : COLUMNS;
  const accountFilteredColumns = showAccount
    ? sourceColumns
    : sourceColumns.map((column) => ({
        ...column,
        links: column.links.filter((link) => link.href !== "/account"),
      }));
  const columns = accountFilteredColumns.map((column) =>
    column.title === "Navigation" && !column.links.some((link) => link.href === LUXURY_ABAYA_LINK.href)
      ? { ...column, links: [LUXURY_ABAYA_LINK, ...column.links] }
      : column,
  );
  return (
    <footer className="mt-24 overflow-hidden bg-ink text-cream-soft">
      <Container className="pt-16 md:pt-20">
        {/* Newsletter + links */}
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <FooterNewsletter
            title={content?.newsletterTitle}
            body={content?.newsletterBody}
            settings={settings}
          />

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-[0.7rem] uppercase tracking-[0.22em] text-cream-soft/60">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="link-underline text-sm text-cream-soft/85 hover:text-cream-soft"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Meta row */}
        <div className="mt-14 flex flex-col gap-3 border-t border-cream-soft/15 pt-8 text-xs text-cream-soft/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MAZAL. All rights reserved.</p>
          <p className="tracking-[0.18em] uppercase">MAZAL means Still.</p>
        </div>
      </Container>

      {/* Giant wordmark spanning the bottom edge */}
      <div aria-hidden className="mt-10 select-none px-2">
        <p className="translate-y-[0.12em] text-center font-serif font-medium leading-none tracking-[0.04em] text-cream-soft/10 text-[22vw]">
          {content?.wordmark || "MAZAL"}
        </p>
      </div>
    </footer>
  );
}
