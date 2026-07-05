import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { getFreshStoreData } from "@/lib/store";
import { SITE } from "@/lib/site";
import { jsonLd } from "@/lib/seo";

const PAGE_PATH = "/luxury-abaya";
const PAGE_TITLE = "Luxury Abaya UAE | Designer Abayas Online | MAZAL";
const PAGE_DESCRIPTION =
  "Shop luxury abayas by MAZAL. Premium fabrics, elegant modest silhouettes, UAE delivery and free shipping over AED 500.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_PATH,
    type: "website",
  },
};

const FAQS = [
  {
    q: "What makes a MAZAL abaya a luxury abaya?",
    a: "MAZAL luxury abayas are designed around refined fabrics, graceful modest cuts, careful finishing and timeless silhouettes made for repeat wear.",
  },
  {
    q: "Do you deliver luxury abayas in the UAE?",
    a: "Yes. MAZAL offers UAE delivery, with complimentary delivery on eligible orders over AED 500.",
  },
  {
    q: "Can I wear a luxury abaya for Eid, weddings or evening events?",
    a: "Yes. Our luxury abayas include soft everyday pieces and elevated occasion styles suitable for Eid, weddings, majlis gatherings and evening events.",
  },
  {
    q: "How do I choose the right luxury abaya size?",
    a: "Each product page includes size options and fit information. For a relaxed modest drape, choose your usual size or contact MAZAL for styling help.",
  },
];

export default async function LuxuryAbayaPage() {
  const store = await getFreshStoreData();
  const base = (store.settings.url || SITE.url).replace(/\/$/, "");
  const products = store.products.filter(
    (product) => product.published !== false && product.category === "abayas",
  );

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Luxury Abaya", item: `${base}${PAGE_PATH}` },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Luxury Abaya - MAZAL",
    numberOfItems: products.length,
    itemListElement: products.slice(0, 24).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${base}/shop/${product.slug}`,
      name: product.name,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }} />

      <Container className="pt-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Luxury Abaya" }]} />
      </Container>

      <section className="bg-cream">
        <Container className="grid gap-10 py-14 md:grid-cols-[1.1fr_0.9fr] md:items-end md:py-20">
          <div>
            <p className="eyebrow">MAZAL Luxury Abaya</p>
            <h1 className="mt-4 font-serif text-5xl leading-tight text-ink md:text-7xl">
              Luxury Abaya
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Discover MAZAL luxury abayas crafted for modern modest dressing in
              the UAE. Each piece brings together refined fabrics, graceful
              movement and quiet detailing for Eid, weddings, majlis gatherings
              and elevated everyday wear.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#shop-luxury-abaya"
                className="bg-bronze px-7 py-3 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
              >
                Shop Luxury Abaya
              </Link>
              <Link
                href="/contact"
                className="border border-bronze px-7 py-3 text-xs uppercase tracking-[0.2em] text-bronze transition-colors hover:bg-bronze hover:text-cream-soft"
              >
                Ask for styling help
              </Link>
            </div>
          </div>
          <div className="bg-cream-soft p-7 ring-1 ring-sand-deep/40">
            <h2 className="font-serif text-3xl text-ink">Why choose MAZAL?</h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink-soft">
              <li>Premium crepe, satin-touch and fluid modest fabrics.</li>
              <li>Open and closed abaya silhouettes for day and evening.</li>
              <li>Elegant neutral tones designed for a timeless wardrobe.</li>
              <li>UAE delivery and complimentary delivery over AED 500.</li>
            </ul>
          </div>
        </Container>
      </section>

      <section id="shop-luxury-abaya" className="bg-cream-soft">
        <Container className="py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="eyebrow">Shop the edit</p>
            <h2 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
              Designer Luxury Abayas Online
            </h2>
            <p className="mt-4 text-ink-soft">
              Browse luxury abayas online from MAZAL, including soft everyday
              layers, evening abayas and occasion-ready modest pieces. Every
              product links to detailed sizing, materials and delivery notes.
            </p>
          </div>

          <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-cream">
        <Container className="grid gap-10 py-16 md:grid-cols-3 md:py-20">
          <div>
            <p className="eyebrow">Fabric</p>
            <h2 className="mt-3 font-serif text-3xl text-ink">Premium drape</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              A luxury abaya should move beautifully without feeling heavy.
              MAZAL focuses on fluid fabrics, elegant opacity and refined touch.
            </p>
          </div>
          <div>
            <p className="eyebrow">Occasion</p>
            <h2 className="mt-3 font-serif text-3xl text-ink">Day to evening</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Style a neutral luxury abaya with flats for daytime, or pair an
              embellished piece with heels and jewellery for Eid or weddings.
            </p>
          </div>
          <div>
            <p className="eyebrow">Fit</p>
            <h2 className="mt-3 font-serif text-3xl text-ink">Modest ease</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Choose your usual size for an elegant relaxed silhouette, and use
              each product size guide for exact fit notes before ordering.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-cream-soft">
        <Container className="py-16 md:py-20">
          <p className="eyebrow">Luxury Abaya FAQ</p>
          <h2 className="mt-3 font-serif text-4xl text-ink">Questions before you order</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {FAQS.map((faq) => (
              <div key={faq.q} className="bg-cream p-6 ring-1 ring-sand-deep/40">
                <h3 className="font-serif text-xl text-ink">{faq.q}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{faq.a}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
