"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  BADGE_OPTIONS,
  CATEGORY_OPTIONS,
  PALETTE,
  slugify,
} from "@/lib/admin-product";
import type { Article, ArticleBlock } from "@/lib/articles";
import type { Badge, Category, Product } from "@/lib/products";
import type {
  MediaAsset,
  SiteContent,
  StoreCategory,
  StoreData,
} from "@/lib/store";

type Tab =
  | "products"
  | "media"
  | "theme"
  | "pages"
  | "categories"
  | "journal"
  | "settings";

type ProductDraft = {
  id?: string;
  slug: string;
  name: string;
  price: string;
  compareAtPrice: string;
  category: string;
  description: string;
  sizes: string;
  colors: string[];
  customColors: string;
  material: string;
  care: string;
  stock: string;
  badges: Badge[];
  image: string;
  images: string[];
  featured: boolean;
};

const emptyProduct: ProductDraft = {
  slug: "",
  name: "",
  price: "",
  compareAtPrice: "",
  category: "abayas",
  description: "",
  sizes: "One Size",
  colors: ["Sand"],
  customColors: "",
  material: "",
  care: "",
  stock: "10",
  badges: [],
  image: "",
  images: [],
  featured: false,
};

const tabs: { id: Tab; label: string }[] = [
  { id: "products", label: "Products" },
  { id: "media", label: "Media" },
  { id: "theme", label: "Theme" },
  { id: "pages", label: "Pages" },
  { id: "categories", label: "Categories" },
  { id: "journal", label: "Journal" },
  { id: "settings", label: "Settings" },
];

function productToDraft(product: Product): ProductDraft {
  const images = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : [];
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
    category: product.category,
    description: product.description,
    sizes: product.sizes.join(", "),
    colors: product.colors.map((c) => c.name),
    customColors: "",
    material: product.material ?? "",
    care: (product.care ?? []).join("\n"),
    stock: String(product.stock ?? 10),
    badges: product.badges ?? [],
    image: product.image ?? images[0] ?? "",
    images,
    featured: product.featured ?? false,
  };
}

function productPayload(draft: ProductDraft) {
  const paletteColors = PALETTE.filter((c) => draft.colors.includes(c.name));
  const customColors = draft.customColors
    .split("\n")
    .map((line) => {
      const [name, hex] = line.split(",").map((part) => part?.trim());
      return name && hex ? { name, hex } : null;
    })
    .filter((c): c is { name: string; hex: string } => Boolean(c));
  const images = Array.from(
    new Set([draft.image, ...draft.images].map((u) => u.trim()).filter(Boolean)),
  );
  return {
    id: draft.id,
    slug: draft.slug || slugify(draft.name),
    name: draft.name,
    price: Number(draft.price),
    compareAtPrice: draft.compareAtPrice
      ? Number(draft.compareAtPrice)
      : undefined,
    category: draft.category as Category,
    description: draft.description,
    sizes: draft.sizes.split(",").map((s) => s.trim()).filter(Boolean),
    colors: [...paletteColors, ...customColors],
    material: draft.material,
    care: draft.care.split("\n").map((s) => s.trim()).filter(Boolean),
    stock: Number(draft.stock),
    badges: draft.badges,
    image: images[0],
    images,
    featured: draft.featured,
  };
}

