import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/products";
import { getStoreData } from "@/lib/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const store = await getStoreData();
  const products = store.products;
  const articles = store.articles;
  const base = (store.settings.url || "https://mazal.ae").replace(/\/$/, "");
  // Only indexable, public routes. /account, /wishlist, /cart and /checkout
  // are intentionally excluded (they're noindex/transactional).
  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/contact",
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

  const categoryRoutes = CATEGORIES.map((c) => ({
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
  ].map((emirate) => ({
    url: `${base}/abayas/${emirate}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const productRoutes = products.map((p) => ({
    url: `${base}/shop/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const articleRoutes = articles.map((a) => ({
    url: `${base}/journal/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...emirateRoutes,
    ...productRoutes,
    ...articleRoutes,
  ];
}
