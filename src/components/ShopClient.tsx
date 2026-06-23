"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { clsx } from "@/lib/clsx";
import {
  CATEGORIES,
  type Product,
  discountPercent,
} from "@/lib/products";
import type { StoreCategory } from "@/lib/store";

type SortKey = "featured" | "new" | "price-asc" | "price-desc" | "rating";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export function ShopClient({
  products,
  categories,
  initialCategory,
  initialSort = "featured",
}: {
  products: Product[];
  categories?: StoreCategory[];
  initialCategory?: string;
  initialSort?: SortKey;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const availableCategories: StoreCategory[] = categories?.length
    ? categories
    : CATEGORIES.map((c, order) => ({ ...c, hidden: false, order }));
  const [category, setCategory] = useState<string | "all">(
    initialCategory ?? "all",
  );
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(0); // 0 = no cap
  const [onSaleOnly, setOnSaleOnly] = useState(
    searchParams.get("sort") === "sale",
  );
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const allSizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes))),
    [products],
  );
  const allColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => p.colors.forEach((c) => map.set(c.name, c.hex)));
    return Array.from(map, ([name, hex]) => ({ name, hex }));
  }, [products]);
  const priceCeiling = useMemo(
    () => Math.max(...products.map((p) => p.price)),
    [products],
  );

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (sizes.length && !p.sizes.some((s) => sizes.includes(s))) return false;
      if (colors.length && !p.colors.some((c) => colors.includes(c.name)))
        return false;
      if (maxPrice && p.price > maxPrice) return false;
      if (onSaleOnly && !discountPercent(p)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0);
        case "new":
          return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
    return list;
  }, [products, category, sizes, colors, maxPrice, onSaleOnly, sort]);

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  function selectCategory(c: string | "all") {
    setCategory(c);
    const params = new URLSearchParams(searchParams.toString());
    if (c === "all") params.delete("category");
    else params.set("category", c);
    router.replace(`/shop${params.toString() ? `?${params}` : ""}`, {
      scroll: false,
    });
  }

  const activeCount =
    (category !== "all" ? 1 : 0) +
    sizes.length +
    colors.length +
    (maxPrice ? 1 : 0) +
    (onSaleOnly ? 1 : 0);

  function clearAll() {
    setCategory("all");
    setSizes([]);
    setColors([]);
    setMaxPrice(0);
    setOnSaleOnly(false);
    router.replace("/shop", { scroll: false });
  }

  const Filters = (
    <div className="space-y-8">
      <FilterGroup label="Category">
        <ul className="space-y-2">
          <li>
            <FilterRadio
              checked={category === "all"}
              onChange={() => selectCategory("all")}
              label="All pieces"
            />
          </li>
          {availableCategories.filter((c) => !c.hidden).map((c) => (
            <li key={c.value}>
              <FilterRadio
                checked={category === c.value}
                onChange={() => selectCategory(c.value)}
                label={c.label}
              />
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup label="Size">
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggle(sizes, s, setSizes)}
              className={clsx(
                "min-w-9 border px-2.5 py-1.5 text-xs transition-colors",
                sizes.includes(s)
                  ? "border-bronze bg-bronze text-cream-soft"
                  : "border-sand-deep text-ink hover:border-bronze",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Colour">
        <div className="flex flex-wrap gap-2.5">
          {allColors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => toggle(colors, c.name, setColors)}
              title={c.name}
              aria-pressed={colors.includes(c.name)}
              className={clsx(
                "h-7 w-7 rounded-full ring-1 ring-ink/15 transition-transform",
                colors.includes(c.name) &&
                  "ring-2 ring-bronze ring-offset-2 ring-offset-cream",
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label={`Max price${maxPrice ? `: AED ${maxPrice}` : ""}`}>
        <input
          type="range"
          min={Math.min(...products.map((p) => p.price))}
          max={priceCeiling}
          step={50}
          value={maxPrice || priceCeiling}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-bronze"
        />
      </FilterGroup>

      <FilterGroup label="Offers">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={onSaleOnly}
            onChange={(e) => setOnSaleOnly(e.target.checked)}
            className="accent-bronze"
          />
          On sale only
        </label>
      </FilterGroup>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs uppercase tracking-[0.18em] text-bronze hover:text-bronze-deep"
        >
          Clear all ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      {/* Desktop filters */}
      <aside className="hidden lg:block">{Filters}</aside>

      <div>
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 border-b border-sand-deep/50 pb-4">
          <p className="text-sm text-ink-soft">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="text-xs uppercase tracking-[0.18em] text-ink lg:hidden"
            >
              Filters{activeCount ? ` (${activeCount})` : ""}
            </button>
            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-soft">
              <span className="hidden sm:inline">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="border border-sand-deep bg-cream-soft px-3 py-2 text-xs text-ink focus:border-bronze focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Grid */}
        {filtered.length ? (
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 3} />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="font-serif text-2xl text-ink">No pieces match.</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 text-sm uppercase tracking-[0.18em] text-bronze"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-cream-soft p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-xl">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {Filters}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-8 w-full bg-bronze py-3 text-xs uppercase tracking-[0.2em] text-cream-soft"
            >
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink">
        {label}
      </h3>
      {children}
    </div>
  );
}

function FilterRadio({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={clsx(
        "text-sm transition-colors",
        checked ? "text-bronze" : "text-ink-soft hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
