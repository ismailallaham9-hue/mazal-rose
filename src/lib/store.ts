/**
 * MAZAL content store — the single source of truth the admin panel edits and
 * the public site reads.
 *
 * Persistence is automatic by environment:
 *   • Production (Render) → a mounted disk directory via MAZAL_DATA_DIR.
 *   • Production (Vercel) → a JSON blob in Vercel Blob storage
 *     (needs the BLOB_READ_WRITE_TOKEN env var, added when you enable Blob).
 *   • Local dev           → a JSON file at /data/store.json.
 *   • Neither configured  → the built-in seed catalogue (read-only).
 *
 * When both Render disk and Vercel Blob are configured, Render disk wins so
 * admin edits and uploads stay with the live Render service and avoid Blob
 * operation limits. Blob remains a fallback for older deployments.
 */
import "server-only";
import { connection } from "next/server";
import { ARTICLES, type Article } from "./articles";
import { CATEGORIES, PRODUCTS, type Product } from "./products";
import { SITE, whatsappNumber } from "./site";

/**
 * In-process cache for the Blob store. Vercel Blob's `list()` is a metered
 * "advanced operation", so we cache the parsed store in memory and only re-read
 * from Blob once an hour (or immediately after an admin save).
 */
let blobMemCache: { data: StoreData; at: number } | null = null;
const BLOB_MEM_TTL = 60 * 60 * 1000; // 1 hour
let storeWriteQueue: Promise<void> = Promise.resolve();

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
  ratings: StoreRating[];
  orders: StoreOrder[];
  inquiries: StoreInquiry[];
  subscribers: StoreSubscriber[];
  emailEvents: StoreEmailEvent[];
  settings: SiteSettings;
  media: MediaAsset[];
  pages: PageContent;
  seo: SeoSettings;
  seoRecords: Record<string, SeoRecord>;
  updatedAt?: string;
};

export type StoreRatingTargetType = "product";

export type StoreRating = {
  id: string;
  targetType: StoreRatingTargetType;
  targetId: string;
  targetSlug: string;
  rating: number;
  createdAt: string;
  fingerprint: string;
};

export type RatingSummary = {
  ratingValue: number;
  ratingCount: number;
  bestRating: 5;
  worstRating: 1;
};

export type StoreOrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type StorePaymentMethod = "cod" | "card" | "tabby";

export type StorePaymentStatus =
  | "pending"
  | "payment_link_requested"
  | "paid"
  | "failed"
  | "refunded";

export type StoreOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  status: StoreOrderStatus;
  paymentMethod: StorePaymentMethod;
  paymentStatus: StorePaymentStatus;
  deliveryMethod: "standard" | "express";
  customer: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
  };
  shipping: {
    address: string;
    city: string;
    country: string;
  };
  items: {
    productId: string;
    name: string;
    image: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    lineTotal: number;
  }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  promoCode?: string | null;
  note?: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  internalNotes?: string;
  customerNotifiedAt?: string;
};

