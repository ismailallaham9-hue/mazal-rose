import type { MetadataRoute } from "next";
import { getStoreData } from "@/lib/store";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const store = await getStoreData();
  const base = (store.settings.url || "https://mazal.ae").replace(/\/$/, "");
  // Admin area is always disallowed; when the site is marked non-indexable
  // (e.g. while still in preview) block everything.
  return store.seo.indexable
    ? {
        rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
        sitemap: `${base}/sitemap.xml`,
        host: base,
      }
    : {
        rules: { userAgent: "*", disallow: "/" },
      };
}
