"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SeoFields, SeoRecord, StoreData } from "@/lib/store";
import {
  scoreSeo,
  suggestForCategory,
  type Check,
  type EntityType,
  type StudyContext,
} from "@/lib/seo-studio";

type Entity = {
  key: string;
  label: string;
  group: string;
  type: EntityType;
  ref?: string; // category value / product slug / article slug / city slug
  path: string; // public path (for canonical + preview)
};

const CITIES = [
  { slug: "dubai", name: "Dubai" },
  { slug: "abu-dhabi", name: "Abu Dhabi" },
  { slug: "sharjah", name: "Sharjah" },
  { slug: "ajman", name: "Ajman" },
  { slug: "ras-al-khaimah", name: "Ras Al Khaimah" },
];

const SCHEMA_TYPES = [
  "WebPage",
  "Organization",
  "Product",
  "CollectionPage",
  "Article",
  "FAQPage",
  "BreadcrumbList",
] as const;

const CONTENT_TYPES = ["Page", "Product", "Category", "City", "Article", "Global"] as const;
const entityContentType = (type: EntityType) =>
  type === "product" ? "Product" : type === "category" ? "Category" : type === "city" ? "City" : type === "article" ? "Article" : type === "global" ? "Global" : "Page";

function liveSeo(record?: SeoRecord): SeoFields {
  if (!record) return {};
  if (record.published) return record.published;
  if (record.status === "draft") return {};
  const legacy: SeoRecord = { ...record };
  delete legacy.draft;
  delete legacy.published;
  delete legacy.status;
  delete legacy.updatedAt;
  delete legacy.updatedBy;
  delete legacy.publishedAt;
  return legacy;
}

function editSeo(record?: SeoRecord): SeoFields {
  return { ...liveSeo(record), ...(record?.draft ?? {}) };
}

function splitFaqs(value?: string) {
  return (value ?? "")
    .split(/\n{2,}/)
    .map((block) => {
      const [q = "", ...answer] = block.split("\n");
      return { q: q.replace(/^Q:\s*/i, "").trim(), a: answer.join("\n").replace(/^A:\s*/i, "").trim() };
    })
    .filter((faq) => faq.q || faq.a);
}

function joinFaqs(faqs?: { q: string; a: string }[]) {
  return (faqs ?? []).map((faq) => `${faq.q}\n${faq.a}`).join("\n\n");
}

