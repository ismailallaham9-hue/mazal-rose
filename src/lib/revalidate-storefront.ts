import "server-only";

import { revalidatePath } from "next/cache";
import type { Article } from "./articles";
import type { Product } from "./products";

const PUBLIC_PATHS = [
  "/",
  "/shop",
  "/journal",
  "/about",
  "/contact",
  "/returns",
  "/shipping",
  "/privacy",
  "/terms",
  "/account",
  "/wishlist",
  "/cart",
  "/checkout",
  "/rewards",
  "/sitemap.xml",
  "/robots.txt",
];

export function revalidateStorefront({
  products = [],
  articles = [],
}: {
  products?: Pick<Product, "slug">[];
  articles?: Pick<Article, "slug">[];
} = {}) {
  revalidatePath("/", "layout");
  revalidatePath("/shop/[slug]", "page");
  revalidatePath("/journal/[slug]", "page");

  for (const path of PUBLIC_PATHS) revalidatePath(path);
  for (const product of products) revalidatePath(`/shop/${product.slug}`);
  for (const article of articles) revalidatePath(`/journal/${article.slug}`);
}
