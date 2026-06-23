/** Shared helpers + option lists for the admin product form and API. */
import type { Product, Category, Badge, ColorOption } from "./products";

export const PALETTE: ColorOption[] = [
  { name: "Sand", hex: "#E7D9C4" },
  { name: "Champagne", hex: "#F1E6D4" },
  { name: "Bronze", hex: "#B0835C" },
  { name: "Espresso", hex: "#3A322B" },
  { name: "Pearl", hex: "#F6F1E9" },
  { name: "Noir", hex: "#211E1B" },
  { name: "Rose", hex: "#C9A39B" },
  { name: "Sage", hex: "#A9AE97" },
];

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "abayas", label: "Abayas" },
  { value: "kaftans", label: "Kaftans" },
  { value: "dresses", label: "Dresses" },
  { value: "modest", label: "Modest Wear" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "throws", label: "Throws" },
  { value: "scarves", label: "Scarves" },
  { value: "accessories", label: "Accessories" },
  { value: "bags", label: "Bags" },
  { value: "shoes", label: "Shoes" },
];

export const BADGE_OPTIONS: Badge[] = [
  "new",
  "bestseller",
  "trending",
  "limited",
  "sale",
];

export function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Build a clean Product from loosely-typed admin form input. */
export function normalizeProduct(
  input: Record<string, unknown>,
  existing?: Product,
): Product {
  const name = String(input.name ?? existing?.name ?? "Untitled").trim();
  const slug = slugify(String(input.slug ?? "") || name) || "item";
  const num = (v: unknown, d = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };
  const colorsIn = Array.isArray(input.colors) ? input.colors : existing?.colors;
  const colors: ColorOption[] =
    Array.isArray(colorsIn) && colorsIn.length
      ? (colorsIn as ColorOption[]).filter((c) => c && c.name && c.hex)
      : [PALETTE[0]];
  const has = (key: string) => Object.prototype.hasOwnProperty.call(input, key);
  const compareAtPrice =
    has("compareAtPrice") && input.compareAtPrice !== undefined
      ? input.compareAtPrice
        ? Math.round(num(input.compareAtPrice))
        : undefined
      : existing?.compareAtPrice;
  const material =
    has("material") ? String(input.material ?? "").trim() || undefined : existing?.material;
  const image =
    has("image") ? String(input.image ?? "").trim() || undefined : existing?.image;
  const images = Array.isArray(input.images)
    ? (input.images as unknown[]).map(String).filter(Boolean)
    : existing?.images;
  const care = Array.isArray(input.care)
    ? (input.care as unknown[]).map(String).filter(Boolean)
    : has("care")
      ? String(input.care ?? "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      : existing?.care;

  return {
    id: String(input.id ?? existing?.id ?? `p-${Date.now().toString(36)}`),
    slug,
    name,
    price: Math.max(0, Math.round(num(input.price, existing?.price ?? 0))),
    compareAtPrice,
    category: (String(
      input.category ?? existing?.category ?? "abayas",
    ) as Category),
    description: String(input.description ?? existing?.description ?? "").trim(),
    sizes:
      Array.isArray(input.sizes) && input.sizes.length
        ? (input.sizes as unknown[]).map(String)
        : existing?.sizes ?? ["One Size"],
    colors,
    material,
    care,
    rating: existing?.rating ?? 5,
    reviewCount: existing?.reviewCount ?? 0,
    stock: input.stock !== undefined ? num(input.stock, 10) : existing?.stock ?? 10,
    badges: Array.isArray(input.badges)
      ? (input.badges as Badge[])
      : existing?.badges,
    image,
    images,
    featured: Boolean(input.featured ?? existing?.featured ?? false),
    createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
  };
}
