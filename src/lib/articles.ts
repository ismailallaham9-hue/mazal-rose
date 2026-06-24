/**
 * Editorial journal content — mock data, shaped for a CMS swap later.
 * Replace getArticles()/getArticle() with a CMS fetch and keep the types.
 */

export interface ArticleBlock {
  type: "p" | "h2";
  text: string;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string; // ISO
  image: string;
  body: ArticleBlock[];
  relatedSlugs?: string[];
  seoTitle?: string; // optional SEO override (admin-controlled)
  seoDescription?: string; // optional meta-description override
}

export const ARTICLES: Article[] = [
  {
    slug: "the-art-of-quiet-luxury",
    title: "The Art of Quiet Luxury",
    excerpt:
      "Why restraint, not logos, is the truest mark of elegance — and how to build a wardrobe around it.",
    category: "Style Notes",
    readTime: "4 min read",
    date: "2026-06-12",
    image: "/images/brand/statement.jpg",
    body: [
      { type: "p", text: "Quiet luxury is less about what you wear and more about how it makes you feel. It is the weight of a well-cut crêpe, the way a hem falls, the absence of anything that shouts." },
      { type: "h2", text: "Begin with foundations" },
      { type: "p", text: "A considered wardrobe starts with a few enduring pieces in warm, neutral tones — an abaya that drapes beautifully, a kaftan that moves with you, a scarf that finishes everything." },
      { type: "h2", text: "Let fabric lead" },
      { type: "p", text: "Choose materials that age gracefully. Silk, matte crêpe and modal blends reward you over time, softening rather than wearing out." },
      { type: "p", text: "At MAZAL, every piece is designed with this philosophy in mind: crafted with intention, designed to endure." },
    ],
    relatedSlugs: ["sukoon-abaya", "thuraya-scarf", "noor-abaya"],
  },
  {
    slug: "styling-the-abaya-day-to-evening",
    title: "Styling the Abaya, Day to Evening",
    excerpt:
      "One abaya, three ways — a simple guide to taking a single piece from morning majlis to evening gathering.",
    category: "How to Wear",
    readTime: "5 min read",
    date: "2026-06-04",
    image: "/images/brand/collection-feature.jpg",
    body: [
      { type: "p", text: "The beauty of a MAZAL abaya is its versatility. With a few small changes, a single piece carries you through the whole day." },
      { type: "h2", text: "Morning ease" },
      { type: "p", text: "Keep it soft and unstructured. Pair a champagne abaya with flat mules and a featherweight scarf for a relaxed, polished daytime look." },
      { type: "h2", text: "Evening definition" },
      { type: "p", text: "Add a waist belt to define the silhouette, swap to a heeled mule, and finish with a structured clutch. The same abaya, transformed." },
    ],
    relatedSlugs: ["sukoon-abaya", "noujoum-waist-belt", "sadu-evening-clutch"],
  },
  {
    slug: "caring-for-fine-fabrics",
    title: "Caring for Fine Fabrics",
    excerpt:
      "How to keep silk, crêpe and modal looking their best — so your pieces endure for years.",
    category: "The Atelier",
    readTime: "3 min read",
    date: "2026-05-20",
    image: "/images/brand/about-2.jpg",
    body: [
      { type: "p", text: "Beautiful fabrics deserve thoughtful care. A little attention keeps your MAZAL pieces looking as considered as the day they arrived." },
      { type: "h2", text: "Storage" },
      { type: "p", text: "Hang structured pieces on padded hangers and fold knits to keep their shape. Give garments room to breathe." },
      { type: "h2", text: "Cleaning" },
      { type: "p", text: "Dry clean crêpe and embellished pieces; hand wash silks in cool water. Always iron on the reverse, on a low heat." },
    ],
    relatedSlugs: ["thuraya-scarf", "hams-scarf", "sakina-throw"],
  },
];

export function getArticles(): Article[] {
  return [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
