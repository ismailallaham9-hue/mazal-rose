/**
 * MAZAL content store — the single source of truth the admin panel edits and
 * the public site reads.
 *
 * Persistence is automatic by environment:
 *   • Production (Vercel) → a JSON blob in Vercel Blob storage
 *     (needs the BLOB_READ_WRITE_TOKEN env var, added when you enable Blob).
 *   • Production (Render) → a mounted disk directory via MAZAL_DATA_DIR.
 *   • Local dev          → a JSON file at /data/store.json
 *   • Neither configured  → the built-in seed catalogue (read-only)
 *
 * Images upload to Vercel Blob, a Render disk, or /public/uploads in dev.
 */
import "server-only";
import { ARTICLES, type Article } from "./articles";
import { CATEGORIES, PRODUCTS, type Product } from "./products";
import { SITE } from "./site";

export type SiteContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaHref: string;
  announcements: string[];
};

export type StoreData = {
  products: Product[];
  content: SiteContent;
  theme: SiteTheme;
  categories: StoreCategory[];
  articles: Article[];
  settings: SiteSettings;
  media: MediaAsset[];
  pages: PageContent;
  seo: SeoSettings;
  updatedAt?: string;
};

/** Global SEO defaults the admin panel controls. The site URL lives in
 *  settings.url so it stays the single source of truth for canonical links. */
export type SeoSettings = {
  defaultTitle: string;
  titleTemplate: string; // must contain %s, e.g. "%s · MAZAL"
  defaultDescription: string;
  defaultOgImage: string; // site-relative or absolute URL for social cards
  indexable: boolean; // false → ask search engines not to index the site
};

export type StoreCategory = {
  value: string;
  label: string;
  blurb: string;
  image?: string;
  order: number;
  hidden?: boolean;
  seoTitle?: string; // admin-editable SEO title for the category page
  seoDescription?: string; // admin-editable meta description
};

export type SiteTheme = {
  cream: string;
  creamSoft: string;
  sand: string;
  sandDeep: string;
  bronze: string;
  bronzeDeep: string;
  ink: string;
  inkSoft: string;
  radius: string;
  logo?: string;
};

export type SiteSettings = {
  name: string;
  tagline: string;
  url: string;
  currency: string;
  freeShippingThreshold: number;
  firstOrderCode: string;
  firstOrderDiscount: number;
  whatsapp: {
    number: string;
    defaultMessage: string;
    stylingMessage: string;
    orderSupportMessage: string;
  };
  googleReviewUrl: string;
  ratingAverage: number;
  ratingCount: number;
  social: {
    instagram: string;
    instagramHandle: string;
    tiktok: string;
    pinterest: string;
  };
  stats: { value: string; label: string }[];
  contact: {
    email: string;
    phone: string;
    addressLine: string;
    hours: string;
  };
};

export type MediaAsset = {
  id: string;
  url: string;
  name: string;
  type: string;
  createdAt: string;
};

export type PageContent = {
  home: Record<string, string>;
  about: Record<string, string>;
  contact: Record<string, string>;
  shop: Record<string, string>;
  footer: {
    newsletterTitle: string;
    newsletterBody: string;
    wordmark: string;
    columns: { title: string; links: { label: string; href: string }[] }[];
  };
  seo: Record<string, { title?: string; description?: string; ogImage?: string }>;
};

const STORE_KEY = "mazal/store.json";
const RENDER_DATA_DIR = process.env.MAZAL_DATA_DIR || process.env.RENDER_DATA_DIR;

export const DEFAULT_CONTENT: SiteContent = {
  heroEyebrow: "MAZAL — Spring / Summer 2026",
  heroTitle: "Modern Modest Luxury",
  heroSubtitle:
    "Fluid silhouettes and quiet confidence — pieces crafted to move with you, and to endure.",
  heroCtaText: "Explore the collection",
  heroCtaHref: "/shop",
  announcements: [
    "MAZAL 2026 — the new collection has arrived",
    "Complimentary express delivery over AED 500",
    "Private atelier appointments now open in Dubai",
    "Worldwide shipping to 60+ countries",
  ],
};

