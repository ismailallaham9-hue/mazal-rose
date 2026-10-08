export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID ||
  process.env.META_PIXEL_ID ||
  "2136787320560677";

export const META_CURRENCY = "AED";

export type MetaStandardEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

export type MetaContent = {
  id: string;
  quantity?: number;
  item_price?: number;
};

export type MetaEventPayload = {
  event_id: string;
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: "product" | "product_group";
  contents?: MetaContent[];
  num_items?: number;
  event_source_url?: string;
};

export function newMetaEventId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}:${Date.now()}:${random}`;
}
