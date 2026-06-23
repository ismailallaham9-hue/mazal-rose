import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/products";
import { getProductsFromStore } from "@/lib/store";
import { ARTICLES } from "@/lib/articles";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProductsFromStore();
  const base = SITE.url;
  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/wishlist",
    "/rewards",
    "/journal",
    "/account",
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

  const productRoutes = products.map((p) => ({
    url: `${base}/shop/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const articleRoutes = ARTICLES.map((a) => ({
    url: `${base}/journal/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...articleRoutes,
  ];
}