export const DEFAULT_THEME: SiteTheme = {
  cream: "#fdf7f3",
  creamSoft: "#f8ebe3",
  sand: "#f0d6ca",
  sandDeep: "#e2bcae",
  bronze: "#c2887a",
  bronzeDeep: "#a86b5c",
  ink: "#46352e",
  inkSoft: "#836b61",
  radius: "16px",
  logo: "/images/brand/logo.png",
};

export const DEFAULT_SEO: SeoSettings = {
  defaultTitle: "Luxury Abayas & Kaftans Online UAE | MAZAL",
  titleTemplate: "%s · MAZAL",
  defaultDescription:
    "Shop MAZAL luxury abayas, kaftans & modest dresses online in the UAE. Timeless Gulf elegance, premium fabrics and free delivery over AED 500.",
  defaultOgImage: "/images/brand/logo.png",
  indexable: true,
};

export const DEFAULT_SETTINGS: SiteSettings = {
  name: SITE.name,
  tagline: SITE.tagline,
  url: SITE.url,
  currency: SITE.currency,
  freeShippingThreshold: SITE.freeShippingThreshold,
  firstOrderCode: SITE.firstOrderCode,
  firstOrderDiscount: SITE.firstOrderDiscount,
  whatsapp: { ...SITE.whatsapp },
  googleReviewUrl: SITE.googleReviewUrl,
  ratingAverage: SITE.ratingAverage,
  ratingCount: SITE.ratingCount,
  social: { ...SITE.social },
  stats: SITE.stats.map((s) => ({ ...s })),
  contact: { ...SITE.contact },
};

