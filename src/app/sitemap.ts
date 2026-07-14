import type { MetadataRoute } from "next";
import { getFreshStoreData } from "@/lib/store";
import { publishedSeo } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const store = await getFreshStoreData();
  const products = store.products;
  const articles = store.articles;
  const base = (store.settings.url || "https://mazal.ae").replace(/\/$/, "");
  // Content Studio can exclude an entity from the sitemap or mark it noindex.
  const excluded = (key: string) => {
    const r = publishedSeo(store.seoRecords?.[key]);
    return !!r && (r.sitemapInclude === false || r.index === false);
  };
  // Only indexable, public routes. /account, /wishlist, /cart and /checkout
  // are intentionally excluded (they're noindex/transactional).
  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/returns",
    "/shipping",
    "/privacy",
    "/terms",
    "/rewards",
    "/journal",
  ].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    }),
  );

  const luxuryAbayaCategory = store.categories.find((c) => c.value === "luxury-abaya");
  const luxuryAbayaRoutes =
    (!luxuryAbayaCategory || !luxuryAbayaCategory.hidden) && !excluded("category:luxury-abaya")
      ? [
          {
            url: `${base}/luxury-abaya`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
          },
        ]
      : [];

  const categoryRoutes = store.categories.filter((c) => c.value !== "luxury-abaya" && !c.hidden && !excluded(`category:${c.value}`)).map((c) => ({
    url: `${base}/shop?category=${c.value}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const emirateRoutes = [
    "dubai",
    "abu-dhabi",
    "sharjah",
    "ajman",
    "ras-al-khaimah",
  ].filter((e) => !excluded(`city:${e}`)).map((emirate) => ({
    url: `${base}/abayas/${emirate}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const productRoutes = products.filter((p) => !excluded(`product:${p.slug}`)).map((p) => ({
    url: `${base}/shop/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const articleRoutes = articles.filter((a) => !excluded(`article:${a.slug}`)).map((a) => ({
    url: `${base}/journal/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...luxuryAbayaRoutes,
    ...categoryRoutes,
    ...emirateRoutes,
    ...productRoutes,
    ...articleRoutes,
  ];
}
