import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { connection } from "next/server";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { AnnouncementMarquee } from "@/components/AnnouncementMarquee";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { SmoothScroll } from "@/components/SmoothScroll";
import { VeilIntro } from "@/components/VeilIntro";
import { getStoreData } from "@/lib/store";
import { jsonLd } from "@/lib/seo";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { seo, settings, theme } = await getStoreData();
  const base = settings.url || "https://mazal.ae";
  let metadataBase: URL | undefined;
  try {
    metadataBase = new URL(base);
  } catch {
    metadataBase = new URL("https://mazal.ae");
  }
  const ogImage = seo.defaultOgImage || "/images/brand/logo.png";
  const template = seo.titleTemplate.includes("%s")
    ? seo.titleTemplate
    : "%s · MAZAL";

  return {
    metadataBase,
    title: {
      default: seo.defaultTitle,
      template,
    },
    description: seo.defaultDescription,
    icons: { icon: theme.logo || "/images/brand/logo.png" },
    robots: seo.indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      url: base,
      siteName: settings.name,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      images: [ogImage],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await connection();
  const { content, pages, theme, settings } = await getStoreData();
  const base = settings.url || "https://mazal.ae";
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.name,
    url: base,
    logo: `${base.replace(/\/$/, "")}${theme.logo || "/images/brand/logo.png"}`,
    sameAs: [
      settings.social.instagram,
      settings.social.tiktok,
      settings.social.pinterest,
    ].filter(Boolean),
  };
  const themeStyle = {
    "--color-cream": theme.cream,
    "--color-cream-soft": theme.creamSoft,
    "--color-sand": theme.sand,
    "--color-sand-deep": theme.sandDeep,
    "--color-bronze": theme.bronze,
    "--color-bronze-deep": theme.bronzeDeep,
    "--color-ink": theme.ink,
    "--color-ink-soft": theme.inkSoft,
    "--radius-admin": theme.radius,
  } as CSSProperties;

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink" style={themeStyle}>
        {/* Google tag (gtag.js) — loads on every page via the root layout */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7RP6QP5FWM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7RP6QP5FWM');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(orgJsonLd) }}
        />
        <CartProvider settings={settings}>
          <WishlistProvider>
            <SmoothScroll />
            <VeilIntro />
            <AnnouncementMarquee messages={content.announcements} />
            <Header showAccount={settings.showCustomerAccount} />
            <main className="flex-1">{children}</main>
            <Footer
              content={pages.footer}
              showAccount={settings.showCustomerAccount}
              settings={settings}
            />
            <CartDrawer />
            <FloatingWhatsApp whatsapp={settings.whatsapp} />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