export const DEFAULT_PAGES: PageContent = {
  home: {
    editorialEyebrow: "Effortless Sophistication",
    editorialTitle: "An edit of quiet statement pieces",
    editorialBody:
      "Fluid silhouettes, warm neutral tones, and fabrics that move with you. Each MAZAL piece is considered down to the last seam - made to be worn, and worn again.",
    storyEyebrow: "Our Story",
    storyTitle: "Designed to endure",
    storyBody:
      "MAZAL was founded on a simple belief: that true elegance is calm, unhurried, and made to last.",
    statementImage: "/images/brand/statement.jpg",
  },
  about: {
    title: "Our Story",
    body: "MAZAL means Still. Timeless, calm elegance crafted with intention.",
  },
  contact: {
    title: "Contact",
    body: "We would love to help with sizing, styling, delivery, and private appointments.",
  },
  shop: {
    title: "The Collection",
    blurb:
      "Every MAZAL piece, in one place - abayas, kaftans, dresses, accessories and more. Quiet luxury, crafted with intention and designed to endure.",
  },
  footer: {
    newsletterTitle: "Join the MAZAL world",
    newsletterBody:
      "Private previews, new arrivals, and quiet notes on craft - plus 10% off your first order.",
    wordmark: "MAZAL",
    columns: [
      {
        title: "Company",
        links: [
          { label: "Our Story", href: "/about" },
          { label: "The Journal", href: "/journal" },
          { label: "MAZAL Rewards", href: "/rewards" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        title: "Navigation",
        links: [
          { label: "New In", href: "/shop?sort=new" },
          { label: "Abayas", href: "/shop?category=abayas" },
          { label: "Kaftans", href: "/shop?category=kaftans" },
          { label: "Scarves", href: "/shop?category=scarves" },
        ],
      },
      {
        title: "Support",
        links: [
          { label: "My Account", href: "/account" },
          { label: "Shipping & Returns", href: "/contact" },
          { label: "Wishlist", href: "/wishlist" },
          { label: "FAQ", href: "/contact" },
        ],
      },
    ],
  },
  seo: {
    home: {
      title: "Luxury Abayas & Kaftans Online UAE | MAZAL",
      description:
        "Shop MAZAL luxury abayas, kaftans & modest dresses online in the UAE. Timeless Gulf elegance, premium fabrics and free delivery over AED 500.",
    },
    shop: {
      title: "Luxury Abayas, Kaftans & Modest Dresses UAE",
      description:
        "Shop the full MAZAL collection — luxury abayas, designer kaftans, modest dresses and accessories in the UAE. Free GCC delivery over AED 500.",
    },
    about: {
      title: "Our Story — Crafted with Intention",
      description:
        "MAZAL means Still. Discover the story behind our quiet-luxury modest fashion house in the UAE — crafted with intention, designed to endure.",
    },
    contact: {
      title: "Contact & Client Care",
      description:
        "Reach the MAZAL team for orders, styling and client care in the UAE. Chat on WhatsApp or message us — we reply within one working day.",
    },
    journal: {
      title: "The Journal — Modest Style Notes & Guides",
      description:
        "Abaya styling guides, modest fashion trends and atelier stories from MAZAL — quiet luxury for the modern Gulf wardrobe.",
    },
    rewards: {
      title: "Rewards — Loyalty, VIP & Referrals",
      description:
        "Join MAZAL Rewards: earn points on every order, unlock VIP tiers and refer friends for AED off. Quiet luxury, generously rewarded.",
    },
  },
};

/** Pre-filled SEO copy for the main categories (admin can edit/override). */
const CATEGORY_SEO_SEED: Record<string, { seoTitle: string; seoDescription: string }> = {
  abayas: {
    seoTitle: "Luxury Abayas Online UAE",
    seoDescription:
      "Discover MAZAL luxury abayas in the UAE — open, closed & embellished designs in premium crepe and silk. Free GCC delivery over AED 500. Shop now.",
  },
  kaftans: {
    seoTitle: "Designer Kaftans Online UAE",
    seoDescription:
      "Shop MAZAL designer kaftans in the UAE — flowing, gilded silhouettes in georgette and silk for Eid, weddings & evenings. Free GCC delivery over AED 500.",
  },
  dresses: {
    seoTitle: "Modest Luxury Dresses Online UAE",
    seoDescription:
      "Shop MAZAL modest luxury dresses in the UAE — elegant day-to-evening silhouettes in timeless cuts and warm tones. Free GCC delivery over AED 500.",
  },
  scarves: {
    seoTitle: "Silk Scarves & Shawls UAE",
    seoDescription:
      "Shop featherweight silk scarves & modal shawls in the UAE by MAZAL — the finishing note to any look. Free GCC delivery over AED 500.",
  },
};

function seedData(): StoreData {
  return {
    products: PRODUCTS.map((p) => ({ ...p })),
    content: { ...DEFAULT_CONTENT },
    theme: { ...DEFAULT_THEME },
    categories: CATEGORIES.map((c, index) => ({
      value: c.value,
      label: c.label,
      blurb: c.blurb,
      image: `/images/categories/${c.value}.jpg`,
      order: index,
      ...(CATEGORY_SEO_SEED[c.value] ?? {}),
    })),
    articles: ARTICLES.map((a) => ({ ...a, body: a.body.map((b) => ({ ...b })) })),
    settings: { ...DEFAULT_SETTINGS },
    seo: { ...DEFAULT_SEO },
    media: [],
    pages: {
      ...DEFAULT_PAGES,
      home: { ...DEFAULT_PAGES.home },
      about: { ...DEFAULT_PAGES.about },
      contact: { ...DEFAULT_PAGES.contact },
      shop: { ...DEFAULT_PAGES.shop },
      footer: {
        ...DEFAULT_PAGES.footer,
        columns: DEFAULT_PAGES.footer.columns.map((c) => ({
          ...c,
          links: c.links.map((l) => ({ ...l })),
        })),
      },
      seo: { ...DEFAULT_PAGES.seo },
    },
  };
}

function normalize(raw: Partial<StoreData> | null | undefined): StoreData {
  const seed = seedData();
  if (!raw || typeof raw !== "object") return seed;
  return {
    products: Array.isArray(raw.products) ? raw.products : seed.products,
    content: { ...seed.content, ...(raw.content ?? {}) },
    theme: { ...seed.theme, ...(raw.theme ?? {}) },
    categories: Array.isArray(raw.categories) ? raw.categories : seed.categories,
    articles: Array.isArray(raw.articles) ? raw.articles : seed.articles,
    settings: { ...seed.settings, ...(raw.settings ?? {}) },
    seo: { ...seed.seo, ...(raw.seo ?? {}) },
    media: Array.isArray(raw.media) ? raw.media : seed.media,
    pages: { ...seed.pages, ...(raw.pages ?? {}) },
    updatedAt: raw.updatedAt,
  };
}

const hasBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const hasDisk = () => !!RENDER_DATA_DIR;

async function localStoreFile() {
  const path = await import("node:path");
  const dir = RENDER_DATA_DIR || path.join(process.cwd(), "data");
  return { path, dir, file: path.join(dir, "store.json") };
}

/** Read the full store. Never throws — falls back to the seed catalogue. */
export async function getStoreData(): Promise<StoreData> {
  if (hasBlob()) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: STORE_KEY });
      const found = blobs.find((b) => b.pathname === STORE_KEY);
      if (found) {
        const res = await fetch(found.url, { next: { revalidate: 15 } });
        if (res.ok) return normalize(await res.json());
      }
    } catch {
      /* fall through to seed */
    }
    return seedData();
  }
  // Render disk or local dev
  try {
    const fs = await import("node:fs/promises");
    const { file } = await localStoreFile();
    const raw = await fs.readFile(file, "utf8");
    return normalize(JSON.parse(raw));
  } catch {
    return seedData();
  }
}

