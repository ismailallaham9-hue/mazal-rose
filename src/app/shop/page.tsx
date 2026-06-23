import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TrustBadges } from "@/components/TrustBadges";
import { ShopClient } from "@/components/ShopClient";
import { CATEGORIES, CATEGORY_LABEL, type Category } from "@/lib/products";
import { getStoreData } from "@/lib/store";

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
  const { category } = await searchParams;
  const store = await getStoreData();
  const customCategory = store.categories.find((c) => c.value === category);
  if (customCategory || isCategory(category)) {
    const label =
      customCategory?.label ?? CATEGORIES.find((c) => c.value === category)!.label;
    return {
      title: `${label} - Shop ${label}`,
      description: `Shop MAZAL ${label.toLowerCase()} - quiet-luxury modest fashion crafted with intention. Free GCC delivery over AED 500.`,
    };
  }
  return {
    title: store.pages.seo.shop?.title ?? "Shop All - The Collection",
    description:
      store.pages.seo.shop?.description ??
      "Shop the full MAZAL collection - abayas, kaftans, dresses, accessories and more. Premium modest fashion designed to endure.",
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const store = await getStoreData();
  const category = store.categories.some((c) => c.value === sp.category)
    ? sp.category
    : isCategory(sp.category)
      ? sp.category
      : undefined;
  const initialSort = sp.sort === "new" ? "new" : "featured";
  const storeCategory = store.categories.find((c) => c.value === category);
  const seedCategory = isCategory(category) ? category : undefined;

  const heading = category
    ? (storeCategory?.label ??
      (seedCategory
        ? COPY[seedCategory]?.title ?? CATEGORY_LABEL[seedCategory]
        : category))
    : store.pages.shop.title;
  const blurb = category
    ? (storeCategory?.blurb ??
      (seedCategory
        ? COPY[seedCategory]?.blurb ??
          `Explore MAZAL ${CATEGORY_LABEL[seedCategory].toLowerCase()} pieces.`
        : `Explore MAZAL ${heading.toLowerCase()} pieces.`))
    : store.pages.shop.blurb;

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            ...(category ? [{ label: heading }] : []),
          ]}
        />
      </Container>

      <Container className="py-10 text-center">
        <p className="eyebrow">MAZAL means Still</p>
        <h1 className="mt-3 font-serif text-4xl text-ink md:text-6xl">
          {heading}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-ink-soft">{blurb}</p>
      </Container>

      <Container className="pb-20">
        <Suspense fallback={<p className="text-ink-soft">Loading...</p>}>
          <ShopClient
            products={store.products}
            categories={store.categories}
            initialCategory={category}
            initialSort={initialSort}
          />
        </Suspense>
      </Container>

      <TrustBadges />
    </>
  );
}
