import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductRail } from "@/components/ProductRail";
import { TrustBadges } from "@/components/TrustBadges";
import { Button } from "@/components/Button";
import { getStoreData } from "@/lib/store";
import { SITE } from "@/lib/site";

const EMIRATES: Record<string, { name: string; short: string }> = {
  dubai: { name: "Dubai", short: "Dubai" },
  "abu-dhabi": { name: "Abu Dhabi", short: "Abu Dhabi" },
  sharjah: { name: "Sharjah", short: "Sharjah" },
  ajman: { name: "Ajman", short: "Ajman" },
  "ras-al-khaimah": { name: "Ras Al Khaimah", short: "RAK" },
};

export function generateStaticParams() {
  return Object.keys(EMIRATES).map((emirate) => ({ emirate }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ emirate: string }>;
}): Promise<Metadata> {
  const { emirate } = await params;
  const e = EMIRATES[emirate];
  if (!e) return { title: "Not found" };
  const store = await getStoreData();
  const rec = store.seoRecords?.[`city:${emirate}`];
  const title = rec?.seoTitle?.trim() || `Luxury Abayas in ${e.short}`;
  const description =
    rec?.metaDescription?.trim() ||
    `Shop MAZAL luxury abayas, kaftans & modest dresses in ${e.name}. Premium fabrics, fast local delivery and free delivery over AED 500.`;
  const canonical = rec?.canonical?.trim() || `/abayas/${emirate}`;
  const robots =
    rec && (rec.index === false || rec.follow === false)
      ? { index: rec.index !== false, follow: rec.follow !== false }
      : undefined;
  return {
    title,
    description,
    ...(robots ? { robots } : {}),
    alternates: { canonical },
    openGraph: { title: rec?.ogTitle?.trim() || title, description: rec?.ogDescription?.trim() || description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title: rec?.twitterTitle?.trim() || title, description: rec?.twitterDescription?.trim() || description },
  };
}

export default async function EmiratePage({
  params,
}: {
  params: Promise<{ emirate: string }>;
}) {
  const { emirate } = await params;
  const e = EMIRATES[emirate];
  if (!e) notFound();

  const store = await getStoreData();
  const abayas = store.products.filter((p) => p.category === "abayas").slice(0, 8);
  const base = (store.settings.url || SITE.url).replace(/\/$/, "");

  const faq = [
    {
      q: `Do you deliver abayas in ${e.name}?`,
      a: `Yes — MAZAL delivers across ${e.name} and the wider UAE, with free delivery on orders over AED 500.`,
    },
    {
      q: `Are MAZAL abayas suitable for ${e.name} occasions?`,
      a: `Absolutely — from everyday wear to Eid and weddings, our luxury abayas and kaftans suit every ${e.name} occasion.`,
    },
    {
      q: `How can I get styling help in ${e.name}?`,
      a: `Message us on WhatsApp for personal styling advice and the latest delivery options for ${e.name}.`,
    },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${base}/shop` },
      {
        "@type": "ListItem",
        position: 3,
        name: `Abayas in ${e.short}`,
        item: `${base}/abayas/${emirate}`,
      },
    ],
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: `Abayas in ${e.short}` },
          ]}
        />
      </Container>

      <Container className="py-10 text-center">
        <p className="eyebrow">MAZAL — {e.name}</p>
        <h1 className="mt-3 font-serif text-4xl text-ink md:text-6xl">
          Luxury Abayas in {e.name}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-ink-soft">
          Discover MAZAL luxury abayas, designer kaftans and modest dresses in{" "}
          {e.name}. Crafted from premium crepe and silk-touch fabrics and
          designed for the modern Gulf wardrobe, every piece blends timeless
          elegance with effortless ease — delivered fast across {e.name} with
          complimentary delivery over AED 500.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/shop?category=abayas">Shop Abayas</Button>
          <Button href="/shop?category=kaftans" variant="outline">
            Shop Kaftans
          </Button>
        </div>
      </Container>

      <ProductRail
        eyebrow={`Loved in ${e.short}`}
        title={`Luxury Abayas for ${e.name}`}
        products={abayas}
        viewAllHref="/shop?category=abayas"
      />

      <Container className="py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl text-ink">
            Why women in {e.name} choose MAZAL
          </h2>
          <p className="mt-4 text-ink-soft">
            From everyday elegance to Eid and wedding occasions, women across{" "}
            {e.name} choose MAZAL for premium fabrics, considered tailoring and
            a calm, neutral palette that pairs with everything. Each abaya,
            kaftan and dress is made to be worn, loved and passed on — quiet
            luxury, designed to endure.
          </p>

          <h2 className="mt-10 font-serif text-3xl text-ink">
            Frequently asked questions
          </h2>
          <dl className="mt-4 space-y-5">
            {faq.map((f) => (
              <div key={f.q}>
                <dt className="font-medium text-ink">{f.q}</dt>
                <dd className="mt-1 text-ink-soft">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      <TrustBadges />
    </>
  );
}
