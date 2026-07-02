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

const NAMED_COLORS: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  ivory: "#fffff0",
  cream: "#fdf7f3",
  beige: "#f5f5dc",
  sand: "#e7d9c4",
  champagne: "#f1e6d4",
  brown: "#8b4513",
  espresso: "#3a322b",
  bronze: "#b0835c",
  gold: "#d4af37",
  silver: "#c0c0c0",
  grey: "#808080",
  gray: "#808080",
  charcoal: "#36454f",
  navy: "#000080",
  blue: "#0000ff",
  "sky blue": "#87ceeb",
  "light blue": "#add8e6",
  teal: "#008080",
  turquoise: "#40e0d0",
  green: "#008000",
  sage: "#a9ae97",
  olive: "#808000",
  red: "#ff0000",
  burgundy: "#800020",
  maroon: "#800000",
  pink: "#ffc0cb",
  rose: "#c9a39b",
  purple: "#800080",
  lavender: "#e6e6fa",
  orange: "#ffa500",
  yellow: "#ffff00",
};

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function normalizeColorHex(value: string): string | null {
  const clean = value.trim();
  const hex = clean.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (hex) {
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((char) => char + char)
            .join("")
        : hex;
    return `#${full.toLowerCase()}`;
  }
  return NAMED_COLORS[clean.toLowerCase()] ?? null;
}

export function parseColorInput(value: string): ColorOption | null {
  const line = value.trim();
  if (!line) return null;
  const hexMatch = line.match(/#?[0-9a-f]{3}(?:[0-9a-f]{3})?/i);
  const hex = hexMatch ? normalizeColorHex(hexMatch[0]) : null;
  const namePart = hexMatch
    ? line.slice(0, hexMatch.index).trim().replace(/[,=:/-]+$/g, "").trim()
    : line.trim().replace(/[,=:/-]+$/g, "").trim();
  const namedHex = normalizeColorHex(namePart);
  const resolvedHex = hex ?? namedHex;
  if (!resolvedHex) return null;
  const knownName =
    Object.entries(NAMED_COLORS).find(([, value]) => value === resolvedHex)?.[0] ??
    "";
  const name = namePart && !normalizeColorHex(namePart)
    ? titleCase(namePart)
    : titleCase(knownName || "Custom");
  return { name, hex: resolvedHex };
}

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

export const SIZE_OPTIONS = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "One Size",
  "S/M",
  "L/XL",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
];

export function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function parseSizeInput(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[\n,]+/)
      : [];
  const seen = new Set<string>();
  return raw
    .map((item) => String(item).trim().replace(/\s+/g, " "))
    .filter((item) => {
      if (!item || seen.has(item)) return false;
      seen.add(item);
      return true;
    });
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
  const has = (key: string) => Object.prototype.hasOwnProperty.call(input, key);
  const optionalText = (key: string, fallback: string | undefined) =>
    has(key) ? String(input[key] ?? "").trim() || undefined : fallback;
  const colorsIn = Array.isArray(input.colors) ? input.colors : existing?.colors;
  const colors: ColorOption[] =
    Array.isArray(colorsIn) && colorsIn.length
      ? (colorsIn as ColorOption[])
          .map((c) => {
            if (!c?.name && !c?.hex) return null;
            const parsed = parseColorInput(`${c.name ?? ""} ${c.hex ?? ""}`);
            return parsed ?? null;
          })
          .filter((c): c is ColorOption => Boolean(c))
      : [PALETTE[0]];
  const parsedSizes = parseSizeInput(input.sizes);
  const sizes = parsedSizes.length ? parsedSizes : existing?.sizes ?? ["One Size"];
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
  const sizeSet = new Set(sizes);
  const colorSet = new Set(colors.map((color) => color.name));
  const variantStock = has("variantStock")
    ? input.variantStock && typeof input.variantStock === "object"
      ? Object.fromEntries(
          Object.entries(input.variantStock as Record<string, unknown>)
            .map(([key, value]) => [key, Math.max(0, Math.floor(num(value)))] as const)
            .filter(([key]) => {
              const [size, color] = key.split("::");
              return Boolean(key) && sizeSet.has(size) && colorSet.has(color);
            }),
        )
      : undefined
    : existing?.variantStock;

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
    sizes,
    colors,
    material,
    care,
    rating: existing?.rating ?? 5,
    reviewCount: existing?.reviewCount ?? 0,
    fitNotes: optionalText("fitNotes", existing?.fitNotes),
    sizeGuide: optionalText("sizeGuide", existing?.sizeGuide),
    longDescription: optionalText("longDescription", existing?.longDescription),
    specifications: optionalText("specifications", existing?.specifications),
    deliveryInfo: optionalText("deliveryInfo", existing?.deliveryInfo),
    returnInfo: optionalText("returnInfo", existing?.returnInfo),
    stylingNotes: optionalText("stylingNotes", existing?.stylingNotes),
    occasionUseCase: optionalText("occasionUseCase", existing?.occasionUseCase),
    imageAltText: optionalText("imageAltText", existing?.imageAltText),
    stock: input.stock !== undefined ? num(input.stock, 10) : existing?.stock ?? 10,
    variantStock,
    badges: Array.isArray(input.badges)
      ? (input.badges as Badge[])
      : existing?.badges,
    image,
    images,
    featured: Boolean(input.featured ?? existing?.featured ?? false),
    published: has("published") ? Boolean(input.published) : existing?.published,
    createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
    seoTitle: has("seoTitle")
      ? String(input.seoTitle ?? "").trim() || undefined
      : existing?.seoTitle,
    seoDescription: has("seoDescription")
      ? String(input.seoDescription ?? "").trim() || undefined
      : existing?.seoDescription,
  };
}
