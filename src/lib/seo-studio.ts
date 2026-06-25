/**
 * Content Studio SEO engine — scoring, checklist and suggestion templates.
 * Pure/client-safe (no server-only imports). Brand voice: quiet luxury,
 * timeless Gulf elegance, calm, refined, premium, modest, crafted with intention.
 */
import type { SeoRecord } from "@/lib/store";

export type EntityType =
  | "global"
  | "home"
  | "shop"
  | "category"
  | "city"
  | "product"
  | "article"
  | "page";

export type StudyContext = {
  type: EntityType;
  name: string; // display name / H1 subject
  h1?: string;
  intro?: string;
  bodyText?: string; // for word count
  hasFAQ?: boolean;
  hasMaterial?: boolean;
  hasCare?: boolean;
  hasImageAlt?: boolean;
  hasInternalLinks?: boolean;
};

export type Check = {
  label: string;
  status: "pass" | "warn" | "fail";
  hint?: string;
};

const words = (s?: string) => (s ? s.trim().split(/\s+/).filter(Boolean).length : 0);
const has = (hay?: string, needle?: string) =>
  !!hay && !!needle && hay.toLowerCase().includes(needle.toLowerCase());

export function scoreSeo(
  rec: SeoRecord,
  ctx: StudyContext,
): { score: number; checks: Check[] } {
  const checks: Check[] = [];
  const title = rec.seoTitle ?? "";
  const desc = rec.metaDescription ?? "";
  const kw = (rec.focusKeyword ?? "").trim();

  // Title length 45–60
  checks.push({
    label: `SEO title length (${title.length})`,
    status: title.length >= 45 && title.length <= 60 ? "pass" : title.length >= 30 && title.length <= 65 ? "warn" : "fail",
    hint: "Aim for 45–60 characters.",
  });
  // Meta description 140–160
  checks.push({
    label: `Meta description length (${desc.length})`,
    status: desc.length >= 140 && desc.length <= 160 ? "pass" : desc.length >= 120 && desc.length <= 170 ? "warn" : "fail",
    hint: "Aim for 140–160 characters.",
  });
  // Focus keyword set
  checks.push({
    label: "Focus keyword set",
    status: kw ? "pass" : "fail",
    hint: "Add one clear focus keyword.",
  });
  if (kw) {
    checks.push({ label: "Keyword in title", status: has(title, kw) ? "pass" : "warn" });
    checks.push({ label: "Keyword in meta description", status: has(desc, kw) ? "pass" : "warn" });
    checks.push({ label: "Keyword in H1", status: has(ctx.h1, kw) ? "pass" : "warn" });
    checks.push({ label: "Keyword in intro", status: has(ctx.intro, kw) ? "pass" : "warn" });
  }
  // One clear H1
  checks.push({ label: "Has H1", status: ctx.h1 && ctx.h1.trim() ? "pass" : "fail" });
  // Canonical
  checks.push({
    label: "Canonical URL",
    status: rec.canonical && rec.canonical.trim() ? "pass" : "warn",
    hint: "A canonical is auto-set per page; override only if needed.",
  });
  // OG + Twitter
  checks.push({
    label: "Open Graph data",
    status: (rec.ogTitle || title) && (rec.ogDescription || desc) ? "pass" : "warn",
  });
  checks.push({
    label: "Twitter card data",
    status: (rec.twitterTitle || rec.ogTitle || title) ? "pass" : "warn",
  });
  // Schema
  checks.push({
    label: "Schema type",
    status: rec.schemaType ? "pass" : "warn",
  });
  // Word count by type
  if (ctx.type === "category" || ctx.type === "city") {
    const w = words(ctx.bodyText);
    checks.push({ label: `Body length (${w} words)`, status: w >= 250 ? "pass" : w >= 150 ? "warn" : "fail", hint: "≥250 words for category/city pages." });
  }
  if (ctx.type === "article") {
    const w = words(ctx.bodyText);
    checks.push({ label: `Article length (${w} words)`, status: w >= 700 ? "pass" : w >= 400 ? "warn" : "fail", hint: "≥700 words for journal articles." });
  }
  if (ctx.type === "product") {
    checks.push({ label: "Material details", status: ctx.hasMaterial ? "pass" : "warn" });
    checks.push({ label: "Care details", status: ctx.hasCare ? "pass" : "warn" });
    checks.push({ label: "FAQ content", status: ctx.hasFAQ ? "pass" : "warn" });
    checks.push({ label: "Image alt text", status: ctx.hasImageAlt ? "pass" : "warn" });
  }
  // Sitemap
  checks.push({
    label: "Included in sitemap",
    status: rec.sitemapInclude === false ? "warn" : "pass",
  });

  const weight = (s: Check["status"]) => (s === "pass" ? 1 : s === "warn" ? 0.5 : 0);
  const score = Math.round((checks.reduce((a, c) => a + weight(c.status), 0) / checks.length) * 100);
  return { score, checks };
}

/** Keyword cluster suggestions used by the generator. */
const CLUSTERS: Record<string, string> = {
  abayas: "luxury abayas UAE",
  kaftans: "luxury kaftans UAE",
  dresses: "modest dresses UAE",
  scarves: "silk scarves UAE",
};

export function suggestForCategory(name: string, value: string): {
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string;
  ogTitle: string;
  ogDescription: string;
  h1: string;
  intro: string;
  body: string;
  faqs: { q: string; a: string }[];
  imageAlt: string;
} {
  const lower = name.toLowerCase();
  const kw = CLUSTERS[value] || `luxury ${lower} UAE`;
  return {
    seoTitle: `${name} Online UAE | MAZAL`.slice(0, 60),
    metaDescription:
      `Discover MAZAL ${lower} in the UAE — premium fabrics, timeless cuts and quiet luxury. Free GCC delivery over AED 500. Shop the collection.`.slice(0, 160),
    focusKeyword: kw,
    secondaryKeywords: `${lower} Dubai, designer ${lower} online, modest ${lower} UAE`,
    ogTitle: `${name} — Quiet Luxury by MAZAL`,
    ogDescription: `Premium ${lower} crafted with intention for the modern Gulf wardrobe.`,
    h1: `Luxury ${name}`,
    intro:
      `MAZAL ${lower} bring timeless Gulf elegance to modest dressing in the UAE. Crafted from premium fabrics and finished with quiet, considered detail, each piece is designed to move beautifully and to endure — calm luxury for every occasion.`,
    body:
      `Explore a curated edit of ${lower} designed in the UAE for women who value refined, lasting elegance over fleeting trends. Every MAZAL piece is cut from carefully chosen fabrics, with tailoring and finishing that feel intentional from the first wear. Our palette stays calm and versatile, so each piece pairs naturally with the rest of your wardrobe.\n\nWhether you are dressing for everyday ease, a family gathering, or a special occasion across the UAE and wider GCC, MAZAL offers premium modest fashion without compromise. Style with considered accessories for evening, or keep it relaxed by day — and enjoy complimentary delivery across the GCC on orders over AED 500.`,
    faqs: [
      { q: `What makes MAZAL ${lower} luxury?`, a: `Premium fabrics, hand-finished detail and timeless tailoring, designed in the UAE.` },
      { q: `Do you deliver ${lower} across the GCC?`, a: `Yes — to the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman, free over AED 500.` },
      { q: `Can I wear MAZAL ${lower} for special occasions?`, a: `Yes — our pieces are made for everyday elegance and for Eid, weddings and evenings.` },
    ],
    imageAlt: `Luxury ${lower} for women in UAE by MAZAL`,
  };
}
