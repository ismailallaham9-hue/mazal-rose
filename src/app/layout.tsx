import type { CSSProperties } from "react";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://mazal.example"),
  title: {
    default: "MAZAL — Premium Modest Fashion · Abayas, Kaftans & More",
    template: "%s · MAZAL",
  },
  description:
    "MAZAL means Still. Timeless, calm elegance — abayas, kaftans, throws and scarves crafted with intention for the modern Gulf wardrobe.",
  icons: {
    icon: "/images/brand/logo.png",
  },
  openGraph: {
    title: "MAZAL — Still Elegant",
    description: "Effortless sophistication, designed to endure.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { content, pages, theme } = await getStoreData();
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
        <CartProvider>
          <WishlistProvider>
            <SmoothScroll />
            <VeilIntro />
            <AnnouncementMarquee messages={content.announcements} />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer content={pages.footer} />
            <CartDrawer />
            <FloatingWhatsApp />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
