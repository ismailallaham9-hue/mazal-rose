/**
 * MAZAL catalogue — mock data.
 *
 * Shaped like a real product API response so it can be swapped for a live
 * source later with minimal churn. Replace the bodies of getProducts() /
 * getProduct() with fetch() calls and keep the return types — the UI won't
 * need to change.
 */

export type Category =
  | "abayas"
  | "kaftans"
  | "dresses"
  | "modest"
  | "casual"
  | "formal"
  | "throws"
  | "scarves"
  | "accessories"
  | "bags"
  | "shoes";

export type Badge = "new" | "bestseller" | "trending" | "limited" | "sale";

export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number; // AED, integer (current price)
  compareAtPrice?: number; // AED — original price when on sale
  category: Category;
  description: string;
  sizes: string[];
  colors: ColorOption[];
  material?: string;
  care?: string[];
  rating?: number; // 0–5
  reviewCount?: number;
  stock?: number; // remaining units (drives low-stock urgency)
  badges?: Badge[];
  image?: string;
  images?: string[];
  featured?: boolean;
  createdAt?: string; // ISO — drives "new arrivals" ordering
}

export const CATEGORIES: { value: Category; label: string; blurb: string }[] = [
  { value: "abayas", label: "Abayas", blurb: "Fluid open & closed abayas" },
  { value: "kaftans", label: "Kaftans", blurb: "Relaxed, gilded silhouettes" },
  { value: "dresses", label: "Dresses", blurb: "Day to evening" },
  { value: "modest", label: "Modest Wear", blurb: "Considered everyday modesty" },
  { value: "formal", label: "Formal", blurb: "Occasion & eveningwear" },
  { value: "casual", label: "Casual", blurb: "Elevated essentials" },
  { value: "throws", label: "Throws", blurb: "Warm, weightless layers" },
  { value: "scarves", label: "Scarves", blurb: "The finishing note" },
  { value: "accessories", label: "Accessories", blurb: "Quiet details" },
  { value: "bags", label: "Bags", blurb: "Structured & soft" },
  { value: "shoes", label: "Shoes", blurb: "From flat to heel" },
];

export const CATEGORY_LABEL: Record<Category, string> = {
  abayas: "Abaya",
  kaftans: "Kaftan",
  dresses: "Dress",
  modest: "Modest",
  casual: "Casual",
  formal: "Formal",
  throws: "Throw",
  scarves: "Scarf",
  accessories: "Accessory",
  bags: "Bag",
  shoes: "Shoes",
};

const SAND: ColorOption = { name: "Sand", hex: "#E7D9C4" };
const CHAMPAGNE: ColorOption = { name: "Champagne", hex: "#F1E6D4" };
const BRONZE: ColorOption = { name: "Bronze", hex: "#B0835C" };
const ESPRESSO: ColorOption = { name: "Espresso", hex: "#3A322B" };
const PEARL: ColorOption = { name: "Pearl", hex: "#F6F1E9" };
const NOIR: ColorOption = { name: "Noir", hex: "#211E1B" };
const ROSE: ColorOption = { name: "Rose", hex: "#C9A39B" };
const SAGE: ColorOption = { name: "Sage", hex: "#A9AE97" };

