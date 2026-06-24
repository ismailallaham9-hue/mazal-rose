"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { Container } from "./Container";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { clsx } from "@/lib/clsx";

const NAV = [
  { label: "New In", href: "/shop?sort=new" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const { count, openCart } = useCart();
  const { count: wishCount } = useWishlist();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    const id = window.setTimeout(() => setMenuOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40">
      <div
        className={clsx(
          "border-b transition-colors duration-500",
          scrolled
            ? "border-sand-deep/60 bg-cream/90 backdrop-blur-md"
            : "border-transparent bg-cream",
        )}
      >
        <Container className="flex items-center justify-between py-4 md:py-5">
          {/* Logo + wordmark */}
          <Link href="/" className="flex items-center gap-3" aria-label="MAZAL home">
            <BrandLogo size={48} />
            <span className="font-serif text-2xl tracking-[0.3em] text-ink">
              MAZAL
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-10 md:flex" aria-label="Primary">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "link-underline text-xs uppercase tracking-[0.2em] transition-colors",
                    active ? "text-bronze" : "text-ink hover:text-bronze",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/account"
              className="hidden items-center text-ink transition-colors hover:text-bronze sm:flex"
              aria-label="My account"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
              </svg>
            </Link>
            <Link
              href="/wishlist"
              className="relative hidden items-center text-ink transition-colors hover:text-bronze sm:flex"
              aria-label={`Wishlist, ${wishCount} item${wishCount === 1 ? "" : "s"}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M12 20s-7-4.35-9.3-8.5C1.1 8.7 2.3 5.5 5.3 5.1c1.9-.25 3.4.9 4.7 2.4 1.3-1.5 2.8-2.65 4.7-2.4 3 .4 4.2 3.6 2.6 6.4C19 15.65 12 20 12 20Z" />
              </svg>
              {wishCount > 0 && (
                <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-bronze px-1 text-[0.6rem] font-medium text-cream-soft">
                  {wishCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={openCart}
              className="relative flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:text-bronze"
              aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}
            >
              <BagIcon />
              <span className="hidden sm:inline">Bag</span>
              {count > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-bronze px-1 text-[0.6rem] font-medium text-cream-soft">
                  {count}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden"
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </Container>

        {/* Mobile nav */}
        {menuOpen && (
          <nav
            className="border-t border-sand-deep/50 bg-cream md:hidden"
            aria-label="Mobile"
          >
            <Container className="flex flex-col py-2">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="py-3 text-sm uppercase tracking-[0.2em] text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </Container>
          </nav>
        )}
      </div>
    </header>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 8h12l-1 11a2 2 0 0 1-2 1.8H9A2 2 0 0 1 7 19L6 8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M9 8a3 3 0 0 1 6 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
