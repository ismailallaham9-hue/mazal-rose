import ShopPage, { generateMetadata as shopMetadata } from "@/app/shop/page";

/**
 * Cached variant of /shop. The proxy (src/middleware.ts) rewrites
 * /shop?category=…&sort=… here so each filter combination is rendered once
 * and served from the ISR cache, instead of re-rendering /shop on every visit
 * (reading searchParams makes a page fully dynamic). The URL in the browser
 * stays /shop?…, and canonical metadata still points at /shop.
 */
type Params = { params: Promise<{ category: string; sort: string }> };

async function toSearchParams(params: Params["params"]) {
  const { category, sort } = await params;
  return {
    category: category === "all" ? undefined : category,
    sort: sort === "featured" ? undefined : sort,
  };
}

export function generateStaticParams() {
  return [];
}

export function generateMetadata({ params }: Params) {
  return shopMetadata({ searchParams: toSearchParams(params) });
}

export default function ShopListingPage({ params }: Params) {
  return ShopPage({ searchParams: toSearchParams(params) });
}
