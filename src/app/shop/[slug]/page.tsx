import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { ProductReviews } from "@/components/ProductReviews";
import { FrequentlyBoughtTogether } from "@/components/FrequentlyBoughtTogether";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { ProductRail } from "@/components/ProductRail";
import {
  type Category,
  type Product,
  CATEGORY_LABEL,
} from "@/lib/products";
import { SITE } from "@/lib/site";
import { getProductsFromStore, getStoreData } from "@/lib/store";

export async function generateStaticParams() {
  const products = await getProductsFromStore();
  return products.map((p) => ({ slug: p.slug }));
}

function findProduct(products: Product[], slug: string) {
  return products.find((p) => p.slug === slug);
}

function relatedProducts(products: Product[], product: Product, limit = 4) {
  const same = products.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );
  const others = products.filter(
    (p) => p.category !== product.category && p.id !== product.id,
  );
  return [...same, ...others].slice(0, limit);
}

function completeTheLook(products: Product[], product: Product, limit = 3) {
  const complementary: Record<Category, Category[]> = {
    abayas: ["scarves", "bags", "shoes"],
    kaftans: ["accessories", "bags", "shoes"],
    dresses: ["shoes", "bags", "accessories"],
    modest: ["scarves", "shoes", "bags"],
    formal: ["bags", "shoes", "accessories"],
    casual: ["shoes", "accessories", "bags"],
    throws: ["scarves", "abayas", "kaftans"],
    scarves: ["abayas", "kaftans", "bags"],
    accessories: ["abayas", "dresses", "bags"],
    bags: ["abayas", "dresses", "shoes"],
    shoes: ["dresses", "abayas", "bags"],
  };
  const picks: Product[] = [];
  for (const cat of complementary[product.category] ?? []) {
    const found = products.find(
      (p) => p.category === cat && p.id !== product.id && !picks.includes(p),
    );
    if (found) picks.push(found);
  }
  return picks.slice(0, limit);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(await getProductsFromStore(), slug);
  if (!product) return { title: "Not found" };
  const title = product.seoTitle?.trim()
    ? product.seoTitle
    : `${product.name} — ${CATEGORY_LABEL[product.category]}`;
  const description = product.seoDescription?.trim()
    ? product.seoDescription
    : product.description.slice(0, 160);
  const ogImage = product.image ?? "/images/brand/hero.jpg";
  return {
    title,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title: `${product.name} · MAZAL`,
      description,
      images: [ogImage],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} · MAZAL`,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreData();
  const products = store.products;
  const settings = store.settings;
  const base = (settings.url || SITE.url).replace(/\/$/, "");
  const product = findProduct(products, slug);
  if (!product) notFound();

  const completeLook = completeTheLook(products, product, 3);
  const fbtExtras = completeLook.slice(0, 2);
  const related = relatedProducts(products, product, 4);

  // ── Structured data (Product + AggregateRating + Offer) ──
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [product.image ?? `${base}/images/brand/hero.jpg`],
    category: CATEGORY_LABEL[product.category],
    brand: { "@type": "Brand", name: settings.name },
    offers: {
      "@type": "Offer",
      priceCurrency: settings.currency,
      price: product.price,
      availability:
        (product.stock ?? 1) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${base}/shop/${product.slug}`,
    },
    ...(product.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount ?? 0,
          },
        }
      : {}),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How long does delivery take?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Express delivery across the GCC takes 2–4 working days, and worldwide 5–9 days. Free over AED 500.",
        },
      },
      {
        "@type": "Question",
        name: "What is your return policy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We offer 14-day hassle-free returns and exchanges on unworn items with tags attached. Full eligibility and exchange steps are available on the Returns & Exchanges page.",
        },
      },
      {
        "@type": "Question",
        name: "How do I choose my size?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use our size guide on the product page. If between sizes, we recommend sizing up for a relaxed drape, or contact us on WhatsApp for personal styling advice.",
        },
      },
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${base}/shop` },
      {
        "@type": "ListItem",
        position: 3,
        name: CATEGORY_LABEL[product.category],
        item: `${base}/shop?category=${product.category}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `${base}/shop/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            {
              label: CATEGORY_LABEL[product.category],
              href: `/shop?category=${product.category}`,
            },
            { label: product.name },
          ]}
        />
      </Container>

      <Container className="py-10">
        <ProductDetailClient product={product} settings={store.settings} />
      </Container>

      {/* Size guide */}
      <Container className="py-6">
        <section id="size-guide" className="scroll-mt-28 bg-cream-soft p-8 ring-1 ring-sand-deep/40">
          <p className="eyebrow">Fit</p>
          <h2 className="mt-2 font-serif text-3xl text-ink">Size guide</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Measurements in centimetres. Garments are designed for a relaxed,
            fluid drape — if between sizes, size down for a closer fit.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-sand-deep text-left text-xs uppercase tracking-[0.12em] text-ink-soft">
                  <th className="py-3 pr-4 font-medium">Size</th>
                  <th className="py-3 pr-4 font-medium">Bust</th>
                  <th className="py-3 pr-4 font-medium">Waist</th>
                  <th className="py-3 pr-4 font-medium">Length</th>
                </tr>
              </thead>
              <tbody className="text-ink">
                {[
                  ["XS", "82–86", "62–66", "138"],
                  ["S", "86–90", "66–70", "140"],
                  ["M", "90–96", "70–76", "142"],
                  ["L", "96–102", "76–82", "144"],
                  ["XL", "102–110", "82–90", "146"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-sand-deep/40">
                    {row.map((cell, i) => (
                      <td key={i} className="py-3 pr-4">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Container>

      {/* Frequently bought together */}
      {fbtExtras.length > 0 && (
        <Container className="py-12">
          <FrequentlyBoughtTogether main={product} extras={fbtExtras} />
        </Container>
      )}

      {/* Complete the look */}
      {completeLook.length > 0 && (
        <ProductRail
          eyebrow="Style it with"
          title="Complete the Look"
          products={completeLook}
          tone="sand"
        />
      )}

      {/* You may also like */}
      <ProductRail
        eyebrow="Similar styles"
        title="You May Also Like"
        products={related}
        tone="cream"
      />

      {/* Reviews */}
      <Container className="py-16">
        <ProductReviews
          product={product}
          googleReviewUrl={settings.googleReviewUrl}
        />
      </Container>

      {/* Recently viewed */}
      <RecentlyViewed excludeId={product.id} />
    </>
  );
}
