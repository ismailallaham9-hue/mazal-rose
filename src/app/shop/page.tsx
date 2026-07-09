import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RichBody } from "@/components/RichText";
import { TrustBadges } from "@/components/TrustBadges";
import { ShopClient } from "@/components/ShopClient";
import { CATEGORIES, CATEGORY_LABEL, type Category } from "@/lib/products";
import { getFreshStoreData } from "@/lib/store";
import { SITE } from "@/lib/site";
import { absoluteUrl, jsonLd, publishedSeo } from "@/lib/seo";

const CATEGORY_FAQ: Record<string, { q: string; a: string }[]> = {
  abayas: [
    { q: "What makes a MAZAL abaya luxury?", a: "Premium crepe and silk fabrics, hand-finished seams, and timeless tailoring designed in the UAE." },
    { q: "Do you deliver abayas across the GCC?", a: "Yes — to the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman, with free delivery over AED 500." },
    { q: "Can I wear MAZAL abayas for Eid or weddings?", a: "Yes. Our embellished and evening abayas are made for Eid, weddings and special occasions." },
  ],
  kaftans: [
    { q: "Are kaftans suitable for UAE weddings?", a: "Yes — our designer kaftans are ideal for weddings, Eid and evening occasions across the Gulf." },
    { q: "What fabric are MAZAL kaftans made from?", a: "Breezy georgette and silk-touch fabrics that drape beautifully and suit the UAE climate." },
    { q: "How do I style a kaftan for Eid?", a: "Pair with heeled sandals and gold jewellery for evening, or keep it relaxed with flats by day." },
  ],
  dresses: [
    { q: "Are MAZAL dresses modest?", a: "Yes — our dresses offer thoughtful coverage with elegant, flattering cuts for day and evening." },
    { q: "Can I wear them to a UAE wedding?", a: "Absolutely. Our evening dresses are designed for weddings, engagements and Eid occasions." },
    { q: "What fabrics are used?", a: "Considered, enduring fabrics chosen for comfort and a graceful drape in the Gulf climate." },
  ],
};

type SP = { category?: string; sort?: string };

function isCategory(v?: string): v is Category {
  return !!v && CATEGORIES.some((c) => c.value === v);
}

