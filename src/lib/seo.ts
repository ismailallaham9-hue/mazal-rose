/**
 * SEO helpers — turn the admin-controlled store SEO into Next.js Metadata.
 * Per-page overrides live in store.pages.seo[key]; global defaults and the
 * canonical site URL come from store.seo and store.settings.url.
 */
import type { Metadata } from "next";
import { getStoreData } from "@/lib/store";

/** Absolute-ize a site-relative path/image against the canonical site URL. */
function abs(base: string, value?: string): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `${base.replace(/\/$/, "")}${value.startsWith("/") ? "" : "/"}${value}`;
}

/**
 * Build page Metadata from the store.
 * @param pageKey  key into store.pages.seo (e.g. "home", "shop", "about")
 * @param path     canonical path for this page (e.g. "/about")
 */
export async function pageMetadata(opts: {
  pageKey?: string;
  path: string;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackImage?: string;
  /** Bypass the "%s · MAZAL" template (use for the home page). */
  absoluteTitle?: boolean;
  /** key into store.seoRecords for Content Studio overrides (robots, OG, etc.) */
  recordKey?: string;
}): Promise<Metadata> {
  const store = await getStoreData();
  const base = store.settings.url || "https://mazal.ae";
  const pageSeo = opts.pageKey ? store.pages.seo?.[opts.pageKey] : undefined;
  const rec = opts.recordKey ? store.seoRecords?.[opts.recordKey] : undefined;

  const title = rec?.seoTitle?.trim() || pageSeo?.title?.trim() || opts.fallbackTitle;
  const description =
    rec?.metaDescription?.trim() || pageSeo?.description?.trim() || opts.fallbackDescription;
  const image =
    abs(base, rec?.ogImage) ??
    abs(base, pageSeo?.ogImage) ??
    abs(base, opts.fallbackImage) ??
    abs(base, store.seo.defaultOgImage);
  const twImage = abs(base, rec?.twitterImage) ?? image;
  const canonical = rec?.canonical?.trim() || opts.path;
  const robots =
    rec && (rec.index === false || rec.follow === false)
      ? { index: rec.index !== false, follow: rec.follow !== false }
      : undefined;

  return {
    title: opts.absoluteTitle ? { absolute: title } : title,
    description,
    ...(robots ? { robots } : {}),
    alternates: { canonical },
    openGraph: {
      title: rec?.ogTitle?.trim() || title,
      description: rec?.ogDescription?.trim() || description,
      url: canonical,
      siteName: store.settings.name,
      type: "website",
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: rec?.twitterTitle?.trim() || rec?.ogTitle?.trim() || title,
      description: rec?.twitterDescription?.trim() || rec?.ogDescription?.trim() || description,
      images: twImage ? [twImage] : undefined,
    },
  };
}
