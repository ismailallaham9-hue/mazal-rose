import Image from "next/image";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { TrustBadges } from "@/components/TrustBadges";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProductRail } from "@/components/ProductRail";
import { SeasonalBanner } from "@/components/SeasonalBanner";
import { Testimonials } from "@/components/Testimonials";
import { StoreStats } from "@/components/StoreStats";
import { InstagramFeed } from "@/components/InstagramFeed";
import { HeroVideo } from "@/components/HeroVideo";
import { EditorialHero } from "@/components/EditorialHero";
import { InlineChipHeadline } from "@/components/InlineChipHeadline";
import { Collection2026 } from "@/components/Collection2026";
import type { Metadata } from "next";
import type { Badge, Product } from "@/lib/products";
import { getStoreData } from "@/lib/store";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getStoreData();
  return pageMetadata({
    pageKey: "home",
    recordKey: "home",
    path: "/",
    fallbackTitle: seo.defaultTitle,
    fallbackDescription: seo.defaultDescription,
    absoluteTitle: true,
  });
}

function getBadged(products: Product[], badge: Badge) {
  return products.filter((p) => p.badges?.includes(badge));
}

function getNewArrivals(products: Product[], limit = 8) {
  return [...products]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, limit);
}

export default async function Home() {
  const {
    products: allProducts,
    content,
    categories,
    pages,
    settings,
  } = await getStoreData();
  const products = allProducts.filter((p) => p.published !== false);
  const home = pages.home;
  const newArrivals = getNewArrivals(products, 8);
  const bestSellers = getBadged(products, "bestseller");
  const trending = getBadged(products, "trending");

  return (
    <>
      {/* ── Full-screen cinematic video hero ── */}
      <HeroVideo
        eyebrow={content.heroEyebrow}
        title={content.heroTitle}
        subtitle={content.heroSubtitle}
        ctaText={content.heroCtaText}
        ctaHref={content.heroCtaHref}
      />
      <div id="discover" className="scroll-mt-24" aria-hidden />

      {/* ── Shop by Category — directly under the hero ───── */}
      <CategoryGrid categories={categories} />

      {/* ── Editorial magazine grid ──────────────────────── */}
      <EditorialHero />

      {/* ── Signature inline-chip headline ───────────────── */}
      <InlineChipHeadline />

      {/* ── Collection 2026 editorial cards ──────────────── */}
      <Collection2026 products={bestSellers.length ? bestSellers : newArrivals} />

      <TrustBadges />

      <ProductRail
        eyebrow="Just In"
        title="New Arrivals"
        products={newArrivals}
        viewAllHref="/shop?sort=new"
      />

      {/* ── Featured collection band ─────────────────────── */}
      <section className="bg-sand">
        <div className="grid items-stretch md:grid-cols-2">
          <div className="relative aspect-square md:aspect-auto">
            <Image
              src={home.editorialImage || "/images/brand/collection-feature.jpg"}
              alt={home.editorialTitle || "Effortless sophistication — a MAZAL look in a marble hall."}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex items-center">
            <Reveal className="px-6 py-16 md:px-14 lg:px-20">
              <p className="eyebrow">{home.editorialEyebrow}</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-ink md:text-5xl">
                {home.editorialTitle}
              </h2>
              <p className="mt-5 max-w-md text-ink-soft">{home.editorialBody}</p>
              {home.editorialCtaText && (
                <div className="mt-8">
                  <Button href={home.editorialCtaHref || "/shop"} variant="outline">
                    {home.editorialCtaText}
                  </Button>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      <ProductRail
        eyebrow="Customer Favourites"
        title="Best Sellers"
        products={bestSellers}
        viewAllHref="/shop"
        tone="cream"
      />

      <SeasonalBanner settings={settings} />

      <ProductRail
        eyebrow="Most Wanted"
        title="Trending Now"
        products={trending}
        viewAllHref="/shop"
        tone="sand"
      />

      {/* ── Brand story teaser ───────────────────────────── */}
      <section className="bg-cream">
        <Container className="grid items-center gap-12 py-20 md:grid-cols-2 md:py-28 lg:gap-20">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-sand ring-1 ring-sand-deep/40">
              <Image
                src="/images/brand/about-1.jpg"
                alt="Inside the MAZAL boutique."
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-4 hidden aspect-square w-1/2 overflow-hidden rounded-[16px] ring-4 ring-cream sm:block">
              <Image
                src="/images/brand/about-2.jpg"
                alt="MAZAL atelier detail."
                fill
                sizes="25vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <p className="eyebrow">{home.storyEyebrow}</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-ink md:text-5xl">
              {home.storyTitle}
            </h2>
            {(home.storyBody || "").split(/\n\n+/).filter(Boolean).map((para, i) => (
              <p key={i} className={i === 0 ? "mt-6 text-ink-soft" : "mt-4 text-ink-soft"}>
                {para}
              </p>
            ))}
            <div className="mt-8">
              <Button href="/about" variant="ghost">
                Read our story →
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── Statement band ───────────────────────────────── */}
      <section className="relative h-[56vh] min-h-[380px] w-full overflow-hidden">
        <Image
          src={home.statementImage || "/images/brand/statement.jpg"}
          alt="Still Elegant — MAZAL."
          fill
          sizes="100vw"
          className="object-cover"
        />
      </section>

      <Testimonials settings={settings} />

      <StoreStats stats={settings.stats} />

      <InstagramFeed social={settings.social} />
    </>
  );
}