export type StoreInquiry = {
  id: string;
  createdAt: string;
  status: "new" | "read" | "replied" | "archived";
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type StoreSubscriber = {
  id: string;
  createdAt: string;
  email: string;
  source: "footer" | "newsletter" | "checkout" | "manual";
};

export type StoreEmailEvent = {
  id: string;
  createdAt: string;
  to: string;
  subject: string;
  status: "sent" | "queued" | "failed";
  provider?: string;
  error?: string;
  context: "order" | "contact" | "newsletter" | "order-status";
  relatedId?: string;
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

export type SchemaType =
  | "WebPage"
  | "Organization"
  | "Product"
  | "CollectionPage"
  | "Article"
  | "FAQPage"
  | "BreadcrumbList";

export type SeoRecordStatus = "draft" | "published";

export type SeoFAQ = {
  q: string;
  a: string;
};

export type SeoContentFields = {
  pageTitle?: string;
  h1?: string;
  heroEyebrow?: string;
  heroHeading?: string;
  heroSubheading?: string;
  ctaText?: string;
  ctaLink?: string;
  intro?: string;
  body?: string;
  sections?: { h2: string; body: string; image?: string; ctaText?: string; ctaLink?: string }[];
  faqs?: SeoFAQ[];
  productName?: string;
  shortDescription?: string;
  longDescription?: string;
  specifications?: string;
  fabric?: string;
  colorOptions?: string;
  sizeOptions?: string;
  fitNotes?: string;
  sizeGuide?: string;
  careInstructions?: string;
  deliveryInformation?: string;
  returnExchangeInformation?: string;
  stylingNotes?: string;
  occasionUseCase?: string;
  imageAltText?: string;
};

export type SeoFields = SeoContentFields & {
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  secondaryKeywords?: string; // comma-separated
  canonical?: string; // override (path or absolute)
  index?: boolean; // default true
  follow?: boolean; // default true
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  searchIntentNotes?: string;
  internalLinkSuggestions?: string;
  faqSchema?: SeoFAQ[];
  imageAltSuggestions?: string;
  schemaType?: SchemaType;
  sitemapInclude?: boolean; // default true
  sitemapPriority?: number; // 0.0-1.0
  sitemapChangefreq?: string; // weekly/monthly/...
};

/** Rich, per-entity SEO record edited in the Content Studio. Keyed in
 *  store.seoRecords by entity id, e.g. "home", "shop", "category:abayas",
 *  "product:sukoon-abaya", "city:dubai", "article:<slug>", "page:about". */
export type SeoRecord = SeoFields & {
  status?: SeoRecordStatus;
  published?: SeoFields;
  draft?: SeoFields;
  updatedAt?: string;
  publishedAt?: string;
  updatedBy?: string;
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
  showCustomerAccount: boolean;
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
  alt?: string; // accessible/SEO alt text, editable in the Media Library
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
  showCustomerAccount: false,
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
      "Fluid silhouettes, warm neutral tones, and fabrics that move with you. Each MAZAL piece is considered down to the last seam — made to be worn, and worn again.",
    editorialCtaText: "Discover the Collection",
    editorialCtaHref: "/shop",
    editorialImage: "/images/brand/collection-feature.jpg",
    storyEyebrow: "Our Story",
    storyTitle: "Designed to endure",
    storyBody:
      "MAZAL — meaning still — was founded on a simple belief: that true elegance is calm, unhurried, and made to last. We design modest pieces with the restraint of a maison and the warmth of home.\n\nFrom the first sketch to the final stitch, every garment is crafted with intention — never trend-led, always timeless.",
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
          { label: "Returns & Exchanges", href: "/returns" },
          { label: "Shipping Policy", href: "/shipping" },
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms & Conditions", href: "/terms" },
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
    returns: {
      title: "Returns & Exchanges",
      description:
        "Read MAZAL's returns and exchanges policy, including eligibility, timelines, refunds, exchanges and client care support.",
    },
    shipping: {
      title: "Shipping Policy",
      description:
        "Read MAZAL's shipping policy, including UAE delivery, GCC and international shipping timelines, fees, duties and order support.",
    },
    privacy: {
      title: "Privacy Policy",
      description:
        "Read how MAZAL collects, uses and protects customer information for orders, client care, marketing and website services.",
    },
    terms: {
      title: "Terms & Conditions",
      description:
        "Read MAZAL's website and sale terms, including orders, pricing, payment, delivery, returns, intellectual property and liability.",
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

const CITY_SEO_SEED: { slug: string; name: string }[] = [
  { slug: "dubai", name: "Dubai" },
  { slug: "abu-dhabi", name: "Abu Dhabi" },
  { slug: "sharjah", name: "Sharjah" },
  { slug: "ajman", name: "Ajman" },
  { slug: "ras-al-khaimah", name: "Ras Al Khaimah" },
];

function publishedRecord(fields: SeoFields): SeoRecord {
  return {
    ...fields,
    status: "published",
    published: { ...fields },
    publishedAt: new Date(0).toISOString(),
  };
}

function recordForProduct(product: Product): SeoRecord {
  const title = product.seoTitle || `${product.name} | Luxury ${product.category} UAE`;
  const description =
    product.seoDescription ||
    `${product.description} Shop MAZAL online in the UAE with refined delivery, returns and client care.`.slice(0, 160);
  return publishedRecord({
    pageTitle: product.name,
    h1: product.name,
    productName: product.name,
    shortDescription: product.description,
    longDescription: product.longDescription || product.description,
    specifications: product.specifications || `Category: ${product.category}\nSizes: ${product.sizes.join(", ")}\nColours: ${product.colors.map((c) => c.name).join(", ")}`,
    fabric: product.material,
    colorOptions: product.colors.map((c) => c.name).join(", "),
    sizeOptions: product.sizes.join(", "),
    fitNotes: product.fitNotes || "Designed for an elegant, modest drape. Choose your usual size for a relaxed MAZAL fit.",
    sizeGuide: product.sizeGuide,
    careInstructions: product.care?.join("\n"),
    deliveryInformation: product.deliveryInfo || "UAE and GCC delivery is available, with complimentary delivery over AED 500.",
    returnExchangeInformation: product.returnInfo || "Eligible unworn pieces can be returned or exchanged according to the MAZAL Returns & Exchanges policy.",
    stylingNotes: product.stylingNotes || "Style with quiet accessories and tonal layers for a refined Gulf wardrobe.",
    imageAltText: product.imageAltText || `${product.name} luxury modest fashion by MAZAL UAE`,
    seoTitle: title,
    metaDescription: description,
    focusKeyword: product.category === "abayas" ? "luxury abayas UAE" : product.category === "kaftans" ? "luxury kaftans UAE" : "modest fashion Dubai",
    canonical: `/shop/${product.slug}`,
    index: product.published !== false,
    follow: true,
    ogTitle: `${product.name} · MAZAL`,
    ogDescription: description,
    ogImage: product.image,
    twitterTitle: `${product.name} · MAZAL`,
    twitterDescription: description,
    twitterImage: product.image,
    schemaType: "Product",
    sitemapInclude: product.published !== false,
    sitemapPriority: 0.6,
    sitemapChangefreq: "weekly",
  });
}

function buildSeedSeoRecords(seed: Omit<StoreData, "seoRecords">): Record<string, SeoRecord> {
  const records: Record<string, SeoRecord> = {
    global: publishedRecord({
      seoTitle: seed.seo.defaultTitle,
      metaDescription: seed.seo.defaultDescription,
      canonical: "/",
      index: seed.seo.indexable,
      follow: true,
      ogImage: seed.seo.defaultOgImage,
      schemaType: "Organization",
      sitemapInclude: true,
      sitemapPriority: 1,
      sitemapChangefreq: "weekly",
    }),
    home: publishedRecord({
      pageTitle: seed.content.heroTitle,
      h1: seed.content.heroTitle,
      heroEyebrow: seed.content.heroEyebrow,
      heroHeading: seed.content.heroTitle,
      heroSubheading: seed.content.heroSubtitle,
      ctaText: seed.content.heroCtaText,
      ctaLink: seed.content.heroCtaHref,
      intro: seed.content.heroSubtitle,
      seoTitle: seed.pages.seo.home?.title || seed.seo.defaultTitle,
      metaDescription: seed.pages.seo.home?.description || seed.seo.defaultDescription,
      canonical: "/",
      index: true,
      follow: true,
      ogImage: seed.pages.seo.home?.ogImage || seed.seo.defaultOgImage,
      schemaType: "Organization",
      sitemapInclude: true,
      sitemapPriority: 1,
      sitemapChangefreq: "weekly",
    }),
    shop: publishedRecord({
      pageTitle: seed.pages.shop.title,
      h1: seed.pages.shop.title,
      intro: seed.pages.shop.blurb,
      body: seed.pages.shop.blurb,
      seoTitle: seed.pages.seo.shop?.title || "Luxury Abayas, Kaftans & Modest Dresses UAE",
      metaDescription: seed.pages.seo.shop?.description || seed.seo.defaultDescription,
      canonical: "/shop",
      index: true,
      follow: true,
      schemaType: "CollectionPage",
      sitemapInclude: true,
      sitemapPriority: 0.8,
      sitemapChangefreq: "weekly",
    }),
  };

  for (const key of ["about", "contact", "returns", "shipping", "privacy", "terms", "rewards", "journal"] as const) {
    const seo = seed.pages.seo[key];
    const page = key === "about" ? seed.pages.about : key === "contact" ? seed.pages.contact : undefined;
    records[`page:${key}`] = publishedRecord({
      pageTitle: page?.title || key[0].toUpperCase() + key.slice(1),
      h1: page?.title || key[0].toUpperCase() + key.slice(1),
      body: page?.body,
      seoTitle: seo?.title || `${key[0].toUpperCase() + key.slice(1)} | MAZAL`,
      metaDescription: seo?.description || seed.seo.defaultDescription,
      canonical: key === "returns" ? "/returns" : key === "journal" ? "/journal" : `/${key}`,
      index: true,
      follow: true,
      schemaType: key === "journal" ? "CollectionPage" : "WebPage",
      sitemapInclude: true,
      sitemapPriority: 0.7,
      sitemapChangefreq: "monthly",
    });
  }

  for (const category of seed.categories) {
    records[`category:${category.value}`] = publishedRecord({
      pageTitle: category.label,
      h1: category.label,
      intro: category.blurb,
      body: category.blurb,
      seoTitle: category.seoTitle || `${category.label} Online UAE | MAZAL`,
      metaDescription: category.seoDescription || `Shop MAZAL ${category.label.toLowerCase()} in the UAE. Quiet luxury, premium fabrics and free GCC delivery over AED 500.`,
      focusKeyword: category.value === "abayas" ? "luxury abayas UAE" : category.value === "kaftans" ? "luxury kaftans UAE" : `${category.label.toLowerCase()} UAE`,
      canonical: `/shop?category=${category.value}`,
      index: !category.hidden,
      follow: true,
      ogImage: category.image,
      schemaType: "CollectionPage",
      sitemapInclude: !category.hidden,
      sitemapPriority: 0.7,
      sitemapChangefreq: "weekly",
    });
  }

  for (const city of CITY_SEO_SEED) {
    records[`city:${city.slug}`] = publishedRecord({
      pageTitle: `Luxury Abayas in ${city.name}`,
      h1: `Luxury Abayas in ${city.name}`,
      intro: `Discover MAZAL luxury abayas, designer kaftans and modest dresses in ${city.name}.`,
      body: `MAZAL brings quiet luxury modest fashion to ${city.name}, with refined abayas, kaftans and dresses crafted for the modern Gulf wardrobe.`,
      seoTitle: `Luxury Abayas in ${city.name} | MAZAL`,
      metaDescription: `Shop MAZAL luxury abayas, kaftans and modest dresses in ${city.name}. Premium fabrics, fast UAE delivery and free delivery over AED 500.`,
      focusKeyword: city.slug === "dubai" ? "abayas Dubai" : "luxury abayas UAE",
      canonical: `/abayas/${city.slug}`,
      index: true,
      follow: true,
      schemaType: "CollectionPage",
      sitemapInclude: true,
      sitemapPriority: 0.6,
      sitemapChangefreq: "monthly",
    });
  }

  for (const product of seed.products) records[`product:${product.slug}`] = recordForProduct(product);

  for (const article of seed.articles) {
    records[`article:${article.slug}`] = publishedRecord({
      pageTitle: article.title,
      h1: article.title,
      intro: article.excerpt,
      body: article.body.map((block) => block.text).join("\n\n"),
      seoTitle: article.seoTitle || `${article.title} | MAZAL Journal`,
      metaDescription: article.seoDescription || article.excerpt,
      canonical: `/journal/${article.slug}`,
      index: true,
      follow: true,
      ogImage: article.image,
      twitterImage: article.image,
      schemaType: "Article",
      sitemapInclude: true,
      sitemapPriority: 0.5,
      sitemapChangefreq: "monthly",
    });
  }

  return records;
}

function seedData(): StoreData {
  const seed: Omit<StoreData, "seoRecords"> = {
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
    ratings: [],
    orders: [],
    inquiries: [],
    subscribers: [],
    emailEvents: [],
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
  return {
    ...seed,
    seoRecords: buildSeedSeoRecords(seed),
  };
}

const REQUIRED_SUPPORT_LINKS = [
  { label: "Returns & Exchanges", href: "/returns" },
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

function withRequiredFooterLinks(
  columns: PageContent["footer"]["columns"],
): PageContent["footer"]["columns"] {
  const next = columns.map((column) => ({
    ...column,
    links: column.links.map((link) =>
      link.label === "Shipping & Returns" && link.href === "/contact"
        ? { ...link, label: "Returns & Exchanges", href: "/returns" }
        : link,
    ),
  }));
  const supportIndex = next.findIndex((column) =>
    /support|help|customer/i.test(column.title),
  );
  if (supportIndex === -1) {
    return [
      ...next,
      { title: "Support", links: REQUIRED_SUPPORT_LINKS },
    ];
  }
  const support = next[supportIndex];
  const links = [...support.links];
  for (const required of REQUIRED_SUPPORT_LINKS) {
    if (!links.some((link) => link.href === required.href)) {
      links.push(required);
    }
  }
  next[supportIndex] = { ...support, links };
  return next;
}

function isValidRating(value: unknown): value is StoreRating {
  if (!value || typeof value !== "object") return false;
  const rating = value as Partial<StoreRating>;
  const stars = rating.rating;
  return (
    rating.targetType === "product" &&
    typeof rating.id === "string" &&
    typeof rating.targetId === "string" &&
    typeof rating.targetSlug === "string" &&
    typeof rating.fingerprint === "string" &&
    typeof rating.createdAt === "string" &&
    typeof stars === "number" &&
    Number.isInteger(stars) &&
    stars >= 1 &&
    stars <= 5
  );
}

function normalize(raw: Partial<StoreData> | null | undefined): StoreData {
  const seed = seedData();
  if (!raw || typeof raw !== "object") return seed;
  const rawPages: Partial<PageContent> = raw.pages ?? {};
  const rawSettings: Partial<SiteSettings> = raw.settings ?? {};
  const rawWhatsapp = (rawSettings.whatsapp ?? {}) as Partial<SiteSettings["whatsapp"]>;
  const normalizedWhatsappNumber = whatsappNumber(rawWhatsapp.number || "");
  const whatsapp = {
    ...seed.settings.whatsapp,
    ...rawWhatsapp,
    number:
      !normalizedWhatsappNumber || normalizedWhatsappNumber === "971500000000"
        ? seed.settings.whatsapp.number
        : normalizedWhatsappNumber,
  };
  const social = {
    ...seed.settings.social,
    ...(rawSettings.social ?? {}),
  };
  const contact = {
    ...seed.settings.contact,
    ...(rawSettings.contact ?? {}),
  };
  const settings = {
    ...seed.settings,
    ...rawSettings,
    whatsapp,
    social,
    contact,
    stats: Array.isArray(rawSettings.stats) ? rawSettings.stats : seed.settings.stats,
  };
  const pages = {
    ...seed.pages,
    ...rawPages,
    footer: {
      ...seed.pages.footer,
      ...(rawPages.footer ?? {}),
      columns: Array.isArray(rawPages.footer?.columns)
        ? withRequiredFooterLinks(rawPages.footer.columns)
        : withRequiredFooterLinks(seed.pages.footer.columns),
    },
    seo: { ...seed.pages.seo, ...(rawPages.seo ?? {}) },
  };
  const normalizedBase = {
    products: Array.isArray(raw.products) ? raw.products : seed.products,
    content: { ...seed.content, ...(raw.content ?? {}) },
    theme: { ...seed.theme, ...(raw.theme ?? {}) },
    categories: Array.isArray(raw.categories) ? raw.categories : seed.categories,
    articles: Array.isArray(raw.articles) ? raw.articles : seed.articles,
    ratings: Array.isArray(raw.ratings)
      ? raw.ratings.filter(isValidRating)
      : seed.ratings,
    orders: Array.isArray(raw.orders) ? raw.orders : seed.orders,
    inquiries: Array.isArray(raw.inquiries) ? raw.inquiries : seed.inquiries,
    subscribers: Array.isArray(raw.subscribers)
      ? raw.subscribers
      : seed.subscribers,
    emailEvents: Array.isArray(raw.emailEvents)
      ? raw.emailEvents
      : seed.emailEvents,
    settings,
    seo: { ...seed.seo, ...(raw.seo ?? {}) },
    seoRecords:
      raw.seoRecords && typeof raw.seoRecords === "object"
        ? (raw.seoRecords as Record<string, SeoRecord>)
        : {},
    media: Array.isArray(raw.media) ? raw.media : seed.media,
    pages,
    updatedAt: raw.updatedAt,
  };
  const seeded = buildSeedSeoRecords(normalizedBase);
  const incomingRecords =
    raw.seoRecords && typeof raw.seoRecords === "object"
      ? (raw.seoRecords as Record<string, SeoRecord>)
      : {};
  return {
    ...normalizedBase,
    seoRecords: { ...seeded, ...incomingRecords },
  };
}

const hasBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const hasDisk = () => !!RENDER_DATA_DIR;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function localStoreFile() {
  const path = await import("node:path");
  const dir =
    RENDER_DATA_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
  return { path, dir, file: path.join(dir, "store.json") };
}

async function readDiskStore(): Promise<StoreData | null> {
  try {
    const fs = await import("node:fs/promises");
    const { file } = await localStoreFile();
    const raw = await fs.readFile(file, "utf8");
    return normalize(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function readBlobStore(): Promise<StoreData | null> {
  if (!hasBlob()) return null;
  // Serve from the in-memory cache while it's fresh (avoids a metered list()).
  if (blobMemCache && Date.now() - blobMemCache.at < BLOB_MEM_TTL) {
    return blobMemCache.data;
  }
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: STORE_KEY });
    const found = blobs.find((b) => b.pathname === STORE_KEY);
    if (found) {
      const res = await fetch(found.url, { cache: "no-store" });
      if (res.ok) {
        const data = normalize(await res.json());
        blobMemCache = { data, at: Date.now() };
        return data;
      }
    }
  } catch {
    /* fall through */
  }
  // On a transient read failure, prefer stale cache over reverting to seed.
  return blobMemCache?.data ?? null;
}

async function writeDiskStore(json: string): Promise<void> {
  const fs = await import("node:fs/promises");
  const { dir, file } = await localStoreFile();
  await fs.mkdir(dir, { recursive: true });
  const tmp = `${file}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, json, "utf8");
  await fs.rename(tmp, file);

  try {
    const path = await import("node:path");
    const backupDir = path.join(dir, "backups");
    await fs.mkdir(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const day = stamp.slice(0, 10);
    await fs.writeFile(path.join(backupDir, `store-${stamp}.json`), json, "utf8");
    await fs.writeFile(path.join(backupDir, "store-latest.json"), json, "utf8");
    await fs.writeFile(path.join(backupDir, `store-daily-${day}.json`), json, "utf8");
    const backups = (await fs.readdir(backupDir))
      .filter((name) => name.startsWith("store-") && name.endsWith(".json"))
      .filter((name) => !name.startsWith("store-daily-") && name !== "store-latest.json")
      .sort()
      .reverse();
    const dailyBackups = (await fs.readdir(backupDir))
      .filter((name) => name.startsWith("store-daily-") && name.endsWith(".json"))
      .sort()
      .reverse();
    await Promise.all(
      [
        ...backups.slice(100),
        ...dailyBackups.slice(180),
      ].map((name) => fs.unlink(path.join(backupDir, name))),
    );
  } catch {
    // Backups should never block the live save path.
  }
}

async function writeBlobStore(payload: StoreData, json: string): Promise<void> {
  const { put } = await import("@vercel/blob");
  await put(STORE_KEY, json, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
  // Refresh the in-memory cache immediately so admin edits show at once
  // without another Blob read.
  blobMemCache = { data: normalize(payload), at: Date.now() };
}

async function acquireStoreLock(): Promise<() => Promise<void>> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const { dir } = await localStoreFile();
  await fs.mkdir(dir, { recursive: true });
  const lockDir = path.join(dir, ".store.lock");
  const started = Date.now();
  while (true) {
    try {
      await fs.mkdir(lockDir);
      await fs.writeFile(
        path.join(lockDir, "owner"),
        `${process.pid} ${new Date().toISOString()}`,
        "utf8",
      );
      return async () => {
        await fs.rm(lockDir, { recursive: true, force: true });
      };
    } catch {
      try {
        const stat = await fs.stat(lockDir);
        if (Date.now() - stat.mtimeMs > 30_000) {
          await fs.rm(lockDir, { recursive: true, force: true });
          continue;
        }
      } catch {
        // Another request may have released the lock between mkdir attempts.
      }
      if (Date.now() - started > 10_000) {
        throw new Error("Store is busy. Please try again.");
      }
      await sleep(50);
    }
  }
}

/** Read the full store. Never throws — falls back to the seed catalogue. */
export async function getStoreData(): Promise<StoreData> {
  if (hasDisk()) {
    return (await readDiskStore()) ?? (await readBlobStore()) ?? seedData();
  }
  return (await readBlobStore()) ?? (await readDiskStore()) ?? seedData();
}

/** Read the store for public storefront rendering at request time. */
export async function getFreshStoreData(): Promise<StoreData> {
  await connection();
  return getStoreData();
}

/** Persist the full store. */
export async function saveStoreData(data: StoreData): Promise<void> {
  const payload: StoreData = { ...data, updatedAt: new Date().toISOString() };
  const json = JSON.stringify(payload, null, 2);

  if (hasDisk()) {
    await writeDiskStore(json);
    return;
  }
  if (hasBlob()) {
    await writeBlobStore(payload, json);
    return;
  }
  await writeDiskStore(json);
}

export async function updateStoreData<T>(
  updater: (store: StoreData) => Promise<{ store: StoreData; result: T }> | { store: StoreData; result: T },
): Promise<T> {
  let output!: T;
  const run = storeWriteQueue.then(async () => {
    const release = await acquireStoreLock();
    try {
      const current = await getStoreData();
      const next = await updater(current);
      await saveStoreData(next.store);
      output = next.result;
    } finally {
      await release();
    }
  });
  storeWriteQueue = run.catch(() => undefined);
  await run;
  return output;
}

/** Convenience: just the catalogue. */
export async function getProductsFromStore(): Promise<Product[]> {
  return (await getStoreData()).products;
}

export async function getFreshProductsFromStore(): Promise<Product[]> {
  return (await getFreshStoreData()).products;
}

export async function getArticlesFromStore(): Promise<Article[]> {
  return [...(await getStoreData()).articles].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

export async function getFreshArticlesFromStore(): Promise<Article[]> {
  return [...(await getFreshStoreData()).articles].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

export function ratingSummaryForProduct(
  store: Pick<StoreData, "ratings">,
  product: Pick<Product, "id" | "slug">,
): RatingSummary | null {
  return ratingSummaryForProductId(store, product.id, product.slug);
}

export function ratingSummaryForProductId(
  store: Pick<StoreData, "ratings">,
  productId: string,
  productSlug?: string,
): RatingSummary | null {
  const ratings = store.ratings.filter(
    (rating) =>
      rating.targetType === "product" &&
      rating.targetId === productId &&
      (!productSlug || rating.targetSlug === productSlug),
  );
  if (!ratings.length) return null;
  const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
  return {
    ratingValue: Math.round((total / ratings.length) * 10) / 10,
    ratingCount: ratings.length,
    bestRating: 5,
    worstRating: 1,
  };
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

  if (!hasDisk() && hasBlob()) {
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
    : path.join(
        /*turbopackIgnore: true*/ process.cwd(),
        "public",
        "uploads",
      );
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, safe), bytes);
  return `/uploads/${safe}`;
}

export async function getUploadedFileInfo(filename: string) {
  const safe = filename.replace(/[/\\]/g, "");
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const candidates = [
    ...(RENDER_DATA_DIR ? [path.join(RENDER_DATA_DIR, "uploads", safe)] : []),
    path.join(
      /*turbopackIgnore: true*/ process.cwd(),
      "public",
      "uploads",
      safe,
    ),
  ];
  for (const file of candidates) {
    try {
      const stat = await fs.stat(file);
      if (stat.isFile()) {
        return { file, size: stat.size };
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function readUploadedFile(filename: string) {
  const fs = await import("node:fs/promises");
  const info = await getUploadedFileInfo(filename);
  return info ? fs.readFile(info.file) : null;
}
