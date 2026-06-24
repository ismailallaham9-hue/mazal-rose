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
}): Promise<Metadata> {
  const store = await getStoreData();
  const base = store.settings.url || "https://mazal.ae";
  const pageSeo = opts.pageKey ? store.pages.seo?.[opts.pageKey] : undefined;

  const title = pageSeo?.title?.trim() || opts.fallbackTitle;
  const description = pageSeo?.description?.trim() || opts.fallbackDescription;
  const image =
    abs(base, pageSeo?.ogImage) ??
    abs(base, opts.fallbackImage) ??
    abs(base, store.seo.defaultOgImage);

  return {
    title: opts.absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: opts.path },
    openGraph: {
      title,
      description,
      url: opts.path,
      siteName: store.settings.name,
      type: "website",
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