/** Persist the full store. */
export async function saveStoreData(data: StoreData): Promise<void> {
  const payload: StoreData = { ...data, updatedAt: new Date().toISOString() };
  const json = JSON.stringify(payload, null, 2);

  if (hasBlob()) {
    const { put } = await import("@vercel/blob");
    await put(STORE_KEY, json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    });
    return;
  }
  const fs = await import("node:fs/promises");
  const { dir, file } = await localStoreFile();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, json, "utf8");
}

/** Convenience: just the catalogue. */
export async function getProductsFromStore(): Promise<Product[]> {
  return (await getStoreData()).products;
}

export async function getArticlesFromStore(): Promise<Article[]> {
  return [...(await getStoreData()).articles].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

/** Whether persistent storage is configured (controls the admin banner). */
export function storageReady(): boolean {
  return hasBlob() || hasDisk() || process.env.NODE_ENV !== "production";
}

/** Upload an image; returns a public URL usable in <Image src>. */
export async function uploadImage(
  bytes: Buffer,
  filename: string,
  contentType: string,
): Promise<string> {
  const safe =
    Date.now() + "-" + filename.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-60);

  if (hasBlob()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`mazal/uploads/${safe}`, bytes, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return blob.url;
  }
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = RENDER_DATA_DIR
    ? path.join(RENDER_DATA_DIR, "uploads")
    : path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, safe), bytes);
  return `/uploads/${safe}`;
}

export async function readUploadedFile(filename: string) {
  const safe = filename.replace(/[/\\]/g, "");
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const candidates = [
    ...(RENDER_DATA_DIR ? [path.join(RENDER_DATA_DIR, "uploads", safe)] : []),
    path.join(process.cwd(), "public", "uploads", safe),
  ];
  for (const file of candidates) {
    try {
      return await fs.readFile(file);
    } catch {
      /* try next */
    }
  }
  return null;
}