export const PRODUCTS: Product[] = [
  {
    id: "abaya-sukoon",
    slug: "sukoon-abaya",
    name: "Sukoon Abaya",
    price: 1850,
    category: "abayas",
    description:
      "A fluid open abaya in matte crêpe, cut for quiet movement. Hand-finished seams and a softly draped collar make it a piece to live in, season after season.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [SAND, CHAMPAGNE, ESPRESSO],
    material: "100% matte crêpe (viscose blend)",
    care: ["Dry clean only", "Cool iron on reverse", "Store on a padded hanger"],
    rating: 4.9,
    reviewCount: 214,
    stock: 6,
    badges: ["bestseller"],
    featured: true,
    createdAt: "2026-02-10",
  },
  {
    id: "abaya-layl",
    slug: "layl-abaya",
    name: "Layl Abaya",
    price: 1980,
    compareAtPrice: 2200,
    category: "abayas",
    description:
      "Our evening abaya in deep noir crêpe, finished with a whisper of bronze thread along the placket. Designed to endure beyond a single occasion.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [NOIR, ESPRESSO],
    material: "Crêpe with metallic embroidery",
    care: ["Dry clean only", "Do not bleach"],
    rating: 4.8,
    reviewCount: 156,
    stock: 3,
    badges: ["sale", "limited"],
    featured: true,
    createdAt: "2026-01-22",
  },
  {
    id: "abaya-noor",
    slug: "noor-abaya",
    name: "Noor Abaya",
    price: 1980,
    category: "abayas",
    description:
      "A luminous champagne abaya with subtle tonal embroidery scattered like light across silk-touch fabric. Effortless from morning majlis to evening.",
    sizes: ["S", "M", "L", "XL"],
    colors: [CHAMPAGNE, SAND, PEARL],
    material: "Silk-touch satin crêpe",
    care: ["Dry clean only", "Cool iron on reverse"],
    rating: 5.0,
    reviewCount: 98,
    stock: 12,
    badges: ["trending"],
    featured: true,
    createdAt: "2026-05-30",
  },
  {
    id: "kaftan-hawa",
    slug: "hawa-kaftan",
    name: "Hawa Kaftan",
    price: 1450,
    category: "kaftans",
    description:
      "A breezy kaftan in featherweight georgette with a relaxed sleeve. Crafted with intention for warm evenings and unhurried gatherings.",
    sizes: ["One Size"],
    colors: [PEARL, SAND, BRONZE],
    material: "Featherweight georgette",
    care: ["Hand wash cold", "Line dry in shade"],
    rating: 4.7,
    reviewCount: 132,
    stock: 9,
    badges: ["bestseller"],
    image: "/images/brand/about-1.jpg",
    featured: true,
    createdAt: "2026-04-12",
  },
  {
    id: "kaftan-rimal",
    slug: "rimal-kaftan",
    name: "Rimal Kaftan",
    price: 1620,
    category: "kaftans",
    description:
      "Inspired by desert dunes at dusk — a sand-toned kaftan with a gilded neckline and a column silhouette that moves like air.",
    sizes: ["S", "M", "L"],
    colors: [SAND, CHAMPAGNE],
    material: "Satin-back crêpe",
    care: ["Dry clean only"],
    rating: 4.6,
    reviewCount: 64,
    stock: 15,
    createdAt: "2026-03-03",
  },
  {
    id: "kaftan-dhahab",
    slug: "dhahab-kaftan",
    name: "Dhahab Kaftan",
    price: 2450,
    category: "kaftans",
    description:
      "Our most ornate kaftan, with hand-applied bronze detailing across the bodice. A statement of still, golden elegance.",
    sizes: ["S", "M", "L", "XL"],
    colors: [BRONZE, CHAMPAGNE, ESPRESSO],
    material: "Crêpe with hand-applied beading",
    care: ["Dry clean specialist only", "Store flat"],
    rating: 4.9,
    reviewCount: 41,
    stock: 4,
    badges: ["limited", "trending"],
    featured: true,
    createdAt: "2026-05-18",
  },
  {
    id: "dress-sahar",
    slug: "sahar-slip-dress",
    name: "Sahar Slip Dress",
    price: 890,
    category: "dresses",
    description:
      "A bias-cut satin slip in champagne — the quiet hero of an evening wardrobe. Layer it under an abaya or wear it alone.",
    sizes: ["XS", "S", "M", "L"],
    colors: [CHAMPAGNE, NOIR, ROSE],
    material: "Satin (cupro blend)",
    care: ["Hand wash cold", "Hang to dry"],
    rating: 4.7,
    reviewCount: 73,
    stock: 11,
    badges: ["new"],
    createdAt: "2026-06-08",
  },
  {
    id: "dress-maysam",
    slug: "maysam-midi-dress",
    name: "Maysam Midi Dress",
    price: 1120,
    category: "formal",
    description:
      "A structured midi with a softly pleated skirt for occasion dressing. Considered tailoring, timeless line.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [SAGE, ESPRESSO, NOIR],
    material: "Tailored crêpe",
    care: ["Dry clean only"],
    rating: 4.8,
    reviewCount: 52,
    stock: 7,
    badges: ["new"],
    createdAt: "2026-06-14",
  },
  {
    id: "casual-yusra-set",
    slug: "yusra-knit-set",
    name: "Yusra Knit Set",
    price: 760,
    category: "casual",
    description:
      "A relaxed two-piece in soft ribbed knit — elevated loungewear that travels from home to errands with ease.",
    sizes: ["S", "M", "L"],
    colors: [SAND, SAGE, PEARL],
    material: "Ribbed cotton-modal knit",
    care: ["Machine wash cold", "Reshape & lay flat to dry"],
    rating: 4.5,
    reviewCount: 88,
    stock: 18,
    badges: ["trending"],
    createdAt: "2026-05-02",
  },
  {
    id: "throw-sakina",
    slug: "sakina-throw",
    name: "Sakina Throw",
    price: 980,
    category: "throws",
    description:
      "A generously sized throw in brushed wool-blend, warm and weightless. Equally at home around the shoulders or across a majlis seat.",
    sizes: ["One Size"],
    colors: [SAND, CHAMPAGNE, ESPRESSO],
    material: "Brushed wool-blend",
    care: ["Dry clean", "Do not wring"],
    rating: 4.9,
    reviewCount: 47,
    stock: 20,
    createdAt: "2026-02-28",
  },
  {
    id: "throw-ramad",
    slug: "ramad-throw",
    name: "Ramad Throw",
    price: 840,
    compareAtPrice: 1120,
    category: "throws",
    description:
      "A soft ash-toned throw woven with a fine bronze stripe at the edge. Designed to endure as an everyday heirloom.",
    sizes: ["One Size"],
    colors: [SAND, BRONZE],
    material: "Wool-cotton blend",
    care: ["Dry clean"],
    rating: 4.6,
    reviewCount: 29,
    stock: 5,
    badges: ["sale"],
    createdAt: "2026-01-15",
  },
  {
    id: "scarf-hams",
    slug: "hams-scarf",
    name: "Hams Scarf",
    price: 520,
    category: "scarves",
    description:
      "A whisper-light silk scarf with hand-rolled edges. A quiet finishing note — wear it long, looped, or draped.",
    sizes: ["One Size"],
    colors: [CHAMPAGNE, PEARL, BRONZE],
    material: "100% mulberry silk",
    care: ["Hand wash cold", "Cool iron"],
    rating: 4.8,
    reviewCount: 119,
    stock: 24,
    badges: ["bestseller"],
    createdAt: "2026-03-20",
  },
  {
    id: "scarf-thuraya",
    slug: "thuraya-scarf",
    name: "Thuraya Shawl-Scarf",
    price: 680,
    category: "scarves",
    description:
      "An oversized modal-silk shawl-scarf in pearl, soft enough for prayer and refined enough for evening. Effortless sophistication in a single fold.",
    sizes: ["One Size"],
    colors: [PEARL, SAND, ESPRESSO],
    material: "Modal-silk blend",
    care: ["Hand wash cold"],
    rating: 4.9,
    reviewCount: 86,
    stock: 16,
    createdAt: "2026-04-26",
  },
  {
    id: "acc-noujoum-belt",
    slug: "noujoum-waist-belt",
    name: "Noujoum Waist Belt",
    price: 340,
    category: "accessories",
    description:
      "A soft leather waist belt with a brushed-bronze buckle to define any abaya or dress. The quiet detail that finishes a look.",
    sizes: ["S/M", "L/XL"],
    colors: [BRONZE, ESPRESSO],
    material: "Full-grain leather, brass hardware",
    care: ["Wipe with a dry cloth", "Avoid moisture"],
    rating: 4.7,
    reviewCount: 38,
    stock: 13,
    badges: ["new"],
    createdAt: "2026-06-01",
  },
  {
    id: "bag-sadu-clutch",
    slug: "sadu-evening-clutch",
    name: "Sadu Evening Clutch",
    price: 620,
    category: "bags",
    description:
      "A structured clutch with a subtle woven texture and a detachable chain. Compact, considered, and quietly luxurious.",
    sizes: ["One Size"],
    colors: [CHAMPAGNE, NOIR, BRONZE],
    material: "Woven faux-leather, gold-tone chain",
    care: ["Store in dust bag"],
    rating: 4.6,
    reviewCount: 57,
    stock: 8,
    badges: ["trending"],
    createdAt: "2026-05-22",
  },
  {
    id: "shoes-rifaa-mule",
    slug: "rifaa-leather-mule",
    name: "Rifaa Leather Mule",
    price: 720,
    compareAtPrice: 900,
    category: "shoes",
    description:
      "A low square-toe mule in soft nappa with a comfort-cushioned footbed. Understated polish from day to evening.",
    sizes: ["36", "37", "38", "39", "40", "41"],
    colors: [SAND, ESPRESSO, NOIR],
    material: "Nappa leather upper, leather sole",
    care: ["Wipe clean", "Use shoe trees"],
    rating: 4.5,
    reviewCount: 64,
    stock: 5,
    badges: ["sale"],
    createdAt: "2026-04-04",
  },
  {
    id: "abaya-safa",
    slug: "safa-abaya",
    name: "Safa Abaya",
    price: 1760,
    category: "abayas",
    description:
      "A pared-back everyday abaya in pearl crêpe with a clean, collarless line. Stillness, distilled.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [PEARL, SAND, ESPRESSO],
    material: "Matte crêpe",
    care: ["Dry clean only"],
    rating: 4.8,
    reviewCount: 71,
    stock: 14,
    createdAt: "2026-03-12",
  },
  {
    id: "modest-amaya-set",
    slug: "amaya-modest-set",
    name: "Amaya Modest Set",
    price: 980,
    category: "modest",
    description:
      "A coordinated tunic-and-trouser set in fluid crêpe — modest, modern, and endlessly easy to wear.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [SAND, SAGE, NOIR],
    material: "Fluid crêpe",
    care: ["Machine wash gentle", "Cool iron"],
    rating: 4.7,
    reviewCount: 44,
    stock: 10,
    badges: ["new", "trending"],
    createdAt: "2026-06-10",
  },
];

