import { NextResponse } from "next/server";
import { getStoreData, saveStoreData, type StoreData } from "@/lib/store";
import { whatsappNumber } from "@/lib/site";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

export const runtime = "nodejs";

function mergeSettings(
  current: StoreData["settings"],
  incoming: Partial<StoreData["settings"]> = {},
): StoreData["settings"] {
  const nextWhatsapp = {
    ...current.whatsapp,
    ...(incoming.whatsapp ?? {}),
  };
  const cleanWhatsappNumber = whatsappNumber(nextWhatsapp.number);

  return {
    ...current,
    ...incoming,
    whatsapp: {
      ...nextWhatsapp,
      number: cleanWhatsappNumber || current.whatsapp.number,
    },
    social: {
      ...current.social,
      ...(incoming.social ?? {}),
    },
    contact: {
      ...current.contact,
      ...(incoming.contact ?? {}),
    },
    stats: Array.isArray(incoming.stats) ? incoming.stats : current.stats,
  };
}

function mergePages(
  current: StoreData["pages"],
  incoming: Partial<StoreData["pages"]> = {},
): StoreData["pages"] {
  return {
    ...current,
    ...incoming,
    home: { ...current.home, ...(incoming.home ?? {}) },
    about: { ...current.about, ...(incoming.about ?? {}) },
    contact: { ...current.contact, ...(incoming.contact ?? {}) },
    shop: { ...current.shop, ...(incoming.shop ?? {}) },
    seo: { ...current.seo, ...(incoming.seo ?? {}) },
    footer: {
      ...current.footer,
      ...(incoming.footer ?? {}),
      columns: Array.isArray(incoming.footer?.columns)
        ? incoming.footer.columns
        : current.footer.columns,
    },
  };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<StoreData>;
  const current = await getStoreData();
  const next: StoreData = {
    ...current,
    ...body,
    content: { ...current.content, ...(body.content ?? {}) },
    theme: { ...current.theme, ...(body.theme ?? {}) },
    settings: mergeSettings(current.settings, body.settings),
    seo: { ...current.seo, ...(body.seo ?? {}) },
    seoRecords: { ...current.seoRecords, ...(body.seoRecords ?? {}) },
    pages: mergePages(current.pages, body.pages),
    products: Array.isArray(body.products) ? body.products : current.products,
    categories: Array.isArray(body.categories)
      ? body.categories
      : current.categories,
    articles: Array.isArray(body.articles) ? body.articles : current.articles,
    orders: Array.isArray(body.orders) ? body.orders : current.orders,
    inquiries: Array.isArray(body.inquiries)
      ? body.inquiries
      : current.inquiries,
    subscribers: Array.isArray(body.subscribers)
      ? body.subscribers
      : current.subscribers,
    emailEvents: Array.isArray(body.emailEvents)
      ? body.emailEvents
      : current.emailEvents,
    media: Array.isArray(body.media) ? body.media : current.media,
  };

  await saveStoreData(next);
  revalidateStorefront({ products: next.products, articles: next.articles });
  return NextResponse.json({ store: next });
}
