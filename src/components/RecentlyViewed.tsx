"use client";

import { useEffect, useState } from "react";
import { ProductRail } from "./ProductRail";
import { PRODUCTS, type Product } from "@/lib/products";

const RECENT_KEY = "mazal.recent.v1";

/** Reads recently-viewed ids from localStorage and renders them as a rail. */
export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const ids: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
        const list = ids
          .filter((itemId) => itemId !== excludeId)
          .map((itemId) => PRODUCTS.find((p) => p.id === itemId))
          .filter((p): p is Product => Boolean(p));
        setItems(list);
      } catch {
        /* ignore */
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [excludeId]);

  if (items.length < 2) return null;

  return (
    <ProductRail
      eyebrow="Continue browsing"
      title="Recently Viewed"
      products={items}
      tone="cream"
    />
  );
}