/* ── Data access — swap these for a real API later ──────────── */

export async function getProducts(): Promise<Product[]> {
  return PRODUCTS;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductSync(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getFeatured(): Product[] {
  return PRODUCTS.filter((p) => p.featured);
}

export function getByCategory(category: Category): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getBadged(badge: Badge): Product[] {
  return PRODUCTS.filter((p) => p.badges?.includes(badge));
}

export const getBestSellers = () => getBadged("bestseller");
export const getTrending = () => getBadged("trending");
export const getOnSale = () =>
  PRODUCTS.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);

export function getNewArrivals(limit = 8): Product[] {
  return [...PRODUCTS]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, limit);
}

/** Simple related-products heuristic: same category, then fill from others. */
export function getRelated(product: Product, limit = 4): Product[] {
  const same = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );
  const others = PRODUCTS.filter(
    (p) => p.category !== product.category && p.id !== product.id,
  );
  return [...same, ...others].slice(0, limit);
}

/** "Complete the look" — complementary categories. */
export function getCompleteTheLook(product: Product, limit = 3): Product[] {
  const complementary: Record<Category, Category[]> = {
    abayas: ["scarves", "bags", "shoes"],
    kaftans: ["accessories", "bags", "shoes"],
    dresses: ["shoes", "bags", "accessories"],
    modest: ["scarves", "shoes", "bags"],
    formal: ["bags", "shoes", "accessories"],
    casual: ["shoes", "accessories", "bags"],
    throws: ["scarves", "abayas", "kaftans"],
    scarves: ["abayas", "kaftans", "bags"],
    accessories: ["abayas", "dresses", "bags"],
    bags: ["abayas", "dresses", "shoes"],
    shoes: ["dresses", "abayas", "bags"],
  };
  const wanted = complementary[product.category] ?? [];
  const picks: Product[] = [];
  for (const cat of wanted) {
    const found = PRODUCTS.find(
      (p) => p.category === cat && p.id !== product.id && !picks.includes(p),
    );
    if (found) picks.push(found);
  }
  return picks.slice(0, limit);
}

export function discountPercent(p: Product): number | null {
  if (!p.compareAtPrice || p.compareAtPrice <= p.price) return null;
  return Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
}