export function ContentStudio({
  initialStore,
  storageReady,
}: {
  initialStore: StoreData;
  storageReady: boolean;
}) {
  const [store, setStore] = useState(initialStore);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const entities = useMemo<Entity[]>(() => {
    const list: Entity[] = [
      { key: "global", label: "Global SEO defaults", group: "Site", type: "global", path: "/" },
      { key: "home", label: "Homepage", group: "Pages", type: "home", path: "/" },
      { key: "shop", label: "Shop", group: "Pages", type: "shop", path: "/shop" },
      { key: "page:about", label: "About", group: "Pages", type: "page", ref: "about", path: "/about" },
      { key: "page:contact", label: "Contact", group: "Pages", type: "page", ref: "contact", path: "/contact" },
      { key: "page:rewards", label: "Rewards", group: "Pages", type: "page", ref: "rewards", path: "/rewards" },
      { key: "journal", label: "Journal", group: "Pages", type: "page", ref: "journal", path: "/journal" },
    ];
    for (const c of store.categories)
      list.push({ key: `category:${c.value}`, label: c.label, group: "Categories", type: "category", ref: c.value, path: `/shop?category=${c.value}` });
    for (const city of CITIES)
      list.push({ key: `city:${city.slug}`, label: city.name, group: "City pages", type: "city", ref: city.slug, path: `/abayas/${city.slug}` });
    for (const p of store.products)
      list.push({ key: `product:${p.slug}`, label: p.name, group: "Products", type: "product", ref: p.slug, path: `/shop/${p.slug}` });
    for (const a of store.articles)
      list.push({ key: `article:${a.slug}`, label: a.title, group: "Journal articles", type: "article", ref: a.slug, path: `/journal/${a.slug}` });
    return list;
  }, [store.categories, store.products, store.articles]);

  const [selectedKey, setSelectedKey] = useState("home");
  const entity = entities.find((e) => e.key === selectedKey) ?? entities[1];

  const rec: SeoRecord = store.seoRecords[entity.key] ?? {};
  const draft = editSeo(rec);
  const setRec = (patch: Partial<SeoFields>) =>
    setStore((s) => {
      const current = s.seoRecords[entity.key] ?? {};
      return {
        ...s,
        seoRecords: {
          ...s.seoRecords,
          [entity.key]: {
            ...current,
            status: "draft",
            draft: { ...editSeo(current), ...patch },
            updatedAt: new Date().toISOString(),
            updatedBy: "Admin",
          },
        },
      };
    });

  // ── content getters/setters by entity ──────────────────────────────
  const category = entity.type === "category" ? store.categories.find((c) => c.value === entity.ref) : undefined;
  const product = entity.type === "product" ? store.products.find((p) => p.slug === entity.ref) : undefined;
  const article = entity.type === "article" ? store.articles.find((a) => a.slug === entity.ref) : undefined;

  // ── derive H1 / intro / body for scoring ───────────────────────────
  const ctx: StudyContext = useMemo(() => {
    if (entity.type === "category" && category)
      return { type: "category", name: category.label, h1: category.label, intro: category.blurb, bodyText: category.blurb };
    if (entity.type === "product" && product)
      return { type: "product", name: product.name, h1: product.name, intro: product.description, bodyText: product.description, hasMaterial: !!product.material, hasCare: !!(product.care && product.care.length), hasImageAlt: !!product.image, hasFAQ: true };
    if (entity.type === "article" && article)
      return { type: "article", name: article.title, h1: article.title, intro: article.excerpt, bodyText: article.body.map((b) => b.text).join(" ") };
    if (entity.type === "home")
      return { type: "home", name: store.settings.name, h1: store.content.heroTitle, intro: store.content.heroSubtitle, bodyText: store.content.heroSubtitle };
    if (entity.type === "shop")
      return { type: "shop", name: "Shop", h1: store.pages.shop.title, intro: store.pages.shop.blurb, bodyText: store.pages.shop.blurb };
    if (entity.type === "city")
      return { type: "city", name: CITIES.find((c) => c.slug === entity.ref)?.name ?? "", h1: draft.h1 || `Luxury Abayas in ${CITIES.find((c) => c.slug === entity.ref)?.name}`, intro: draft.intro || draft.metaDescription, bodyText: draft.body || draft.metaDescription };
    if (entity.type === "page")
      return { type: "page", name: entity.label, h1: draft.h1 || entity.label, intro: draft.intro || draft.metaDescription, bodyText: draft.body || draft.metaDescription };
    return { type: "global", name: store.settings.name, h1: store.seo.defaultTitle, intro: store.seo.defaultDescription, bodyText: store.seo.defaultDescription };
  }, [entity, category, product, article, store, draft.h1, draft.intro, draft.body, draft.metaDescription]);

  // Effective values: show what's actually live (from existing fields) until
  // the Studio record overrides them, so the score reflects reality.
  const pageKeyFor = entity.type === "home" ? "home" : entity.type === "shop" ? "shop" : entity.ref;
  const existing = {
    title:
      entity.type === "category" ? category?.seoTitle :
      entity.type === "product" ? product?.seoTitle :
      entity.type === "article" ? article?.seoTitle :
      entity.type === "global" ? store.seo.defaultTitle :
      pageKeyFor ? store.pages.seo[pageKeyFor]?.title : undefined,
    desc:
      entity.type === "category" ? category?.seoDescription :
      entity.type === "product" ? product?.seoDescription :
      entity.type === "article" ? article?.seoDescription :
      entity.type === "global" ? store.seo.defaultDescription :
      pageKeyFor ? store.pages.seo[pageKeyFor]?.description : undefined,
    og:
      entity.type === "global" ? store.seo.defaultOgImage :
      entity.type === "product" ? product?.image :
      entity.type === "article" ? article?.image :
      pageKeyFor ? store.pages.seo[pageKeyFor]?.ogImage : undefined,
  };
  const eff = {
    seoTitle: draft.seoTitle ?? existing.title ?? "",
    metaDescription: draft.metaDescription ?? existing.desc ?? "",
    ogImage: draft.ogImage ?? existing.og ?? "",
  };

  const { score, checks } = scoreSeo({ ...rec, ...eff }, ctx);
  const band = score >= 80 ? { label: "Good", cls: "bg-green-700" } : score >= 50 ? { label: "Needs work", cls: "bg-amber-600" } : { label: "Problem", cls: "bg-red-700" };

  const base = (store.settings.url || "https://mazal.ae").replace(/\/$/, "");
  const previewTitle = eff.seoTitle || ctx.h1 || store.seo.defaultTitle;
  const previewDesc = eff.metaDescription || store.seo.defaultDescription;

  // ── save: mirror SEO into the live-wired fields + persist ───────────
  async function persist(next: StoreData, success: string) {
    setBusy(true);
    setStatus("Saving...");
    const resp = await fetch("/api/admin/store", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
    const data = await resp.json().catch(() => ({}));
    setBusy(false);
    if (!resp.ok) { setStatus(data.error || "Could not save."); return; }
    setStore(data.store);
    setStatus(success);
  }

  async function saveDraft() {
    const next: StoreData = JSON.parse(JSON.stringify(store));
    next.seoRecords[entity.key] = {
      ...(next.seoRecords[entity.key] ?? {}),
      status: "draft",
      draft: { ...draft },
      updatedAt: new Date().toISOString(),
      updatedBy: "Admin",
    };
    await persist(next, "Draft saved — live website unchanged.");
  }

  async function publish() {
    const next: StoreData = JSON.parse(JSON.stringify(store));
    const r = { ...(next.seoRecords[entity.key] ?? {}), published: { ...draft }, status: "published" as const, publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: "Admin" };
    next.seoRecords[entity.key] = r;
    const live = r.published ?? {};
    const t = live.seoTitle?.trim();
    const d = live.metaDescription?.trim();
    const og = live.ogImage?.trim();
    if (entity.type === "category") {
      const c = next.categories.find((x) => x.value === entity.ref);
      if (c) { if (live.h1) c.label = live.h1; if (live.intro || live.body) c.blurb = live.intro || live.body || c.blurb; if (t) c.seoTitle = t; if (d) c.seoDescription = d; }
    } else if (entity.type === "product") {
      const p = next.products.find((x) => x.slug === entity.ref);
      if (p) {
        if (live.productName || live.h1) p.name = live.productName || live.h1 || p.name;
        if (live.shortDescription) p.description = live.shortDescription;
        if (live.longDescription) p.longDescription = live.longDescription;
        if (live.specifications) p.specifications = live.specifications;
        if (live.fabric) p.material = live.fabric;
        if (live.careInstructions) p.care = live.careInstructions.split("\n").map((x) => x.trim()).filter(Boolean);
        if (live.fitNotes) p.fitNotes = live.fitNotes;
        if (Object.prototype.hasOwnProperty.call(live, "sizeGuide")) {
          p.sizeGuide = live.sizeGuide?.trim() || undefined;
        }
        if (live.deliveryInformation) p.deliveryInfo = live.deliveryInformation;
        if (live.returnExchangeInformation) p.returnInfo = live.returnExchangeInformation;
        if (live.stylingNotes) p.stylingNotes = live.stylingNotes;
        if (live.occasionUseCase) p.occasionUseCase = live.occasionUseCase;
        if (live.imageAltText) p.imageAltText = live.imageAltText;
        if (t) p.seoTitle = t;
        if (d) p.seoDescription = d;
      }
    } else if (entity.type === "article") {
      const a = next.articles.find((x) => x.slug === entity.ref);
      if (a) { if (live.h1 || live.pageTitle) a.title = live.h1 || live.pageTitle || a.title; if (live.intro) a.excerpt = live.intro; if (live.body) a.body = live.body.split(/\n\n+/).map((part) => part.startsWith("## ") ? { type: "h2" as const, text: part.slice(3).trim() } : { type: "p" as const, text: part.trim() }).filter((b) => b.text); if (t) a.seoTitle = t; if (d) a.seoDescription = d; }
    } else if (entity.type === "global") {
      if (t) next.seo.defaultTitle = t;
      if (d) next.seo.defaultDescription = d;
      if (og) next.seo.defaultOgImage = og;
    } else if (entity.type === "home") {
      if (live.heroEyebrow) next.content.heroEyebrow = live.heroEyebrow;
      if (live.heroHeading || live.h1) next.content.heroTitle = live.heroHeading || live.h1 || next.content.heroTitle;
      if (live.heroSubheading || live.intro) next.content.heroSubtitle = live.heroSubheading || live.intro || next.content.heroSubtitle;
      if (live.ctaText) next.content.heroCtaText = live.ctaText;
      if (live.ctaLink) next.content.heroCtaHref = live.ctaLink;
      next.pages.seo.home = { ...(next.pages.seo.home ?? {}), ...(t ? { title: t } : {}), ...(d ? { description: d } : {}), ...(og ? { ogImage: og } : {}) };
    } else if (entity.type === "shop") {
      if (live.h1 || live.pageTitle) next.pages.shop.title = live.h1 || live.pageTitle || next.pages.shop.title;
      if (live.intro || live.body) next.pages.shop.blurb = live.intro || live.body || next.pages.shop.blurb;
      next.pages.seo.shop = { ...(next.pages.seo.shop ?? {}), ...(t ? { title: t } : {}), ...(d ? { description: d } : {}), ...(og ? { ogImage: og } : {}) };
    } else {
      const pk = entity.ref ?? entity.key;
      if (entity.type === "page" && entity.ref === "about") {
        if (live.h1 || live.pageTitle) next.pages.about.title = live.h1 || live.pageTitle || next.pages.about.title;
        if (live.body) next.pages.about.body = live.body;
      }
      if (entity.type === "page" && entity.ref === "contact") {
        if (live.h1 || live.pageTitle) next.pages.contact.title = live.h1 || live.pageTitle || next.pages.contact.title;
        if (live.body) next.pages.contact.body = live.body;
      }
      next.pages.seo[pk] = { ...(next.pages.seo[pk] ?? {}), ...(t ? { title: t } : {}), ...(d ? { description: d } : {}), ...(og ? { ogImage: og } : {}) };
    }
    await persist(next, "Published — live metadata/content updated.");
  }

  function applySuggestions() {
    if (entity.type === "category" && category) {
      const s = suggestForCategory(category.label, category.value);
      setRec({ seoTitle: s.seoTitle, metaDescription: s.metaDescription, focusKeyword: s.focusKeyword, secondaryKeywords: s.secondaryKeywords, ogTitle: s.ogTitle, ogDescription: s.ogDescription, schemaType: "CollectionPage", sitemapInclude: true });
      if (!category.blurb || category.blurb.length <= 40) setRec({ intro: s.intro, body: s.body, h1: s.h1, pageTitle: s.h1, faqs: s.faqs, faqSchema: s.faqs, imageAltText: s.imageAlt });
      setStatus("Suggestions applied — review, then Save.");
    } else {
      // Generic title/description suggestion from the entity name
      const name = entity.label;
      setRec({
        seoTitle: `${name} | MAZAL`.slice(0, 60),
        metaDescription: `${name} by MAZAL — quiet luxury modest fashion in the UAE. Premium fabrics, timeless design and free GCC delivery over AED 500.`.slice(0, 160),
        schemaType: draft.schemaType ?? (entity.type === "product" ? "Product" : entity.type === "article" ? "Article" : "WebPage"),
      });
      setStatus("Suggestions applied — review, then Save.");
    }
  }

  return (
    <section className="min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        {/* Top bar */}
        <header className="flex flex-col gap-4 border-b border-sand-deep pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">MAZAL Control Panel</p>
            <h1 className="mt-1 font-serif text-3xl text-ink md:text-4xl">Content Studio</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="min-w-[220px] border border-sand-deep bg-cream-soft px-3 py-2 text-sm text-ink outline-none focus:border-bronze"
            >
              {[...new Set(entities.map((e) => e.group))].map((g) => (
                <optgroup key={g} label={g}>
                  {entities.filter((e) => e.group === g).map((e) => (
                    <option key={e.key} value={e.key}>{e.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <select className="border border-sand-deep bg-cream-soft px-3 py-2 text-sm text-ink outline-none focus:border-bronze" value={entityContentType(entity.type)} onChange={() => undefined}>
              {CONTENT_TYPES.map((type) => <option key={type}>{type}</option>)}
            </select>
            <span className="rounded-full border border-sand-deep px-3 py-1 text-xs uppercase tracking-[0.12em] text-ink-soft">{rec.status === "draft" ? "Draft" : "Published"}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium text-cream-soft ${band.cls}`}>{score} · {band.label}</span>
            <a href={entity.path} target="_blank" rel="noreferrer" className="admin-secondary">Preview</a>
            <button type="button" className="admin-secondary" disabled={busy} onClick={saveDraft}>Save Draft</button>
            <button type="button" className="admin-dark" disabled={busy} onClick={publish}>Publish</button>
            <Link href="/admin" className="admin-secondary">Exit</Link>
          </div>
        </header>

        {status && <p className="mt-3 text-sm text-ink-soft">{status}</p>}
        {!storageReady && (
          <div className="mt-3 border border-bronze bg-sand px-4 py-2 text-sm text-ink">
            Production storage is not configured — changes won&rsquo;t persist after restart.
          </div>
        )}

        {/* Split workspace */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Control Panel */}
          <div className="admin-card min-w-0">
            <h2 className="font-serif text-2xl text-ink">Control Panel</h2>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-soft">Visible website content</p>
            <div className="mt-5 space-y-4">
              {entity.type === "global" && (
                <>
                  <Field label="Site name" value={store.settings.name} onChange={(v) => setStore((s) => ({ ...s, settings: { ...s.settings, name: v } }))} />
                  <Field label="Tagline" value={store.settings.tagline} onChange={(v) => setStore((s) => ({ ...s, settings: { ...s.settings, tagline: v } }))} />
                  <Field label="Site URL" value={store.settings.url} onChange={(v) => setStore((s) => ({ ...s, settings: { ...s.settings, url: v } }))} />
                </>
              )}
              {entity.type === "home" && (
                <>
                  <Field label="Hero eyebrow" value={draft.heroEyebrow ?? store.content.heroEyebrow} onChange={(v) => setRec({ heroEyebrow: v })} />
                  <Field label="Hero heading (H1)" value={draft.heroHeading ?? draft.h1 ?? store.content.heroTitle} onChange={(v) => setRec({ heroHeading: v, h1: v, pageTitle: v })} />
                  <Area label="Hero subheading" value={draft.heroSubheading ?? store.content.heroSubtitle} onChange={(v) => setRec({ heroSubheading: v, intro: v })} />
                  <Field label="CTA text" value={draft.ctaText ?? store.content.heroCtaText} onChange={(v) => setRec({ ctaText: v })} />
                  <Field label="CTA link" value={draft.ctaLink ?? store.content.heroCtaHref} onChange={(v) => setRec({ ctaLink: v })} />
                </>
              )}
              {entity.type === "shop" && (
                <>
                  <Field label="Page title (H1)" value={draft.h1 ?? store.pages.shop.title} onChange={(v) => setRec({ h1: v, pageTitle: v })} />
                  <Area label="Intro paragraph" value={draft.intro ?? store.pages.shop.blurb} onChange={(v) => setRec({ intro: v, body: v })} />
                </>
              )}
              {entity.type === "page" && entity.ref === "about" && (
                <>
                  <Field label="Title (H1)" value={draft.h1 ?? store.pages.about.title} onChange={(v) => setRec({ h1: v, pageTitle: v })} />
                  <Area label="Body" value={draft.body ?? store.pages.about.body} onChange={(v) => setRec({ body: v, intro: v.slice(0, 220) })} />
                </>
              )}
              {entity.type === "page" && entity.ref === "contact" && (
                <>
                  <Field label="Title (H1)" value={draft.h1 ?? store.pages.contact.title} onChange={(v) => setRec({ h1: v, pageTitle: v })} />
                  <Area label="Body" value={draft.body ?? store.pages.contact.body} onChange={(v) => setRec({ body: v, intro: v.slice(0, 220) })} />
                </>
              )}
              {entity.type === "page" && (entity.ref === "rewards" || entity.ref === "journal") && (
                <p className="text-sm text-ink-soft">This page&rsquo;s layout is managed in code — use the SEO Studio on the right to control how it appears in search and social. Journal articles are edited individually under &ldquo;Journal articles&rdquo;.</p>
              )}
              {entity.type === "category" && category && (
                <>
                  <Field label="Category name (H1)" value={draft.h1 ?? category.label} onChange={(v) => setRec({ h1: v, pageTitle: v })} />
                  <Area label="Intro / SEO body" value={draft.intro ?? draft.body ?? category.blurb} onChange={(v) => setRec({ intro: v, body: v })} />
                </>
              )}
              {entity.type === "city" && (
                <>
                  <Field label="Page title / H1" value={draft.h1 ?? ctx.h1 ?? ""} onChange={(v) => setRec({ h1: v, pageTitle: v })} />
                  <Area label="Intro paragraph" value={draft.intro ?? ""} onChange={(v) => setRec({ intro: v })} />
                  <Area label="Main body content" value={draft.body ?? ""} onChange={(v) => setRec({ body: v })} />
                  <Area label="FAQ questions and answers" value={joinFaqs(draft.faqs)} onChange={(v) => setRec({ faqs: splitFaqs(v), faqSchema: splitFaqs(v) })} />
                </>
              )}
              {entity.type === "product" && product && (
                <>
                  <Field label="Product name" value={draft.productName ?? product.name} onChange={(v) => setRec({ productName: v, h1: v, pageTitle: v })} />
                  <Area label="Short product description" value={draft.shortDescription ?? product.description} onChange={(v) => setRec({ shortDescription: v })} />
                  <Area label="Long product body description" value={draft.longDescription ?? product.longDescription ?? product.description} onChange={(v) => setRec({ longDescription: v, body: v })} />
                  <Area label="Product specifications" value={draft.specifications ?? product.specifications ?? ""} onChange={(v) => setRec({ specifications: v })} />
                  <Field label="Fabric / material" value={draft.fabric ?? product.material ?? ""} onChange={(v) => setRec({ fabric: v })} />
                  <Field label="Color options" value={draft.colorOptions ?? product.colors.map((c) => c.name).join(", ")} onChange={(v) => setRec({ colorOptions: v })} />
                  <Field label="Size options" value={draft.sizeOptions ?? product.sizes.join(", ")} onChange={(v) => setRec({ sizeOptions: v })} />
                  <Area label="Fit notes" value={draft.fitNotes ?? product.fitNotes ?? ""} onChange={(v) => setRec({ fitNotes: v })} />
                  <Area label="Size guide table (one row per line: Size | Bust | Waist | Length)" value={draft.sizeGuide ?? product.sizeGuide ?? ""} onChange={(v) => setRec({ sizeGuide: v })} />
                  <Area label="Care instructions" value={draft.careInstructions ?? (product.care ?? []).join("\n")} onChange={(v) => setRec({ careInstructions: v })} />
                  <Area label="Delivery information" value={draft.deliveryInformation ?? product.deliveryInfo ?? ""} onChange={(v) => setRec({ deliveryInformation: v })} />
                  <Area label="Return/exchange information" value={draft.returnExchangeInformation ?? product.returnInfo ?? ""} onChange={(v) => setRec({ returnExchangeInformation: v })} />
                  <Area label="Styling notes" value={draft.stylingNotes ?? product.stylingNotes ?? ""} onChange={(v) => setRec({ stylingNotes: v })} />
                  <Area label="Occasion / use case" value={draft.occasionUseCase ?? product.occasionUseCase ?? ""} onChange={(v) => setRec({ occasionUseCase: v })} />
                  <Area label="FAQ questions and answers" value={joinFaqs(draft.faqs ?? product.faqs)} onChange={(v) => setRec({ faqs: splitFaqs(v), faqSchema: splitFaqs(v) })} />
                  <Field label="Product image alt text" value={draft.imageAltText ?? product.imageAltText ?? ""} onChange={(v) => setRec({ imageAltText: v, imageAltSuggestions: v })} />
                </>
              )}
              {entity.type === "article" && article && (
                <>
                  <Field label="Title (H1)" value={draft.h1 ?? article.title} onChange={(v) => setRec({ h1: v, pageTitle: v })} />
                  <Area label="Excerpt" value={draft.intro ?? article.excerpt} onChange={(v) => setRec({ intro: v })} />
                  <Area label="Body" value={draft.body ?? article.body.map((b) => (b.type === "h2" ? `## ${b.text}` : b.text)).join("\n\n")} onChange={(v) => setRec({ body: v })} />
                </>
              )}
            </div>
          </div>

          {/* SEO Studio */}
          <div className="admin-card min-w-0">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl text-ink">SEO Studio</h2>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-soft">Search &amp; social</p>
              </div>
              <button type="button" className="admin-secondary" onClick={applySuggestions}>Generate suggestions</button>
            </div>

            {/* Google preview */}
            <div className="mt-5 rounded border border-sand-deep bg-cream-soft p-4">
              <p className="truncate text-[0.7rem] text-green-800">{base.replace(/^https?:\/\//, "")} › {entity.path.replace(/^\//, "").split("?")[0] || "home"}</p>
              <p className="truncate text-[1.05rem] text-[#1a0dab]">{previewTitle}</p>
              <p className="line-clamp-2 text-[0.8rem] text-ink-soft">{previewDesc}</p>
            </div>

            <div className="mt-5 space-y-4">
              <Counter label="SEO title" value={eff.seoTitle} onChange={(v) => setRec({ seoTitle: v })} min={45} max={60} />
              <Counter label="Meta description" value={eff.metaDescription} onChange={(v) => setRec({ metaDescription: v })} min={140} max={160} area />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Focus keyphrase" value={draft.focusKeyword ?? ""} onChange={(v) => setRec({ focusKeyword: v })} />
                <Field label="Secondary keyphrases" value={draft.secondaryKeywords ?? ""} onChange={(v) => setRec({ secondaryKeywords: v })} />
                <Field label="URL slug / canonical path" value={draft.canonical ?? entity.path} onChange={(v) => setRec({ canonical: v })} />
                <Field label="Canonical URL" value={draft.canonical ?? entity.path} onChange={(v) => setRec({ canonical: v })} />
                <Select label="Schema type" value={draft.schemaType ?? "WebPage"} onChange={(v) => setRec({ schemaType: v as SeoRecord["schemaType"] })} options={SCHEMA_TYPES as unknown as string[]} />
                <Field label="Sitemap priority" value={String(draft.sitemapPriority ?? "")} onChange={(v) => setRec({ sitemapPriority: v ? Number(v) : undefined })} />
                <Select label="Sitemap changefreq" value={draft.sitemapChangefreq ?? "weekly"} onChange={(v) => setRec({ sitemapChangefreq: v })} options={["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]} />
              </div>
              <div className="flex flex-wrap gap-5">
                <Toggle label="Robots index" checked={draft.index !== false} onChange={(b) => setRec({ index: b })} />
                <Toggle label="Robots follow" checked={draft.follow !== false} onChange={(b) => setRec({ follow: b })} />
                <Toggle label="Include in sitemap" checked={draft.sitemapInclude !== false} onChange={(b) => setRec({ sitemapInclude: b })} />
              </div>

              <details className="border-t border-sand-deep/60 pt-3">
                <summary className="cursor-pointer text-xs uppercase tracking-[0.16em] text-ink-soft">Open Graph &amp; Twitter</summary>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <Field label="Open Graph title" value={draft.ogTitle ?? ""} onChange={(v) => setRec({ ogTitle: v })} />
                  <Field label="Open Graph image" value={draft.ogImage ?? eff.ogImage} onChange={(v) => setRec({ ogImage: v })} />
                  <Area label="Open Graph description" value={draft.ogDescription ?? ""} onChange={(v) => setRec({ ogDescription: v })} />
                  <Field label="Twitter title" value={draft.twitterTitle ?? ""} onChange={(v) => setRec({ twitterTitle: v })} />
                  <Field label="Twitter image" value={draft.twitterImage ?? ""} onChange={(v) => setRec({ twitterImage: v })} />
                  <Area label="Twitter description" value={draft.twitterDescription ?? ""} onChange={(v) => setRec({ twitterDescription: v })} />
                </div>
              </details>

              <details className="border-t border-sand-deep/60 pt-3">
                <summary className="cursor-pointer text-xs uppercase tracking-[0.16em] text-ink-soft">Strategy, FAQ schema &amp; links</summary>
                <div className="mt-3 grid gap-4">
                  <Area label="Search intent notes" value={draft.searchIntentNotes ?? ""} onChange={(v) => setRec({ searchIntentNotes: v })} />
                  <Area label="Internal link suggestions" value={draft.internalLinkSuggestions ?? ""} onChange={(v) => setRec({ internalLinkSuggestions: v })} />
                  <Area label="FAQ schema questions/answers" value={joinFaqs(draft.faqSchema ?? draft.faqs)} onChange={(v) => setRec({ faqSchema: splitFaqs(v) })} />
                  <Area label="Image alt text suggestions" value={draft.imageAltSuggestions ?? draft.imageAltText ?? ""} onChange={(v) => setRec({ imageAltSuggestions: v, imageAltText: v })} />
                </div>
              </details>

              {/* Social preview */}
              <div className="overflow-hidden rounded border border-sand-deep">
                <div className="flex h-28 items-center justify-center bg-sand text-xs text-ink-soft">
                  {(draft.ogImage || store.seo.defaultOgImage) ? "Share image set" : "No share image"}
                </div>
                <div className="bg-cream-soft p-3">
                  <p className="truncate text-sm font-medium text-ink">{draft.ogTitle || previewTitle}</p>
                  <p className="line-clamp-2 text-xs text-ink-soft">{draft.ogDescription || previewDesc}</p>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-[0.12em] text-ink-soft">{base.replace(/^https?:\/\//, "")}</p>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="mt-6 border-t border-sand-deep/60 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-[0.16em] text-ink-soft">SEO checklist</h3>
                <span className={`rounded-full px-3 py-0.5 text-xs font-medium text-cream-soft ${band.cls}`}>{score}/100</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {checks.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Dot status={c.status} />
                    <span className="text-ink">{c.label}{c.hint && c.status !== "pass" ? <span className="text-ink-soft"> — {c.hint}</span> : null}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .admin-card { border: 1px solid var(--color-sand-deep); background: var(--color-cream-soft); padding: 1.25rem; }
        .admin-dark { background: var(--color-ink); color: var(--color-cream-soft); padding: 0.6rem 1.1rem; font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase; }
        .admin-dark[disabled] { opacity: 0.5; }
        .admin-secondary { display:inline-flex; align-items:center; border: 1px solid var(--color-sand-deep); color: var(--color-ink); padding: 0.6rem 1.1rem; font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase; }
      `}</style>
    </section>
  );
}

function Dot({ status }: { status: Check["status"] }) {
  const c = status === "pass" ? "bg-green-700" : status === "warn" ? "bg-amber-500" : "bg-red-700";
  return <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${c}`} aria-hidden />;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full border border-sand-deep bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-bronze" />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">{label}</span>
      <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full resize-y border border-sand-deep bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-bronze" />
    </label>
  );
}

function Counter({ label, value, onChange, min, max, area = false }: { label: string; value: string; onChange: (v: string) => void; min: number; max: number; area?: boolean }) {
  const len = value.length;
  const ok = len >= min && len <= max;
  return (
    <label className="block">
      <span className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-ink-soft">
        {label}
        <span className={ok ? "text-green-700" : len === 0 ? "text-ink-soft" : "text-amber-600"}>{len}/{max}</span>
      </span>
      {area ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full resize-y border border-sand-deep bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-bronze" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full border border-sand-deep bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-bronze" />
      )}
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full border border-sand-deep bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-bronze">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink">
      <input type="checkbox" className="accent-bronze" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