const COPY: Partial<Record<Category, { title: string; blurb: string }>> = {
  abayas: {
    title: "Abayas",
    blurb:
      "Fluid open and closed abayas in matte crepe and silk-touch fabrics - the quiet foundation of a considered wardrobe.",
  },
  kaftans: {
    title: "Kaftans",
    blurb:
      "Relaxed, gilded silhouettes that move like air. From breezy georgette to hand-beaded statement pieces.",
  },
  dresses: {
    title: "Dresses",
    blurb: "Day-to-evening dressing in timeless lines and warm neutral tones.",
  },
  scarves: {
    title: "Scarves",
    blurb: "The finishing note - featherweight silks and modal-silk shawls.",
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const { category, sort } = await searchParams;
  const store = await getFreshStoreData();
  const customCategory = store.categories.find((c) => c.value === category);
  if (customCategory || isCategory(category)) {
    const label =
      customCategory?.label ?? CATEGORIES.find((c) => c.value === category)!.label;
    const rec = publishedSeo(store.seoRecords?.[`category:${category}`]);
    const seoMap: Record<string, { title: string; description: string }> = {
      abayas: {
        title: "Luxury Abayas Online UAE",
        description:
          "Discover MAZAL luxury abayas in the UAE — open, closed & embellished designs in premium crepe and silk. Free GCC delivery over AED 500. Shop now.",
      },
      kaftans: {
        title: "Designer Kaftans Online UAE",
        description:
          "Shop MAZAL designer kaftans in the UAE — flowing, gilded silhouettes in georgette and silk for Eid, weddings & evenings. Free GCC delivery over AED 500.",
      },
      dresses: {
        title: "Modest Luxury Dresses Online UAE",
        description:
          "Shop MAZAL modest luxury dresses in the UAE — elegant day-to-evening silhouettes in timeless cuts and warm tones. Free GCC delivery over AED 500.",
      },
    };
    const seo = seoMap[category as string];
    // Admin-editable category SEO (Categories tab) takes priority.
    return {
      title:
        rec?.seoTitle?.trim() ||
        customCategory?.seoTitle?.trim() ||
        seo?.title ||
        `${label} — Shop ${label} UAE`,
      description:
        rec?.metaDescription?.trim() ||
        customCategory?.seoDescription?.trim() ||
        seo?.description ||
        `Shop MAZAL ${label.toLowerCase()} — quiet-luxury modest fashion crafted with intention. Free GCC delivery over AED 500.`,
      ...(rec && (rec.index === false || rec.follow === false)
        ? { robots: { index: rec.index !== false, follow: rec.follow !== false } }
        : {}),
      alternates: { canonical: rec?.canonical?.trim() || `/shop?category=${category}` },
      openGraph: {
        title: rec?.ogTitle?.trim() || customCategory?.seoTitle?.trim() || seo?.title || `${label} — MAZAL`,
        description: rec?.ogDescription?.trim() || customCategory?.seoDescription?.trim() || seo?.description,
        url: rec?.canonical?.trim() || `/shop?category=${category}`,
        images: absoluteUrl(store.settings.url || SITE.url, rec?.ogImage || customCategory?.image)
          ? [absoluteUrl(store.settings.url || SITE.url, rec?.ogImage || customCategory?.image)!]
          : undefined,
        type: "website",
      },
    };
  }
  if (category === undefined && sort === "new") {
    const title = "New In | MAZAL";
    const description =
      "Discover the newest MAZAL arrivals - luxury abayas, kaftans, modest dresses and accessories crafted for quiet Gulf elegance.";
    return {
      title,
      description,
      alternates: { canonical: "/shop?sort=new" },
      openGraph: { title, description, url: "/shop?sort=new", type: "website" },
    };
  }
  const rec = publishedSeo(store.seoRecords?.shop);
  const title = rec?.seoTitle?.trim() || store.pages.seo.shop?.title || "Shop All - The Collection";
  const description =
    rec?.metaDescription?.trim() ||
    store.pages.seo.shop?.description ||
    "Shop the full MAZAL collection - abayas, kaftans, dresses, accessories and more. Premium modest fashion designed to endure.";
  return {
    title,
    description,
    ...(rec && (rec.index === false || rec.follow === false)
      ? { robots: { index: rec.index !== false, follow: rec.follow !== false } }
      : {}),
    alternates: { canonical: rec?.canonical?.trim() || "/shop" },
    openGraph: { title: rec?.ogTitle?.trim() || title, description: rec?.ogDescription?.trim() || description, url: rec?.canonical?.trim() || "/shop", type: "website" },
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  if (sp.category === "luxury-abaya") {
    redirect("/luxury-abaya");
  }

  const store = await getFreshStoreData();
  const category = store.categories.some((c) => c.value === sp.category)
    ? sp.category
    : isCategory(sp.category)
      ? sp.category
      : undefined;
  const initialSort = sp.sort === "new" ? "new" : "featured";
  const storeCategory = store.categories.find((c) => c.value === category);
  const seedCategory = isCategory(category) ? category : undefined;

  const isNewIn = !category && initialSort === "new";
  const heading = isNewIn
    ? "New In"
    : category
    ? (storeCategory?.label ??
      (seedCategory
        ? COPY[seedCategory]?.title ?? CATEGORY_LABEL[seedCategory]
        : category))
    : store.pages.shop.title;
  const blurb = isNewIn
    ? "The latest MAZAL arrivals, gathered in one place - refined abayas, kaftans, dresses and accessories crafted with quiet intention."
    : category
    ? (storeCategory?.blurb ??
      (seedCategory
        ? COPY[seedCategory]?.blurb ??
          `Explore MAZAL ${CATEGORY_LABEL[seedCategory].toLowerCase()} pieces.`
        : `Explore MAZAL ${heading.toLowerCase()} pieces.`))
    : store.pages.shop.blurb;

  const visibleProducts = store.products.filter((p) => p.published !== false);
  const listed = category
    ? visibleProducts.filter((p) => p.category === category)
    : visibleProducts;
  const base = (store.settings.url || SITE.url).replace(/\/$/, "");
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${base}/shop` },
      ...(category
        ? [{ "@type": "ListItem", position: 3, name: heading, item: `${base}/shop?category=${category}` }]
        : []),
    ],
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${heading} — MAZAL`,
    numberOfItems: listed.length,
    itemListElement: listed.slice(0, 24).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${base}/shop/${p.slug}`,
      name: p.name,
    })),
  };
  const faq = category ? CATEGORY_FAQ[category as string] : undefined;
  const faqJsonLd = faq && {
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }} />
      )}
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            ...(category ? [{ label: heading }] : []),
          ]}
        />
      </Container>

      {!category && (
        <Container className="py-10 text-center">
          <p className="eyebrow">MAZAL means Still</p>
          <h1 className="mt-3 font-serif text-4xl text-ink md:text-6xl">
            {heading}
          </h1>
          <RichBody text={blurb} className="mx-auto mt-4 max-w-2xl" />
        </Container>
      )}

      <Container className={category ? "py-10" : "pb-20"}>
        <Suspense fallback={<p className="text-ink-soft">Loading...</p>}>
          <ShopClient
            key={`${category ?? "all"}-${initialSort}-${sp.sort ?? ""}`}
            products={visibleProducts}
            categories={store.categories}
            initialCategory={category}
            initialSort={initialSort}
          />
        </Suspense>
      </Container>

      {category && (
        <Container className="pb-20 pt-4 text-center">
          <p className="eyebrow">MAZAL means Still</p>
          <h1 className="mt-3 font-serif text-4xl text-ink md:text-6xl">
            {heading}
          </h1>
          <RichBody text={blurb} className="mx-auto mt-4 max-w-4xl" />
        </Container>
      )}

      <TrustBadges />
    </>
  );
}