export function AdminDashboard({
  initialStore,
  storageReady,
}: {
  initialStore: StoreData;
  storageReady: boolean;
}) {
  const [store, setStore] = useState(initialStore);
  const [tab, setTab] = useState<Tab>("products");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(emptyProduct);

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase().trim();
    return q
      ? store.products.filter((p) =>
          [p.name, p.slug, p.category].some((v) => v.toLowerCase().includes(q)),
        )
      : store.products;
  }, [query, store.products]);

  async function saveStore(next: StoreData, message = "Saved.") {
    setBusy(true);
    setStatus("Saving...");
    const res = await fetch("/api/admin/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setStatus(data.error || "Could not save.");
      return null;
    }
    setStore(data.store);
    setStatus(message);
    return data.store as StoreData;
  }

  async function uploadFile(file: File) {
    setBusy(true);
    setStatus("Uploading...");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setStatus(data.error || "Upload failed.");
      return null;
    }
    const asset = data.asset as MediaAsset;
    const next = { ...store, media: [asset, ...store.media] };
    setStore(next);
    setStatus("Uploaded.");
    return asset;
  }

  async function uploadProductImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const asset = await uploadFile(file);
    if (!asset) return;
    setDraft((d) => ({
      ...d,
      image: d.image || asset.url,
      images: Array.from(new Set([asset.url, ...d.images])),
    }));
  }

  async function saveProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = productPayload(draft);
    const url = selectedId
      ? `/api/admin/products/${encodeURIComponent(selectedId)}`
      : "/api/admin/products";
    setBusy(true);
    setStatus("Saving product...");
    const res = await fetch(url, {
      method: selectedId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setStatus(data.error || "Product could not be saved.");
      return;
    }
    const product = data.product as Product;
    setStore((s) => ({
      ...s,
      products: selectedId
        ? s.products.map((p) => (p.id === product.id ? product : p))
        : [product, ...s.products],
    }));
    setSelectedId(product.id);
    setDraft(productToDraft(product));
    setStatus("Product saved.");
  }

  async function deleteProduct() {
    if (!selectedId) return;
    const product = store.products.find((p) => p.id === selectedId);
    if (!product || !window.confirm(`Delete ${product.name}?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/products/${encodeURIComponent(selectedId)}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.ok) {
      setStatus("Product could not be deleted.");
      return;
    }
    setStore((s) => ({
      ...s,
      products: s.products.filter((p) => p.id !== selectedId),
    }));
    setSelectedId(null);
    setDraft(emptyProduct);
    setStatus("Product deleted.");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <section className="min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-sand-deep pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">MAZAL Control Panel</p>
            <h1 className="mt-2 font-serif text-4xl text-ink">Website Admin</h1>
            <p className="mt-2 text-sm text-ink-soft">
              Manage products, images, colors, pages, journal, and settings.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {status && <p className="text-sm text-ink-soft">{status}</p>}
            <Link className="admin-secondary" href="/shop">
              View site
            </Link>
            <button type="button" className="admin-dark" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        {!storageReady && (
          <div className="mt-5 border border-bronze bg-sand px-4 py-3 text-sm text-ink">
            Production storage is not configured. Enable Vercel Blob so changes
            persist live and survive redeploys.
          </div>
        )}

        <div className="mt-7 grid gap-7 lg:grid-cols-[220px_1fr]">
          <nav className="grid gap-2 self-start lg:sticky lg:top-6">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`border px-4 py-3 text-left text-sm uppercase tracking-[0.14em] ${
                  tab === item.id
                    ? "border-bronze bg-bronze text-cream-soft"
                    : "border-sand-deep bg-cream-soft text-ink"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <main className="space-y-6">
            {tab === "products" && (
              <ProductsSection
                busy={busy}
                categories={store.categories}
                deleteProduct={deleteProduct}
                draft={draft}
                products={filteredProducts}
                query={query}
                saveProduct={saveProduct}
                selectedId={selectedId}
                setDraft={setDraft}
                setQuery={setQuery}
                setSelectedId={setSelectedId}
                store={store}
                uploadProductImage={uploadProductImage}
              />
            )}
            {tab === "media" && (
              <MediaSection
                store={store}
                setStore={setStore}
                saveStore={saveStore}
                uploadFile={uploadFile}
              />
            )}
            {tab === "theme" && (
              <ThemeSection store={store} setStore={setStore} saveStore={saveStore} />
            )}
            {tab === "pages" && (
              <PagesSection store={store} setStore={setStore} saveStore={saveStore} />
            )}
            {tab === "categories" && (
              <CategoriesSection
                store={store}
                setStore={setStore}
                saveStore={saveStore}
              />
            )}
            {tab === "journal" && (
              <JournalSection store={store} setStore={setStore} saveStore={saveStore} />
            )}
            {tab === "settings" && (
              <SettingsSection store={store} setStore={setStore} saveStore={saveStore} />
            )}
          </main>
        </div>
      </div>
      <style jsx global>{`
        .admin-card {
          border: 1px solid var(--color-sand-deep);
          background: var(--color-cream-soft);
          padding: 1.25rem;
        }
        .admin-dark {
          background: var(--color-ink);
          color: var(--color-cream-soft);
          padding: 0.65rem 1rem;
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .admin-secondary {
          border: 1px solid var(--color-sand-deep);
          color: var(--color-ink);
          padding: 0.65rem 1rem;
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
      `}</style>
    </section>
  );
}

function ProductsSection(props: {
  busy: boolean;
  categories: StoreCategory[];
  deleteProduct: () => void;
  draft: ProductDraft;
  products: Product[];
  query: string;
  saveProduct: (e: FormEvent<HTMLFormElement>) => void;
  selectedId: string | null;
  setDraft: (draft: ProductDraft | ((draft: ProductDraft) => ProductDraft)) => void;
  setQuery: (query: string) => void;
  setSelectedId: (id: string | null) => void;
  store: StoreData;
  uploadProductImage: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const update = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    props.setDraft((d) => ({
      ...d,
      [key]: value,
      slug: key === "name" && !props.selectedId && !d.slug ? slugify(String(value)) : d.slug,
    }));

  return (
    <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
      <aside className="admin-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl">Products</h2>
          <button
            type="button"
            className="admin-dark"
            onClick={() => {
              props.setSelectedId(null);
              props.setDraft(emptyProduct);
            }}
          >
            New
          </button>
        </div>
        <input
          value={props.query}
          onChange={(e) => props.setQuery(e.target.value)}
          placeholder="Search"
          className="mt-4 w-full border border-sand-deep bg-cream px-3 py-2 text-sm"
        />
        <div className="mt-4 max-h-[680px] overflow-auto border border-sand-deep">
          {props.products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                props.setSelectedId(p.id);
                props.setDraft(productToDraft(p));
              }}
              className={`block w-full border-b border-sand-deep/70 px-3 py-3 text-left ${
                props.selectedId === p.id ? "bg-sand" : "bg-cream-soft"
              }`}
            >
              <span className="block text-sm font-medium">{p.name}</span>
              <span className="text-xs uppercase tracking-[0.12em] text-ink-soft">
                {p.category} / AED {p.price}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <form onSubmit={props.saveProduct} className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-3xl">
            {props.draft.name || "New Product"}
          </h2>
          <div className="flex gap-3">
            {props.selectedId && (
              <button
                type="button"
                onClick={props.deleteProduct}
                className="border border-red-800 px-4 py-2 text-xs uppercase tracking-[0.14em] text-red-800"
              >
                Delete
              </button>
            )}
            <button disabled={props.busy} className="admin-dark">
              Save product
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <TextField label="Name" value={props.draft.name} onChange={(v) => update("name", v)} required />
          <TextField label="Slug" value={props.draft.slug} onChange={(v) => update("slug", slugify(v))} />
          <TextField label="Price AED" type="number" value={props.draft.price} onChange={(v) => update("price", v)} required />
          <TextField label="Compare at AED" type="number" value={props.draft.compareAtPrice} onChange={(v) => update("compareAtPrice", v)} />
          <SelectField
            label="Category"
            value={props.draft.category}
            onChange={(v) => update("category", v)}
            options={[
              ...props.categories.map((c) => ({ value: c.value, label: c.label })),
              ...CATEGORY_OPTIONS.filter(
                (c) => !props.categories.some((cat) => cat.value === c.value),
              ),
            ]}
          />
          <TextField label="Stock" type="number" value={props.draft.stock} onChange={(v) => update("stock", v)} />
          <TextField label="Sizes" value={props.draft.sizes} onChange={(v) => update("sizes", v)} />
          <TextField label="Material" value={props.draft.material} onChange={(v) => update("material", v)} />
          <div className="md:col-span-2">
            <TextArea label="Description" value={props.draft.description} onChange={(v) => update("description", v)} />
          </div>
          <TextArea label="Care lines" value={props.draft.care} onChange={(v) => update("care", v)} />
          <TextArea label="Custom colors, one per line: Name, #hex" value={props.draft.customColors} onChange={(v) => update("customColors", v)} />
          <CheckGroup label="Badges" values={BADGE_OPTIONS} selected={props.draft.badges} onChange={(v) => update("badges", v)} />
          <ColorGroup selected={props.draft.colors} onChange={(v) => update("colors", v)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-bronze" checked={props.draft.featured} onChange={(e) => update("featured", e.target.checked)} />
            Featured on homepage
          </label>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[260px_1fr]">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden bg-sand">
              {props.draft.image ? (
                <Image src={props.draft.image} alt="" fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-ink-soft">No image</div>
              )}
            </div>
            <input className="mt-3 text-sm" type="file" accept="image/*" onChange={props.uploadProductImage} />
            <TextField label="Primary image URL" value={props.draft.image} onChange={(v) => update("image", v)} />
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.16em] text-ink-soft">Gallery images</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              {props.draft.images.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => update("image", url)}
                  className={`relative aspect-square overflow-hidden border ${props.draft.image === url ? "border-bronze" : "border-sand-deep"}`}
                  title="Set as primary"
                >
                  <Image src={url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
            <TextArea
              label="Gallery URLs, one per line"
              value={props.draft.images.join("\n")}
              onChange={(v) => update("images", v.split("\n").map((s) => s.trim()).filter(Boolean))}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

function MediaSection({
  store,
  setStore,
  saveStore,
  uploadFile,
}: {
  store: StoreData;
  setStore: (store: StoreData) => void;
  saveStore: (store: StoreData, message?: string) => Promise<StoreData | null>;
  uploadFile: (file: File) => Promise<MediaAsset | null>;
}) {
  async function onFiles(e: ChangeEvent<HTMLInputElement>) {
    for (const file of Array.from(e.target.files ?? [])) await uploadFile(file);
  }
  const remove = (id: string) => {
    const next = { ...store, media: store.media.filter((m) => m.id !== id) };
    setStore(next);
  };
  return (
    <section className="admin-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl">Media Library</h2>
          <p className="text-sm text-ink-soft">Upload reusable product, page, category, logo, and brand images.</p>
        </div>
        <button className="admin-dark" onClick={() => saveStore(store, "Media saved.")}>Save media</button>
      </div>
      <input className="mt-5" type="file" accept="image/*,video/mp4,video/webm" multiple onChange={onFiles} />
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {store.media.map((asset) => (
          <div key={asset.id} className="border border-sand-deep bg-cream p-2">
            {asset.type.startsWith("image/") ? (
              <div className="relative aspect-square overflow-hidden bg-sand">
                <Image src={asset.url} alt={asset.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center bg-sand text-sm">Video</div>
            )}
            <p className="mt-2 truncate text-xs">{asset.name}</p>
            <input readOnly value={asset.url} className="mt-2 w-full border border-sand-deep bg-cream-soft px-2 py-1 text-xs" />
            <button type="button" className="mt-2 text-xs uppercase tracking-[0.14em] text-red-800" onClick={() => remove(asset.id)}>Remove</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function ThemeSection({ store, setStore, saveStore }: SectionProps) {
  const themeKeys = [
    ["cream", "Cream"],
    ["creamSoft", "Cream soft"],
    ["sand", "Sand"],
    ["sandDeep", "Sand deep"],
    ["bronze", "Bronze"],
    ["bronzeDeep", "Bronze deep"],
    ["ink", "Ink"],
    ["inkSoft", "Ink soft"],
  ] as const;
  return (
    <section className="admin-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-3xl">Theme</h2>
        <button className="admin-dark" onClick={() => saveStore(store, "Theme saved.")}>Save theme</button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {themeKeys.map(([key, label]) => (
          <label key={key} className="flex items-center justify-between gap-4 border border-sand-deep bg-cream px-3 py-2">
            <span className="text-sm">{label}</span>
            <input
              type="color"
              value={store.theme[key]}
              onChange={(e) => setStore({ ...store, theme: { ...store.theme, [key]: e.target.value } })}
            />
          </label>
        ))}
        <TextField label="Corner radius" value={store.theme.radius} onChange={(v) => setStore({ ...store, theme: { ...store.theme, radius: v } })} />
        <TextField label="Logo URL" value={store.theme.logo ?? ""} onChange={(v) => setStore({ ...store, theme: { ...store.theme, logo: v } })} />
      </div>
    </section>
  );
}

type SectionProps = {
  store: StoreData;
  setStore: (store: StoreData) => void;
  saveStore: (store: StoreData, message?: string) => Promise<StoreData | null>;
};

function PagesSection({ store, saveStore }: SectionProps) {
  const [content, setContent] = useState<SiteContent>(store.content);
  const [pages, setPages] = useState(store.pages);
  const save = () => saveStore({ ...store, content, pages }, "Page content saved.");
  return (
    <section className="admin-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-3xl">Pages & Text</h2>
        <button className="admin-dark" onClick={save}>Save pages</button>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <TextField label="Hero eyebrow" value={content.heroEyebrow} onChange={(v) => setContent({ ...content, heroEyebrow: v })} />
        <TextField label="Hero title" value={content.heroTitle} onChange={(v) => setContent({ ...content, heroTitle: v })} />
        <TextArea label="Hero subtitle" value={content.heroSubtitle} onChange={(v) => setContent({ ...content, heroSubtitle: v })} />
        <TextArea label="Announcements" value={content.announcements.join("\n")} onChange={(v) => setContent({ ...content, announcements: v.split("\n").filter(Boolean) })} />
        <TextField label="Shop title" value={pages.shop.title} onChange={(v) => setPages({ ...pages, shop: { ...pages.shop, title: v } })} />
        <TextArea label="Shop intro" value={pages.shop.blurb} onChange={(v) => setPages({ ...pages, shop: { ...pages.shop, blurb: v } })} />
        <TextField label="About title" value={pages.about.title} onChange={(v) => setPages({ ...pages, about: { ...pages.about, title: v } })} />
        <TextArea label="About body" value={pages.about.body} onChange={(v) => setPages({ ...pages, about: { ...pages.about, body: v } })} />
        <TextField label="Contact title" value={pages.contact.title} onChange={(v) => setPages({ ...pages, contact: { ...pages.contact, title: v } })} />
        <TextArea label="Contact body" value={pages.contact.body} onChange={(v) => setPages({ ...pages, contact: { ...pages.contact, body: v } })} />
        <TextField label="Footer newsletter title" value={pages.footer.newsletterTitle} onChange={(v) => setPages({ ...pages, footer: { ...pages.footer, newsletterTitle: v } })} />
        <TextArea label="Footer newsletter body" value={pages.footer.newsletterBody} onChange={(v) => setPages({ ...pages, footer: { ...pages.footer, newsletterBody: v } })} />
      </div>
    </section>
  );
}

function CategoriesSection({ store, setStore, saveStore }: SectionProps) {
  const update = (index: number, category: StoreCategory) => {
    const categories = [...store.categories];
    categories[index] = category;
    setStore({ ...store, categories });
  };
  return (
    <section className="admin-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-3xl">Categories</h2>
        <div className="flex gap-3">
          <button type="button" className="admin-secondary" onClick={() => setStore({ ...store, categories: [...store.categories, { value: "new-category", label: "New Category", blurb: "", order: store.categories.length }] })}>Add</button>
          <button className="admin-dark" onClick={() => saveStore(store, "Categories saved.")}>Save categories</button>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {store.categories.map((category, i) => (
          <div key={`${category.value}-${i}`} className="grid gap-3 border border-sand-deep bg-cream p-4 md:grid-cols-5">
            <TextField label="Value" value={category.value} onChange={(v) => update(i, { ...category, value: slugify(v) })} />
            <TextField label="Label" value={category.label} onChange={(v) => update(i, { ...category, label: v })} />
            <TextField label="Image URL" value={category.image ?? ""} onChange={(v) => update(i, { ...category, image: v })} />
            <TextField label="Order" type="number" value={String(category.order)} onChange={(v) => update(i, { ...category, order: Number(v) })} />
            <label className="flex items-end gap-2 text-sm"><input type="checkbox" checked={category.hidden ?? false} onChange={(e) => update(i, { ...category, hidden: e.target.checked })} /> Hide</label>
            <div className="md:col-span-5">
              <TextArea label="Blurb" value={category.blurb} onChange={(v) => update(i, { ...category, blurb: v })} />
              <button type="button" className="mt-2 text-xs uppercase tracking-[0.14em] text-red-800" onClick={() => setStore({ ...store, categories: store.categories.filter((_, idx) => idx !== i) })}>Delete category</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function JournalSection({ store, setStore, saveStore }: SectionProps) {
  const update = (index: number, article: Article) => {
    const articles = [...store.articles];
    articles[index] = article;
    setStore({ ...store, articles });
  };
  return (
    <section className="admin-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-3xl">Journal</h2>
        <div className="flex gap-3">
          <button type="button" className="admin-secondary" onClick={() => setStore({ ...store, articles: [{ slug: "new-post", title: "New Post", excerpt: "", category: "Style Notes", readTime: "3 min read", date: new Date().toISOString().slice(0, 10), image: "/images/brand/statement.jpg", body: [{ type: "p", text: "Write the post body here." }] }, ...store.articles] })}>Add</button>
          <button className="admin-dark" onClick={() => saveStore(store, "Journal saved.")}>Save journal</button>
        </div>
      </div>
      <div className="mt-6 space-y-5">
        {store.articles.map((article, i) => (
          <div key={`${article.slug}-${i}`} className="grid gap-3 border border-sand-deep bg-cream p-4 md:grid-cols-2">
            <TextField label="Title" value={article.title} onChange={(v) => update(i, { ...article, title: v, slug: article.slug || slugify(v) })} />
            <TextField label="Slug" value={article.slug} onChange={(v) => update(i, { ...article, slug: slugify(v) })} />
            <TextField label="Category" value={article.category} onChange={(v) => update(i, { ...article, category: v })} />
            <TextField label="Date" value={article.date} onChange={(v) => update(i, { ...article, date: v })} />
            <TextField label="Cover image" value={article.image} onChange={(v) => update(i, { ...article, image: v })} />
            <TextField label="Read time" value={article.readTime} onChange={(v) => update(i, { ...article, readTime: v })} />
            <div className="md:col-span-2">
              <TextArea label="Excerpt" value={article.excerpt} onChange={(v) => update(i, { ...article, excerpt: v })} />
              <TextArea label="Body. Use lines starting with ## for headings." value={article.body.map((b) => b.type === "h2" ? `## ${b.text}` : b.text).join("\n\n")} onChange={(v) => update(i, { ...article, body: v.split(/\n\n+/).map((part): ArticleBlock => part.startsWith("## ") ? { type: "h2", text: part.slice(3).trim() } : { type: "p", text: part.trim() }).filter((b) => b.text) })} />
              <button type="button" className="mt-2 text-xs uppercase tracking-[0.14em] text-red-800" onClick={() => setStore({ ...store, articles: store.articles.filter((_, idx) => idx !== i) })}>Delete post</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SettingsSection({ store, setStore, saveStore }: SectionProps) {
  const settings = store.settings;
  return (
    <section className="admin-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-3xl">Site Settings</h2>
        <button className="admin-dark" onClick={() => saveStore(store, "Settings saved.")}>Save settings</button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <TextField label="Site name" value={settings.name} onChange={(v) => setStore({ ...store, settings: { ...settings, name: v } })} />
        <TextField label="Tagline" value={settings.tagline} onChange={(v) => setStore({ ...store, settings: { ...settings, tagline: v } })} />
        <TextField label="Domain URL" value={settings.url} onChange={(v) => setStore({ ...store, settings: { ...settings, url: v } })} />
        <TextField label="Currency" value={settings.currency} onChange={(v) => setStore({ ...store, settings: { ...settings, currency: v } })} />
        <TextField label="Free shipping threshold" type="number" value={String(settings.freeShippingThreshold)} onChange={(v) => setStore({ ...store, settings: { ...settings, freeShippingThreshold: Number(v) } })} />
        <TextField label="Promo code" value={settings.firstOrderCode} onChange={(v) => setStore({ ...store, settings: { ...settings, firstOrderCode: v } })} />
        <TextField label="Promo discount %" type="number" value={String(settings.firstOrderDiscount)} onChange={(v) => setStore({ ...store, settings: { ...settings, firstOrderDiscount: Number(v) } })} />
        <TextField label="WhatsApp number" value={settings.whatsapp.number} onChange={(v) => setStore({ ...store, settings: { ...settings, whatsapp: { ...settings.whatsapp, number: v } } })} />
        <TextField label="Instagram URL" value={settings.social.instagram} onChange={(v) => setStore({ ...store, settings: { ...settings, social: { ...settings.social, instagram: v } } })} />
        <TextField label="Email" value={settings.contact.email} onChange={(v) => setStore({ ...store, settings: { ...settings, contact: { ...settings.contact, email: v } } })} />
        <TextField label="Phone" value={settings.contact.phone} onChange={(v) => setStore({ ...store, settings: { ...settings, contact: { ...settings.contact, phone: v } } })} />
        <TextArea label="Address" value={settings.contact.addressLine} onChange={(v) => setStore({ ...store, settings: { ...settings, contact: { ...settings.contact, addressLine: v } } })} />
      </div>
    </section>
  );
}

function TextField({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">{label}</span>
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full border border-sand-deep bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-bronze" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">{label}</span>
      <textarea value={value} rows={5} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full resize-y border border-sand-deep bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-bronze" />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full border border-sand-deep bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-bronze">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function CheckGroup({ label, values, selected, onChange }: { label: string; values: Badge[]; selected: Badge[]; onChange: (values: Badge[]) => void }) {
  return (
    <fieldset>
      <legend className="text-xs uppercase tracking-[0.16em] text-ink-soft">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => (
          <label key={value} className="flex items-center gap-2 border border-sand-deep px-3 py-2 text-xs uppercase tracking-[0.12em]">
            <input type="checkbox" checked={selected.includes(value)} onChange={(e) => onChange(e.target.checked ? [...selected, value] : selected.filter((item) => item !== value))} />
            {value}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ColorGroup({ selected, onChange }: { selected: string[]; onChange: (values: string[]) => void }) {
  return (
    <fieldset>
      <legend className="text-xs uppercase tracking-[0.16em] text-ink-soft">Palette colors</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {PALETTE.map((color) => (
          <label key={color.name} className="flex items-center gap-2 border border-sand-deep px-3 py-2 text-sm">
            <input type="checkbox" checked={selected.includes(color.name)} onChange={(e) => onChange(e.target.checked ? [...selected, color.name] : selected.filter((item) => item !== color.name))} />
            <span className="h-4 w-4 rounded-full border border-ink/20" style={{ backgroundColor: color.hex }} />
            {color.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
