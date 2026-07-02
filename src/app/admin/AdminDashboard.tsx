"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  BADGE_OPTIONS,
  CATEGORY_OPTIONS,
  PALETTE,
  SIZE_OPTIONS,
  parseColorInput,
  parseSizeInput,
  slugify,
} from "@/lib/admin-product";
import type { Article, ArticleBlock } from "@/lib/articles";
import type { Badge, Category, Product } from "@/lib/products";
import { variantLabel } from "@/lib/products";
import type {
  MediaAsset,
  SiteContent,
  SiteSettings,
  StoreInquiry,
  StoreOrder,
  StoreOrderStatus,
  StoreSubscriber,
  StoreCategory,
  StoreData,
} from "@/lib/store";

/* ─────────────────────── Types ─────────────────────── */

type Tab =
  | "dashboard"
  | "orders"
  | "messages"
  | "products"
  | "media"
  | "theme"
  | "pages"
  | "seo"
  | "categories"
  | "journal"
  | "settings";

const DEFAULT_THEME_VALUES = {
  cream: "#fdf7f3",
  creamSoft: "#f8ebe3",
  sand: "#f0d6ca",
  sandDeep: "#e2bcae",
  bronze: "#c2887a",
  bronzeDeep: "#a86b5c",
  ink: "#46352e",
  inkSoft: "#836b61",
  radius: "16px",
};

type ProductDraft = {
  id?: string;
  slug: string;
  name: string;
  price: string;
  compareAtPrice: string;
  category: string;
  description: string;
  sizes: string;
  fitNotes: string;
  sizeGuide: string;
  colors: string[];
  customColors: string;
  material: string;
  care: string;
  stock: string;
  variantStock: string;
  badges: Badge[];
  image: string;
  images: string[];
  featured: boolean;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
};

const emptyProduct: ProductDraft = {
  slug: "",
  name: "",
  price: "",
  compareAtPrice: "",
  category: "abayas",
  description: "",
  sizes: "One Size",
  fitNotes: "",
  sizeGuide: "",
  colors: ["Sand"],
  customColors: "",
  material: "",
  care: "",
  stock: "10",
  variantStock: "",
  badges: [],
  image: "",
  images: [],
  featured: false,
  published: true,
  seoTitle: "",
  seoDescription: "",
};

const tabs: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders", label: "Orders" },
  { id: "messages", label: "Messages" },
  { id: "products", label: "Products" },
  { id: "media", label: "Media" },
  { id: "theme", label: "Theme" },
  { id: "pages", label: "Pages" },
  { id: "seo", label: "SEO" },
  { id: "categories", label: "Categories" },
  { id: "journal", label: "Journal" },
  { id: "settings", label: "Settings" },
];

/* ─────────────────── Product helpers ───────────────── */

function productToDraft(product: Product): ProductDraft {
  const images = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : [];
  const paletteNames = new Set(PALETTE.map((color) => color.name));
  const paletteColors = product.colors
    .filter((color) => paletteNames.has(color.name))
    .map((color) => color.name);
  const customColors = product.colors
    .filter((color) => !paletteNames.has(color.name))
    .map((color) => `${color.name}, ${color.hex}`)
    .join("\n");
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
    category: product.category,
    description: product.description,
    sizes: parseSizeInput(product.sizes).join(", "),
    fitNotes: product.fitNotes ?? "",
    sizeGuide: product.sizeGuide ?? "",
    colors: paletteColors,
    customColors,
    material: product.material ?? "",
    care: (product.care ?? []).join("\n"),
    stock: String(product.stock ?? 10),
    variantStock: product.variantStock
      ? Object.entries(product.variantStock)
          .map(([key, qty]) => `${variantLabel(key)} = ${qty}`)
          .join("\n")
      : "",
    badges: product.badges ?? [],
    image: product.image ?? images[0] ?? "",
    images,
    featured: product.featured ?? false,
    published: product.published !== false,
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
  };
}

function productPayload(draft: ProductDraft) {
  const paletteColors = PALETTE.filter((c) => draft.colors.includes(c.name));
  const sizes = parseSizeInput(draft.sizes);
  const customColors = draft.customColors
    .split("\n")
    .map(parseColorInput)
    .filter((c): c is { name: string; hex: string } => Boolean(c));
  const images = Array.from(
    new Set([draft.image, ...draft.images].map((u) => u.trim()).filter(Boolean)),
  );
  const variantStock = Object.fromEntries(
    draft.variantStock
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [variant, qtyRaw] = line.split("=").map((part) => part?.trim());
        const [sizeRaw, colorRaw] = (variant ?? "").split("/").map((part) => part?.trim());
        const qty = Math.max(0, Math.floor(Number(qtyRaw)));
        return sizeRaw && colorRaw && Number.isFinite(qty)
          ? [`${sizeRaw}::${colorRaw}`, qty]
          : null;
      })
      .filter((entry): entry is [string, number] => Boolean(entry)),
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
    sizes: sizes.length ? sizes : ["One Size"],
    fitNotes: draft.fitNotes.trim() || undefined,
    sizeGuide: draft.sizeGuide.trim() || undefined,
    colors: [...paletteColors, ...customColors],
    material: draft.material,
    care: draft.care.split("\n").map((s) => s.trim()).filter(Boolean),
    stock: Number(draft.stock),
    variantStock: Object.keys(variantStock).length ? variantStock : null,
    badges: draft.badges,
    image: images[0],
    images,
    featured: draft.featured,
    published: draft.published,
    seoTitle: draft.seoTitle.trim() || undefined,
    seoDescription: draft.seoDescription.trim() || undefined,
  };
}

/* ─────────────────── Toast system ──────────────────── */

function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback((message: string, type: "success" | "error" = "success") => {
    clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);
  return { toast, show };
}

function Toast({ toast }: { toast: { message: string; type: "success" | "error" } | null }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed right-5 top-5 z-50 px-5 py-3 text-sm shadow-lg transition-all ${
        toast.type === "error"
          ? "border border-red-300 bg-red-50 text-red-900"
          : "border border-green-300 bg-green-50 text-green-900"
      }`}
    >
      {toast.message}
    </div>
  );
}

/* ──────────────────── Main component ───────────────── */

export function AdminDashboard({
  initialStore,
  storageReady,
}: {
  initialStore: StoreData;
  storageReady: boolean;
}) {
  const [store, setStore] = useState(initialStore);
  const [tab, setTab] = useState<Tab>("products");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(emptyProduct);
  const { toast, show: showToast } = useToast();

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
    const res = await fetch("/api/admin/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      showToast(data.error || "Could not save.", "error");
      return null;
    }
    setStore(data.store);
    showToast(message);
    return data.store as StoreData;
  }

  async function uploadFile(file: File): Promise<MediaAsset | null> {
    setBusy(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      showToast(data.error || "Upload failed.", "error");
      return null;
    }
    const asset = data.asset as MediaAsset;
    const next = { ...store, media: [asset, ...store.media] };
    setStore(next);
    return asset;
  }

  async function uploadAndGetUrl(file: File): Promise<string | null> {
    const asset = await uploadFile(file);
    return asset?.url ?? null;
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

  async function uploadProductGalleryImages(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      const asset = await uploadFile(file);
      if (asset) {
        setDraft((d) => ({
          ...d,
          image: d.image || asset.url,
          images: Array.from(new Set([...d.images, asset.url])),
        }));
      }
    }
  }

  async function saveProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = productPayload(draft);
    const url = selectedId
      ? `/api/admin/products/${encodeURIComponent(selectedId)}`
      : "/api/admin/products";
    setBusy(true);
    const res = await fetch(url, {
      method: selectedId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      showToast(data.error || "Product could not be saved.", "error");
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
    showToast("Product saved.");
  }

  async function duplicateProduct() {
    if (!selectedId) return;
    const original = store.products.find((p) => p.id === selectedId);
    if (!original) return;
    const payload: Record<string, unknown> = {
      ...original,
      name: `${original.name} (copy)`,
      slug: "",
      featured: false,
    };
    delete payload.id;
    setBusy(true);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      showToast(data.error || "Could not duplicate.", "error");
      return;
    }
    const product = data.product as Product;
    setStore((s) => ({ ...s, products: [product, ...s.products] }));
    setSelectedId(product.id);
    setDraft(productToDraft(product));
    showToast("Product duplicated.");
  }

  async function deleteProduct() {
    if (!selectedId) return;
    const product = store.products.find((p) => p.id === selectedId);
    if (!product || !window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/products/${encodeURIComponent(selectedId)}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.ok) {
      showToast("Product could not be deleted.", "error");
      return;
    }
    setStore((s) => ({
      ...s,
      products: s.products.filter((p) => p.id !== selectedId),
    }));
    setSelectedId(null);
    setDraft(emptyProduct);
    showToast("Product deleted.");
  }

  async function notifyOrder(id: string) {
    setBusy(true);
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}/notify`, {
      method: "POST",
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      showToast(data.error || "Customer notification failed.", "error");
      return;
    }
    setStore((s) => ({
      ...s,
      orders: s.orders.map((order) =>
        order.id === id && data.order ? data.order : order,
      ),
      emailEvents: Array.isArray(data.emailEvents)
        ? [...data.emailEvents, ...s.emailEvents]
        : s.emailEvents,
    }));
    showToast("Customer notification queued.");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <section className="min-h-screen bg-cream">
      <Toast toast={toast} />
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-sand-deep pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">MAZAL Control Panel</p>
            <h1 className="mt-2 font-serif text-4xl text-ink">Website Admin</h1>
            <p className="mt-2 text-sm text-ink-soft">
              Manage products, images, pages, journal, theme, and all site settings.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {busy && <span className="text-sm text-bronze animate-pulse">Saving…</span>}
            <Link className="admin-dark" href="/admin/content-studio">
              Content Studio
            </Link>
            <Link className="admin-secondary" href="/" target="_blank">
              View site
            </Link>
            <button type="button" className="admin-dark" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        {!storageReady && (
          <div className="mt-5 border border-bronze bg-sand px-4 py-3 text-sm text-ink">
            Production storage is not configured. Changes may not persist after redeploy.
          </div>
        )}

        <div className="mt-7 grid gap-7 lg:grid-cols-[220px_1fr]">
          <nav className="flex gap-2 overflow-x-auto lg:grid lg:self-start lg:sticky lg:top-6">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`shrink-0 border px-4 py-3 text-left text-sm uppercase tracking-[0.14em] ${
                  tab === item.id
                    ? "border-bronze bg-bronze text-cream-soft"
                    : "border-sand-deep bg-cream-soft text-ink hover:bg-sand/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <main className="space-y-6 min-w-0">
            {tab === "dashboard" && (
              <DashboardSection
                store={store}
                goTo={setTab}
                startNewProduct={() => {
                  setSelectedId(null);
                  setDraft(emptyProduct);
                  setTab("products");
                }}
                editProduct={(p) => {
                  setSelectedId(p.id);
                  setDraft(productToDraft(p));
                  setTab("products");
                }}
              />
            )}
            {tab === "orders" && (
              <OrdersSection
                store={store}
                setStore={setStore}
                saveStore={saveStore}
                notifyOrder={notifyOrder}
              />
            )}
            {tab === "messages" && (
              <MessagesSection store={store} setStore={setStore} saveStore={saveStore} />
            )}
            {tab === "products" && (
              <ProductsSection
                busy={busy}
                categories={store.categories}
                deleteProduct={deleteProduct}
                duplicateProduct={duplicateProduct}
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
                uploadProductGalleryImages={uploadProductGalleryImages}
              />
            )}
            {tab === "media" && (
              <MediaSection
                store={store}
                setStore={setStore}
                saveStore={saveStore}
                uploadFile={uploadFile}
                showToast={showToast}
              />
            )}
            {tab === "theme" && (
              <ThemeSection store={store} setStore={setStore} saveStore={saveStore} uploadAndGetUrl={uploadAndGetUrl} />
            )}
            {tab === "pages" && (
              <PagesSection store={store} setStore={setStore} saveStore={saveStore} uploadAndGetUrl={uploadAndGetUrl} />
            )}
            {tab === "seo" && (
              <SeoSection store={store} setStore={setStore} saveStore={saveStore} />
            )}
            {tab === "categories" && (
              <CategoriesSection
                store={store}
                setStore={setStore}
                saveStore={saveStore}
                uploadAndGetUrl={uploadAndGetUrl}
              />
            )}
            {tab === "journal" && (
              <JournalSection store={store} setStore={setStore} saveStore={saveStore} uploadAndGetUrl={uploadAndGetUrl} />
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
        .admin-dark:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .admin-secondary {
          border: 1px solid var(--color-sand-deep);
          color: var(--color-ink);
          padding: 0.65rem 1rem;
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .admin-secondary:hover {
          background: var(--color-sand);
        }
        .admin-danger {
          border: 1px solid #991b1b;
          color: #991b1b;
          padding: 0.5rem 0.75rem;
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .admin-danger:hover {
          background: #fef2f2;
        }
      `}</style>
    </section>
  );
}

/* ─────────────────── Dashboard ─────────────────────── */

function DashboardSection({
  store,
  goTo,
  startNewProduct,
  editProduct,
}: {
  store: StoreData;
  goTo: (tab: Tab) => void;
  startNewProduct: () => void;
  editProduct: (p: Product) => void;
}) {
  const published = store.products.filter((p) => p.published !== false).length;
  const hidden = store.products.length - published;
  const openOrders = store.orders.filter(
    (order) => !["delivered", "cancelled"].includes(order.status),
  ).length;
  const newMessages = store.inquiries.filter((item) => item.status === "new").length;
  const lowStock = store.products
    .filter((p) => typeof p.stock === "number" && p.stock <= 3)
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
  const featured = store.products.filter((p) => p.featured).length;

  const cards: { label: string; value: string | number; tab?: Tab }[] = [
    { label: "Open orders", value: openOrders, tab: "orders" },
    { label: "New messages", value: newMessages, tab: "messages" },
    { label: "Products", value: store.products.length, tab: "products" },
    { label: "Visible / Hidden", value: `${published} / ${hidden}`, tab: "products" },
    { label: "Featured", value: featured, tab: "products" },
    { label: "Low stock (≤3)", value: lowStock.length, tab: "products" },
    { label: "Categories", value: store.categories.length, tab: "categories" },
    { label: "Journal posts", value: store.articles.length, tab: "journal" },
    { label: "Media assets", value: store.media.length, tab: "media" },
    { label: "Subscribers", value: store.subscribers.length, tab: "messages" },
  ];

  const actions: { label: string; onClick: () => void }[] = [
    { label: "+ Add product", onClick: startNewProduct },
    { label: "Review orders", onClick: () => goTo("orders") },
    { label: "Read messages", onClick: () => goTo("messages") },
    { label: "Upload media", onClick: () => goTo("media") },
    { label: "Edit homepage", onClick: () => goTo("pages") },
    { label: "Edit theme", onClick: () => goTo("theme") },
    { label: "Contact & settings", onClick: () => goTo("settings") },
  ];

  return (
    <div className="space-y-6">
      <section className="admin-card">
        <h2 className="font-serif text-3xl">Overview</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {store.updatedAt
            ? `Last saved ${new Date(store.updatedAt).toLocaleString()}`
            : "A snapshot of your store."}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => c.tab && goTo(c.tab)}
              className="border border-sand-deep bg-cream p-4 text-left hover:border-bronze"
            >
              <span className="block text-xs uppercase tracking-[0.14em] text-ink-soft">{c.label}</span>
              <span className="mt-2 block font-serif text-3xl text-ink">{c.value}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="admin-card">
        <h3 className="text-xs uppercase tracking-[0.16em] text-ink-soft">Quick actions</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          {actions.map((a) => (
            <button key={a.label} type="button" className="admin-secondary" onClick={a.onClick}>
              {a.label}
            </button>
          ))}
        </div>
      </section>

      <section className="admin-card">
        <h3 className="text-xs uppercase tracking-[0.16em] text-ink-soft">Low stock alerts</h3>
        {lowStock.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">All products are well stocked.</p>
        ) : (
          <div className="mt-3 divide-y divide-sand-deep/60 border border-sand-deep">
            {lowStock.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => editProduct(p)}
                className="flex w-full items-center justify-between px-3 py-3 text-left hover:bg-sand/30"
              >
                <span className="text-sm font-medium">{p.name}</span>
                <span className={`text-xs uppercase tracking-[0.12em] ${(p.stock ?? 0) <= 0 ? "text-red-700" : "text-bronze"}`}>
                  {(p.stock ?? 0) <= 0 ? "Out of stock" : `${p.stock} left`}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─────────────────── Operations ────────────────────── */

const ORDER_STATUS_LABELS: Record<StoreOrderStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  preparing: "Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function money(value: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(value);
}

function OrdersSection({
  store,
  setStore,
  saveStore,
  notifyOrder,
}: SectionProps & { notifyOrder: (id: string) => Promise<void> }) {
  const updateOrder = (id: string, patch: Partial<StoreOrder>) => {
    setStore({
      ...store,
      orders: store.orders.map((order) =>
        order.id === id
          ? { ...order, ...patch, updatedAt: new Date().toISOString() }
          : order,
      ),
    });
  };

  return (
    <section className="admin-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl">Orders</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Orders submitted from checkout. Customer accounts are still off.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a className="admin-secondary" href="/api/admin/export?kind=orders">
            Export orders
          </a>
          <a className="admin-secondary" href="/api/admin/export?kind=backup">
            Full backup
          </a>
          <button
            className="admin-dark"
            onClick={() => saveStore(store, "Orders saved.")}
          >
            Save order changes
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {store.orders.map((order) => (
          <article key={order.id} className="border border-sand-deep bg-cream p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-serif text-2xl text-ink">{order.orderNumber}</p>
                <p className="text-sm text-ink-soft">
                  {new Date(order.createdAt).toLocaleString()} ·{" "}
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  {order.customer.email} · {order.customer.phone}
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-xs uppercase tracking-[0.14em] text-ink-soft">
                  Status
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrder(order.id, {
                        status: e.target.value as StoreOrderStatus,
                      })
                    }
                    className="mt-1 block w-full border border-sand-deep bg-cream-soft px-3 py-2 text-sm normal-case tracking-normal text-ink"
                  >
                    {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs uppercase tracking-[0.14em] text-ink-soft">
                  Payment
                  <select
                    value={order.paymentStatus}
                    onChange={(e) =>
                      updateOrder(order.id, {
                        paymentStatus: e.target.value as StoreOrder["paymentStatus"],
                      })
                    }
                    className="mt-1 block w-full border border-sand-deep bg-cream-soft px-3 py-2 text-sm normal-case tracking-normal text-ink"
                  >
                    <option value="pending">Pending</option>
                    <option value="payment_link_requested">Payment link requested</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="divide-y divide-sand-deep/60 border border-sand-deep">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.productId}-${item.size}-${item.color}`} className="flex justify-between gap-3 px-3 py-2 text-sm">
                    <span>
                      {item.quantity}x {item.name} · {item.size} · {item.color}
                    </span>
                    <span>{money(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
              <div className="text-sm text-ink-soft">
                <p>
                  <strong className="text-ink">Ship to:</strong>{" "}
                  {order.shipping.address}, {order.shipping.city},{" "}
                  {order.shipping.country}
                </p>
                <p className="mt-1">
                  <strong className="text-ink">Delivery:</strong>{" "}
                  {order.deliveryMethod} ·{" "}
                  <strong className="text-ink">Payment:</strong>{" "}
                  {order.paymentMethod}
                </p>
                {order.note && (
                  <p className="mt-1">
                    <strong className="text-ink">Note:</strong> {order.note}
                  </p>
                )}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <input
                    value={order.carrier ?? ""}
                    onChange={(e) => updateOrder(order.id, { carrier: e.target.value })}
                    placeholder="Carrier"
                    className="border border-sand-deep bg-cream-soft px-3 py-2"
                  />
                  <input
                    value={order.trackingNumber ?? ""}
                    onChange={(e) =>
                      updateOrder(order.id, { trackingNumber: e.target.value })
                    }
                    placeholder="Tracking number"
                    className="border border-sand-deep bg-cream-soft px-3 py-2"
                  />
                  <input
                    value={order.trackingUrl ?? ""}
                    onChange={(e) =>
                      updateOrder(order.id, { trackingUrl: e.target.value })
                    }
                    placeholder="Tracking URL"
                    className="border border-sand-deep bg-cream-soft px-3 py-2 sm:col-span-2"
                  />
                </div>
                <textarea
                  value={order.internalNotes ?? ""}
                  onChange={(e) =>
                    updateOrder(order.id, { internalNotes: e.target.value })
                  }
                  rows={3}
                  placeholder="Internal notes"
                  className="mt-2 w-full border border-sand-deep bg-cream-soft px-3 py-2"
                />
                <div className="mt-3 border-t border-sand-deep pt-3">
                  <p>Subtotal: {money(order.subtotal)}</p>
                  {order.discount > 0 && <p>Discount: -{money(order.discount)}</p>}
                  {order.deliveryFee > 0 && <p>Delivery: {money(order.deliveryFee)}</p>}
                  <p className="font-medium text-ink">Total: {money(order.total)}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    className="admin-secondary"
                    href={`/api/admin/orders/${order.id}/document?type=invoice`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Invoice
                  </a>
                  <a
                    className="admin-secondary"
                    href={`/api/admin/orders/${order.id}/document?type=packing`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Packing slip
                  </a>
                  {order.trackingUrl && (
                    <a
                      className="admin-secondary"
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Track
                    </a>
                  )}
                  <button
                    type="button"
                    className="admin-dark"
                    onClick={async () => {
                      const saved = await saveStore(store, "Order saved.");
                      if (saved) await notifyOrder(order.id);
                    }}
                  >
                    Notify customer
                  </button>
                  {order.customerNotifiedAt && (
                    <span className="self-center text-xs text-ink-soft">
                      Last notified {new Date(order.customerNotifiedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
        {store.orders.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-soft">
            No orders yet. New checkout orders will appear here.
          </p>
        )}
      </div>
    </section>
  );
}

function MessagesSection({ store, setStore, saveStore }: SectionProps) {
  const updateInquiry = (id: string, patch: Partial<StoreInquiry>) => {
    setStore({
      ...store,
      inquiries: store.inquiries.map((inquiry) =>
        inquiry.id === id ? { ...inquiry, ...patch } : inquiry,
      ),
    });
  };

  function downloadSubscribers() {
    const rows = [
      "email,source,createdAt",
      ...store.subscribers.map((subscriber) =>
        [subscriber.email, subscriber.source, subscriber.createdAt]
          .map((cell) => `"${cell.replace(/"/g, '""')}"`)
          .join(","),
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mazal-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-3xl">Messages</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Contact form messages saved from the website.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a className="admin-secondary" href="/api/admin/export?kind=inquiries">
              Export messages
            </a>
            <button
              className="admin-dark"
              onClick={() => saveStore(store, "Messages saved.")}
            >
              Save message changes
            </button>
          </div>
        </div>

        <div className="mt-5 divide-y divide-sand-deep/60 border border-sand-deep">
          {store.inquiries.map((inquiry) => (
            <article key={inquiry.id} className="bg-cream p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{inquiry.subject}</p>
                  <p className="text-sm text-ink-soft">
                    {inquiry.name} · {inquiry.email} ·{" "}
                    {new Date(inquiry.createdAt).toLocaleString()}
                  </p>
                </div>
                <select
                  value={inquiry.status}
                  onChange={(e) =>
                    updateInquiry(inquiry.id, {
                      status: e.target.value as StoreInquiry["status"],
                    })
                  }
                  className="border border-sand-deep bg-cream-soft px-3 py-2 text-sm"
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">
                {inquiry.message}
              </p>
            </article>
          ))}
          {store.inquiries.length === 0 && (
            <p className="bg-cream px-4 py-8 text-center text-sm text-ink-soft">
              No messages yet.
            </p>
          )}
        </div>
      </section>

      <section className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-3xl">Subscribers</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {store.subscribers.length} email subscriber
              {store.subscribers.length === 1 ? "" : "s"}.
            </p>
          </div>
          <a className="admin-secondary" href="/api/admin/export?kind=subscribers">
            Export subscribers
          </a>
          <button type="button" className="admin-secondary" onClick={downloadSubscribers}>
            Download CSV
          </button>
        </div>
        <div className="mt-5 max-h-80 overflow-auto border border-sand-deep">
          {store.subscribers.map((subscriber: StoreSubscriber) => (
            <div key={subscriber.id} className="flex flex-wrap justify-between gap-3 border-b border-sand-deep/60 bg-cream px-3 py-2 text-sm">
              <span>{subscriber.email}</span>
              <span className="text-ink-soft">
                {subscriber.source} · {new Date(subscriber.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
          {store.subscribers.length === 0 && (
            <p className="bg-cream px-4 py-8 text-center text-sm text-ink-soft">
              No subscribers yet.
            </p>
          )}
        </div>
      </section>

      <section className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-3xl">Email notifications</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Sent emails appear as sent. Without RESEND_API_KEY, they are queued here.
            </p>
          </div>
        </div>
        <div className="mt-5 max-h-80 overflow-auto border border-sand-deep">
          {store.emailEvents.map((event) => (
            <div key={event.id} className="grid gap-2 border-b border-sand-deep/60 bg-cream px-3 py-2 text-sm md:grid-cols-[120px_1fr_1fr]">
              <span className={event.status === "failed" ? "text-red-800" : event.status === "sent" ? "text-green-800" : "text-bronze"}>
                {event.status}
              </span>
              <span>{event.subject}</span>
              <span className="text-ink-soft">
                {event.to} · {new Date(event.createdAt).toLocaleString()}
              </span>
              {event.error && (
                <span className="md:col-span-3 text-xs text-red-800">{event.error}</span>
              )}
            </div>
          ))}
          {store.emailEvents.length === 0 && (
            <p className="bg-cream px-4 py-8 text-center text-sm text-ink-soft">
              No email events yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

/* ─────────────────── Products ──────────────────────── */

function ProductsSection(props: {
  busy: boolean;
  categories: StoreCategory[];
  deleteProduct: () => void;
  duplicateProduct: () => void;
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
  uploadProductGalleryImages: (e: ChangeEvent<HTMLInputElement>) => void;
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
            + New
          </button>
        </div>
        <input
          value={props.query}
          onChange={(e) => props.setQuery(e.target.value)}
          placeholder="Search products…"
          className="mt-4 w-full border border-sand-deep bg-cream px-3 py-2 text-sm"
        />
        <p className="mt-2 text-xs text-ink-soft">{props.products.length} product{props.products.length !== 1 ? "s" : ""}</p>
        <div className="mt-3 max-h-[680px] overflow-auto border border-sand-deep">
          {props.products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                props.setSelectedId(p.id);
                props.setDraft(productToDraft(p));
              }}
              className={`block w-full border-b border-sand-deep/70 px-3 py-3 text-left ${
                props.selectedId === p.id ? "bg-sand" : "bg-cream-soft hover:bg-sand/30"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                {p.name}
                {p.published === false && (
                  <span className="bg-ink/10 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-ink-soft">Hidden</span>
                )}
              </span>
              <span className="text-xs uppercase tracking-[0.12em] text-ink-soft">
                {p.category} · AED {p.price}
                {p.stock !== undefined && p.stock <= 0 ? " · Out of stock" : ""}
              </span>
            </button>
          ))}
          {props.products.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-ink-soft">No products found.</p>
          )}
        </div>
      </aside>

      <form onSubmit={props.saveProduct} className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-3xl">
            {props.selectedId ? props.draft.name || "Edit Product" : "New Product"}
          </h2>
          <div className="flex flex-wrap gap-3">
            {props.selectedId && (
              <button type="button" onClick={props.duplicateProduct} className="admin-secondary">
                Duplicate
              </button>
            )}
            {props.selectedId && (
              <button type="button" onClick={props.deleteProduct} className="admin-danger">
                Delete
              </button>
            )}
            <button disabled={props.busy} className="admin-dark">
              {props.selectedId ? "Update product" : "Create product"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <TextField label="Name" value={props.draft.name} onChange={(v) => update("name", v)} required />
          <TextField label="Slug" value={props.draft.slug} onChange={(v) => update("slug", slugify(v))} />
          <TextField label="Price (AED)" type="number" value={props.draft.price} onChange={(v) => update("price", v)} required />
          <TextField label="Compare at (AED)" type="number" value={props.draft.compareAtPrice} onChange={(v) => update("compareAtPrice", v)} />
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
          <div className="md:col-span-2">
            <TextArea
              label="Variant stock (optional: Size / Color = Qty, one per line)"
              value={props.draft.variantStock}
              onChange={(v) => update("variantStock", v)}
            />
            <p className="mt-1 text-xs text-ink-soft">
              Example: S / Noir = 3. If empty, the product uses the total Stock field.
            </p>
          </div>
          <div className="md:col-span-2">
            <SizeGroup value={props.draft.sizes} onChange={(v) => update("sizes", v)} />
          </div>
          <div className="md:col-span-2">
            <h3 className="mb-3 border-t border-sand-deep pt-5 text-xs uppercase tracking-[0.16em] text-ink-soft">
              Product Fit &amp; Size Guide
            </h3>
            <TextArea
              label="Fit / size guide note"
              value={props.draft.fitNotes}
              onChange={(v) => update("fitNotes", v)}
            />
            <p className="mt-1 text-xs text-ink-soft">
              This text appears above the size guide on this product page.
            </p>
          </div>
          <div className="md:col-span-2">
            <TextArea
              label="Size guide table (one row per line: Size | Bust | Waist | Length)"
              value={props.draft.sizeGuide}
              onChange={(v) => update("sizeGuide", v)}
            />
            <p className="mt-1 text-xs text-ink-soft">
              Example: 52 | 110 | 90 | 146. Add a header row if you want different columns.
            </p>
          </div>
          <TextField label="Material" value={props.draft.material} onChange={(v) => update("material", v)} />
          <div className="md:col-span-2">
            <TextArea label="Description" value={props.draft.description} onChange={(v) => update("description", v)} />
          </div>
          <TextArea label="Care instructions (one per line)" value={props.draft.care} onChange={(v) => update("care", v)} />
          <div>
            <TextArea label="Custom colors (one per line: Blue or Blue, #0000ff)" value={props.draft.customColors} onChange={(v) => update("customColors", v)} />
            <p className="mt-1 text-xs text-ink-soft">
              You can type a color name, a hex code, or both. Examples: Blue, #0000ff, Navy #000080.
            </p>
          </div>
          <CheckGroup label="Badges" values={BADGE_OPTIONS} selected={props.draft.badges} onChange={(v) => update("badges", v)} />
          <ColorGroup
            selected={props.draft.colors}
            customColors={props.draft.customColors}
            onChange={(v) => update("colors", v)}
            onCustomColorsChange={(v) => update("customColors", v)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-bronze" checked={props.draft.featured} onChange={(e) => update("featured", e.target.checked)} />
            Featured on homepage
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-bronze" checked={props.draft.published} onChange={(e) => update("published", e.target.checked)} />
            Visible on site (uncheck to hide from shop)
          </label>
        </div>

        {/* ── Images ── */}
        <div className="mt-8 border-t border-sand-deep pt-6">
          <h3 className="text-xs uppercase tracking-[0.16em] text-ink-soft">Product Images</h3>
          <div className="mt-4 grid gap-5 lg:grid-cols-[260px_1fr]">
            <div>
              <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                {props.draft.image ? (
                  <Image src={props.draft.image} alt="" fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-ink-soft">No image</div>
                )}
              </div>
              <label className="mt-3 block">
                <span className="admin-secondary inline-block cursor-pointer">Upload primary image</span>
                <input className="hidden" type="file" accept="image/*" onChange={props.uploadProductImage} />
              </label>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.16em] text-ink-soft">Gallery</h4>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {props.draft.images.map((url) => (
                  <div key={url} className="group relative">
                    <button
                      type="button"
                      onClick={() => update("image", url)}
                      className={`relative aspect-square w-full overflow-hidden border ${props.draft.image === url ? "border-bronze ring-2 ring-bronze" : "border-sand-deep"}`}
                      title="Set as primary"
                    >
                      <Image src={url} alt="" fill className="object-cover" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = props.draft.images.filter((u) => u !== url);
                        update("images", next);
                        if (props.draft.image === url) update("image", next[0] ?? "");
                      }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-red-700 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <label className="mt-4 block">
                <span className="admin-secondary inline-block cursor-pointer">+ Add gallery images</span>
                <input className="hidden" type="file" accept="image/*" multiple onChange={props.uploadProductGalleryImages} />
              </label>
            </div>
          </div>
        </div>

        {/* ── SEO ── */}
        <div className="mt-8 border-t border-sand-deep pt-6">
          <h3 className="text-xs uppercase tracking-[0.16em] text-ink-soft">SEO (optional)</h3>
          <p className="mt-1 text-xs text-ink-soft">Leave blank to auto-generate from the product name and description.</p>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <TextField label="SEO title" value={props.draft.seoTitle} onChange={(v) => update("seoTitle", v)} />
            <div className="md:col-span-2">
              <TextArea label="Meta description" value={props.draft.seoDescription} onChange={(v) => update("seoDescription", v)} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ──────────────────── Media ────────────────────────── */

function MediaSection({
  store,
  setStore,
  saveStore,
  uploadFile,
  showToast,
}: {
  store: StoreData;
  setStore: (store: StoreData) => void;
  saveStore: (store: StoreData, message?: string) => Promise<StoreData | null>;
  uploadFile: (file: File) => Promise<MediaAsset | null>;
  showToast: (msg: string, type?: "success" | "error") => void;
}) {
  const [dragging, setDragging] = useState(false);

  async function uploadMany(files: File[]) {
    const valid = files.filter((f) => /^image\/|^video\/(mp4|webm)/.test(f.type));
    for (const file of valid) await uploadFile(file);
    if (valid.length) showToast(`${valid.length} file${valid.length > 1 ? "s" : ""} uploaded.`);
  }

  async function onFiles(e: ChangeEvent<HTMLInputElement>) {
    await uploadMany(Array.from(e.target.files ?? []));
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    showToast("Image link copied.");
  }

  const setAlt = (id: string, alt: string) =>
    setStore({ ...store, media: store.media.map((m) => (m.id === id ? { ...m, alt } : m)) });

  const remove = (id: string) => {
    if (!window.confirm("Remove this media asset?")) return;
    setStore({ ...store, media: store.media.filter((m) => m.id !== id) });
  };

  return (
    <section className="admin-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl">Media Library</h2>
          <p className="text-sm text-ink-soft">{store.media.length} asset{store.media.length !== 1 ? "s" : ""} — upload images &amp; videos for products, pages, and categories.</p>
        </div>
        <div className="flex gap-3">
          <label className="admin-dark cursor-pointer">
            Upload files
            <input className="hidden" type="file" accept="image/*,video/mp4,video/webm" multiple onChange={onFiles} />
          </label>
          <button className="admin-dark" onClick={() => saveStore(store, "Media saved.")}>Save alt text</button>
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void uploadMany(Array.from(e.dataTransfer.files ?? []));
        }}
        className={`mt-5 flex flex-col items-center justify-center border-2 border-dashed px-4 py-10 text-center text-sm ${
          dragging ? "border-bronze bg-sand/40" : "border-sand-deep bg-cream"
        }`}
      >
        <p className="text-ink-soft">Drag &amp; drop images or videos here to upload.</p>
        <label className="admin-secondary mt-3 cursor-pointer">
          Or choose files
          <input className="hidden" type="file" accept="image/*,video/mp4,video/webm" multiple onChange={onFiles} />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {store.media.map((asset) => (
          <div key={asset.id} className="group border border-sand-deep bg-cream p-2">
            {asset.type.startsWith("image/") ? (
              <div className="relative aspect-square overflow-hidden bg-sand">
                <Image src={asset.url} alt={asset.alt || asset.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center bg-sand text-sm text-ink-soft">Video</div>
            )}
            <p className="mt-2 truncate text-xs" title={asset.name}>{asset.name}</p>
            <input
              value={asset.alt ?? ""}
              onChange={(e) => setAlt(asset.id, e.target.value)}
              placeholder="Describe this image…"
              className="mt-2 w-full border border-sand-deep bg-cream-soft px-2 py-1 text-xs"
            />
            <div className="mt-2 flex gap-2">
              <button type="button" className="text-xs text-bronze underline" onClick={() => copyUrl(asset.url)}>Copy link</button>
              <button type="button" className="text-xs text-red-800" onClick={() => remove(asset.id)}>Remove</button>
            </div>
          </div>
        ))}
        {store.media.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-ink-soft">No media uploaded yet.</p>
        )}
      </div>
    </section>
  );
}

/* ──────────────────── Theme ────────────────────────── */

type SectionProps = {
  store: StoreData;
  setStore: (store: StoreData) => void;
  saveStore: (store: StoreData, message?: string) => Promise<StoreData | null>;
};

function ThemeSection({ store, setStore, saveStore, uploadAndGetUrl }: SectionProps & { uploadAndGetUrl: (file: File) => Promise<string | null> }) {
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

  async function uploadLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadAndGetUrl(file);
    if (url) setStore({ ...store, theme: { ...store.theme, logo: url } });
  }

  return (
    <section className="admin-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-3xl">Site Theme</h2>
        <div className="flex gap-3">
          <button
            type="button"
            className="admin-secondary"
            onClick={() => {
              if (!window.confirm("Reset all colours and radius to the MAZAL default?")) return;
              setStore({ ...store, theme: { ...store.theme, ...DEFAULT_THEME_VALUES } });
            }}
          >
            Reset to default
          </button>
          <button className="admin-dark" onClick={() => saveStore(store, "Theme saved.")}>Save theme</button>
        </div>
      </div>

      <Fieldset title="Brand Colors">
        <div className="grid gap-4 md:grid-cols-2">
          {themeKeys.map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-4 border border-sand-deep bg-cream px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 border border-ink/10" style={{ backgroundColor: store.theme[key] }} />
                <span className="text-sm">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-soft">{store.theme[key]}</span>
                <input
                  type="color"
                  value={store.theme[key]}
                  onChange={(e) => setStore({ ...store, theme: { ...store.theme, [key]: e.target.value } })}
                  className="h-8 w-8 cursor-pointer border-0"
                />
              </div>
            </label>
          ))}
        </div>
      </Fieldset>

      <Fieldset title="Logo">
        <div className="flex items-center gap-6">
          {store.theme.logo && (
            <div className="relative h-16 w-40 overflow-hidden bg-sand">
              <Image src={store.theme.logo} alt="Logo" fill className="object-contain" />
            </div>
          )}
          <div>
            <label className="admin-secondary inline-block cursor-pointer">
              Upload logo
              <input className="hidden" type="file" accept="image/*" onChange={uploadLogo} />
            </label>
            {store.theme.logo && (
              <button type="button" className="ml-3 text-xs text-red-800" onClick={() => setStore({ ...store, theme: { ...store.theme, logo: "" } })}>
                Remove
              </button>
            )}
          </div>
        </div>
      </Fieldset>

      <Fieldset title="Layout">
        <TextField label="Corner radius (e.g. 16px, 0)" value={store.theme.radius} onChange={(v) => setStore({ ...store, theme: { ...store.theme, radius: v } })} />
      </Fieldset>
    </section>
  );
}

/* ──────────────────── Pages ────────────────────────── */

function PagesSection({ store, saveStore, uploadAndGetUrl }: SectionProps & { uploadAndGetUrl: (f: File) => Promise<string | null> }) {
  const [content, setContent] = useState<SiteContent>(store.content);
  const [pages, setPages] = useState(store.pages);

  const save = () => saveStore({ ...store, content, pages }, "Page content saved.");

  async function uploadHomeImage(key: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await uploadAndGetUrl(file);
      if (url) setPages((p) => ({ ...p, home: { ...p.home, [key]: url } }));
    };
    input.click();
  }

  return (
    <section className="admin-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-3xl">Pages &amp; Content</h2>
        <button className="admin-dark" onClick={save}>Save pages</button>
      </div>

      <Fieldset title="Hero Section">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Eyebrow" value={content.heroEyebrow} onChange={(v) => setContent({ ...content, heroEyebrow: v })} />
          <TextField label="Title" value={content.heroTitle} onChange={(v) => setContent({ ...content, heroTitle: v })} />
          <div className="md:col-span-2">
            <TextArea label="Subtitle" value={content.heroSubtitle} onChange={(v) => setContent({ ...content, heroSubtitle: v })} />
          </div>
          <TextField label="CTA button text" value={content.heroCtaText} onChange={(v) => setContent({ ...content, heroCtaText: v })} />
          <TextField label="CTA button link" value={content.heroCtaHref} onChange={(v) => setContent({ ...content, heroCtaHref: v })} />
        </div>
      </Fieldset>

      <Fieldset title="Announcement Bar">
        <TextArea
          label="Announcements (one per line — rotates automatically)"
          value={content.announcements.join("\n")}
          onChange={(v) => setContent({ ...content, announcements: v.split("\n").filter(Boolean) })}
        />
      </Fieldset>

      <Fieldset title="Homepage Editorial">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Editorial eyebrow" value={pages.home.editorialEyebrow ?? ""} onChange={(v) => setPages({ ...pages, home: { ...pages.home, editorialEyebrow: v } })} />
          <TextField label="Editorial title" value={pages.home.editorialTitle ?? ""} onChange={(v) => setPages({ ...pages, home: { ...pages.home, editorialTitle: v } })} />
          <div className="md:col-span-2">
            <TextArea label="Editorial body" value={pages.home.editorialBody ?? ""} onChange={(v) => setPages({ ...pages, home: { ...pages.home, editorialBody: v } })} />
          </div>
          <TextField label="Editorial button text" value={pages.home.editorialCtaText ?? ""} onChange={(v) => setPages({ ...pages, home: { ...pages.home, editorialCtaText: v } })} />
          <TextField label="Editorial button link" value={pages.home.editorialCtaHref ?? ""} onChange={(v) => setPages({ ...pages, home: { ...pages.home, editorialCtaHref: v } })} />
        </div>
        <div className="mt-4">
          <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">Editorial image</span>
          <div className="mt-2 flex items-center gap-4">
            {pages.home.editorialImage && (
              <div className="relative h-24 w-36 overflow-hidden bg-sand">
                <Image src={pages.home.editorialImage} alt="" fill className="object-cover" />
              </div>
            )}
            <button type="button" className="admin-secondary" onClick={() => uploadHomeImage("editorialImage")}>Upload image</button>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextField label="Story eyebrow" value={pages.home.storyEyebrow ?? ""} onChange={(v) => setPages({ ...pages, home: { ...pages.home, storyEyebrow: v } })} />
          <TextField label="Story title" value={pages.home.storyTitle ?? ""} onChange={(v) => setPages({ ...pages, home: { ...pages.home, storyTitle: v } })} />
          <div className="md:col-span-2">
            <TextArea label="Story body" value={pages.home.storyBody ?? ""} onChange={(v) => setPages({ ...pages, home: { ...pages.home, storyBody: v } })} />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">Statement image</span>
          <div className="mt-2 flex items-center gap-4">
            {pages.home.statementImage && (
              <div className="relative h-24 w-36 overflow-hidden bg-sand">
                <Image src={pages.home.statementImage} alt="" fill className="object-cover" />
              </div>
            )}
            <button type="button" className="admin-secondary" onClick={() => uploadHomeImage("statementImage")}>Upload image</button>
          </div>
        </div>
      </Fieldset>

      <Fieldset title="Shop Page">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Title" value={pages.shop.title} onChange={(v) => setPages({ ...pages, shop: { ...pages.shop, title: v } })} />
          <div className="md:col-span-2">
            <TextArea label="Intro text" value={pages.shop.blurb} onChange={(v) => setPages({ ...pages, shop: { ...pages.shop, blurb: v } })} />
          </div>
        </div>
      </Fieldset>

      <Fieldset title="About Page">
        <TextField label="Title" value={pages.about.title} onChange={(v) => setPages({ ...pages, about: { ...pages.about, title: v } })} />
        <TextArea label="Body" value={pages.about.body} onChange={(v) => setPages({ ...pages, about: { ...pages.about, body: v } })} />
      </Fieldset>

      <Fieldset title="Contact Page">
        <TextField label="Title" value={pages.contact.title} onChange={(v) => setPages({ ...pages, contact: { ...pages.contact, title: v } })} />
        <TextArea label="Body" value={pages.contact.body} onChange={(v) => setPages({ ...pages, contact: { ...pages.contact, body: v } })} />
      </Fieldset>

      <Fieldset title="Footer">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Newsletter title" value={pages.footer.newsletterTitle} onChange={(v) => setPages({ ...pages, footer: { ...pages.footer, newsletterTitle: v } })} />
          <TextField label="Wordmark" value={pages.footer.wordmark} onChange={(v) => setPages({ ...pages, footer: { ...pages.footer, wordmark: v } })} />
          <div className="md:col-span-2">
            <TextArea label="Newsletter body" value={pages.footer.newsletterBody} onChange={(v) => setPages({ ...pages, footer: { ...pages.footer, newsletterBody: v } })} />
          </div>
        </div>

        <h4 className="mt-6 text-xs uppercase tracking-[0.16em] text-ink-soft">Footer Link Columns</h4>
        {pages.footer.columns.map((col, ci) => (
          <div key={ci} className="mt-3 border border-sand-deep bg-cream p-4">
            <div className="flex items-center justify-between gap-3">
              <TextField
                label={`Column ${ci + 1} title`}
                value={col.title}
                onChange={(v) => {
                  const cols = [...pages.footer.columns];
                  cols[ci] = { ...col, title: v };
                  setPages({ ...pages, footer: { ...pages.footer, columns: cols } });
                }}
              />
              <button
                type="button"
                className="admin-danger mt-4"
                onClick={() => {
                  const cols = pages.footer.columns.filter((_, i) => i !== ci);
                  setPages({ ...pages, footer: { ...pages.footer, columns: cols } });
                }}
              >
                Remove
              </button>
            </div>
            {col.links.map((link, li) => (
              <div key={li} className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  className="border border-sand-deep bg-cream-soft px-2 py-1.5 text-sm"
                  value={link.label}
                  placeholder="Label"
                  onChange={(e) => {
                    const cols = [...pages.footer.columns];
                    const links = [...col.links];
                    links[li] = { ...link, label: e.target.value };
                    cols[ci] = { ...col, links };
                    setPages({ ...pages, footer: { ...pages.footer, columns: cols } });
                  }}
                />
                <input
                  className="border border-sand-deep bg-cream-soft px-2 py-1.5 text-sm"
                  value={link.href}
                  placeholder="/path"
                  onChange={(e) => {
                    const cols = [...pages.footer.columns];
                    const links = [...col.links];
                    links[li] = { ...link, href: e.target.value };
                    cols[ci] = { ...col, links };
                    setPages({ ...pages, footer: { ...pages.footer, columns: cols } });
                  }}
                />
                <button
                  type="button"
                  className="text-xs text-red-800"
                  onClick={() => {
                    const cols = [...pages.footer.columns];
                    cols[ci] = { ...col, links: col.links.filter((_, i) => i !== li) };
                    setPages({ ...pages, footer: { ...pages.footer, columns: cols } });
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 text-xs text-bronze underline"
              onClick={() => {
                const cols = [...pages.footer.columns];
                cols[ci] = { ...col, links: [...col.links, { label: "New Link", href: "/" }] };
                setPages({ ...pages, footer: { ...pages.footer, columns: cols } });
              }}
            >
              + Add link
            </button>
          </div>
        ))}
        <button
          type="button"
          className="admin-secondary mt-3"
          onClick={() => {
            setPages({
              ...pages,
              footer: {
                ...pages.footer,
                columns: [...pages.footer.columns, { title: "New Column", links: [] }],
              },
            });
          }}
        >
          + Add column
        </button>
      </Fieldset>
    </section>
  );
}

/* ──────────────────── SEO ──────────────────────────── */

const SEO_PAGES: { key: string; label: string }[] = [
  { key: "home", label: "Home page" },
  { key: "shop", label: "Shop page" },
  { key: "about", label: "About page" },
  { key: "contact", label: "Contact page" },
  { key: "journal", label: "Journal page" },
  { key: "rewards", label: "Rewards page" },
];

function SeoSection({ store, saveStore }: SectionProps) {
  const [seo, setSeo] = useState(store.seo);
  const [url, setUrl] = useState(store.settings.url);
  const [pageSeo, setPageSeo] = useState<
    Record<string, { title?: string; description?: string; ogImage?: string }>
  >(store.pages.seo ?? {});

  const setPage = (key: string, field: "title" | "description" | "ogImage", value: string) =>
    setPageSeo({ ...pageSeo, [key]: { ...pageSeo[key], [field]: value } });

  const save = () =>
    saveStore(
      {
        ...store,
        seo,
        settings: { ...store.settings, url },
        pages: { ...store.pages, seo: pageSeo },
      },
      "SEO saved.",
    );

  return (
    <section className="admin-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-3xl">SEO</h2>
        <button className="admin-dark" onClick={save}>Save SEO</button>
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        Control how the site appears in Google and when shared on social media.
        Leave a page field blank to use the global defaults below.
      </p>

      <Fieldset title="Global Defaults">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Site URL (domain)" value={url} onChange={setUrl} />
          <TextField label="Default page title" value={seo.defaultTitle} onChange={(v) => setSeo({ ...seo, defaultTitle: v })} />
          <TextField label="Title template (must include %s)" value={seo.titleTemplate} onChange={(v) => setSeo({ ...seo, titleTemplate: v })} />
          <TextField label="Social share image URL" value={seo.defaultOgImage} onChange={(v) => setSeo({ ...seo, defaultOgImage: v })} />
          <div className="md:col-span-2">
            <TextArea label="Default meta description (≈150–160 chars)" value={seo.defaultDescription} onChange={(v) => setSeo({ ...seo, defaultDescription: v })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-bronze" checked={seo.indexable} onChange={(e) => setSeo({ ...seo, indexable: e.target.checked })} />
            Allow search engines to index the site
          </label>
        </div>
      </Fieldset>

      <Fieldset title="Per-Page SEO">
        <div className="space-y-4">
          {SEO_PAGES.map(({ key, label }) => (
            <div key={key} className="grid gap-3 border border-sand-deep bg-cream p-4 md:grid-cols-2">
              <p className="md:col-span-2 text-sm font-medium">{label}</p>
              <TextField label="SEO title" value={pageSeo[key]?.title ?? ""} onChange={(v) => setPage(key, "title", v)} />
              <TextField label="Share image URL" value={pageSeo[key]?.ogImage ?? ""} onChange={(v) => setPage(key, "ogImage", v)} />
              <div className="md:col-span-2">
                <TextArea label="Meta description" value={pageSeo[key]?.description ?? ""} onChange={(v) => setPage(key, "description", v)} />
              </div>
            </div>
          ))}
        </div>
      </Fieldset>
      <p className="mt-4 text-sm text-ink-soft">
        Per-product and per-article SEO are edited in the Products and Journal tabs.
      </p>
    </section>
  );
}

/* ──────────────────── Categories ────────────────────── */

function CategoriesSection({ store, setStore, saveStore, uploadAndGetUrl }: SectionProps & { uploadAndGetUrl: (f: File) => Promise<string | null> }) {
  const update = (index: number, category: StoreCategory) => {
    const categories = [...store.categories];
    categories[index] = category;
    setStore({ ...store, categories });
  };

  async function uploadCategoryImage(index: number) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await uploadAndGetUrl(file);
      if (url) {
        const categories = [...store.categories];
        categories[index] = { ...categories[index], image: url };
        setStore({ ...store, categories });
      }
    };
    input.click();
  }

  return (
    <section className="admin-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-3xl">Categories</h2>
        <div className="flex gap-3">
          <button
            type="button"
            className="admin-secondary"
            onClick={() => setStore({ ...store, categories: [...store.categories, { value: "new-category", label: "New Category", blurb: "", order: store.categories.length }] })}
          >
            + Add
          </button>
          <button className="admin-dark" onClick={() => saveStore(store, "Categories saved.")}>Save categories</button>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {store.categories.map((category, i) => (
          <div key={`${category.value}-${i}`} className="border border-sand-deep bg-cream p-4">
            <div className="grid gap-3 md:grid-cols-4">
              <TextField label="Value (slug)" value={category.value} onChange={(v) => update(i, { ...category, value: slugify(v) })} />
              <TextField label="Label" value={category.label} onChange={(v) => update(i, { ...category, label: v })} />
              <TextField label="Order" type="number" value={String(category.order)} onChange={(v) => update(i, { ...category, order: Number(v) })} />
              <label className="flex items-end gap-2 pb-1 text-sm"><input type="checkbox" checked={category.hidden ?? false} onChange={(e) => update(i, { ...category, hidden: e.target.checked })} /> Hide from site</label>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">Image</span>
              {category.image && (
                <div className="relative h-16 w-24 overflow-hidden bg-sand">
                  <Image src={category.image} alt="" fill className="object-cover" />
                </div>
              )}
              <button type="button" className="admin-secondary" onClick={() => uploadCategoryImage(i)}>Upload image</button>
            </div>
            <div className="mt-3">
              <TextArea label="Intro text (shown on category page)" value={category.blurb} onChange={(v) => update(i, { ...category, blurb: v })} />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <TextField label="SEO title" value={category.seoTitle ?? ""} onChange={(v) => update(i, { ...category, seoTitle: v })} />
              <TextField label="Meta description" value={category.seoDescription ?? ""} onChange={(v) => update(i, { ...category, seoDescription: v })} />
            </div>
            <button
              type="button"
              className="admin-danger mt-3"
              onClick={() => {
                if (!window.confirm(`Delete category "${category.label}"?`)) return;
                setStore({ ...store, categories: store.categories.filter((_, idx) => idx !== i) });
              }}
            >
              Delete category
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────── Journal ───────────────────────── */

function JournalSection({ store, setStore, saveStore, uploadAndGetUrl }: SectionProps & { uploadAndGetUrl: (f: File) => Promise<string | null> }) {
  const update = (index: number, article: Article) => {
    const articles = [...store.articles];
    articles[index] = article;
    setStore({ ...store, articles });
  };

  async function uploadArticleImage(index: number) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await uploadAndGetUrl(file);
      if (url) {
        const articles = [...store.articles];
        articles[index] = { ...articles[index], image: url };
        setStore({ ...store, articles });
      }
    };
    input.click();
  }

  return (
    <section className="admin-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-3xl">Journal</h2>
        <div className="flex gap-3">
          <button
            type="button"
            className="admin-secondary"
            onClick={() => setStore({
              ...store,
              articles: [
                {
                  slug: "new-post",
                  title: "New Post",
                  excerpt: "",
                  category: "Style Notes",
                  readTime: "3 min read",
                  date: new Date().toISOString().slice(0, 10),
                  image: "/images/brand/statement.jpg",
                  body: [{ type: "p", text: "Write the post body here." }],
                },
                ...store.articles,
              ],
            })}
          >
            + New post
          </button>
          <button className="admin-dark" onClick={() => saveStore(store, "Journal saved.")}>Save journal</button>
        </div>
      </div>
      <div className="mt-6 space-y-5">
        {store.articles.map((article, i) => (
          <div key={`${article.slug}-${i}`} className="border border-sand-deep bg-cream p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <TextField label="Title" value={article.title} onChange={(v) => update(i, { ...article, title: v, slug: article.slug || slugify(v) })} />
              <TextField label="Slug" value={article.slug} onChange={(v) => update(i, { ...article, slug: slugify(v) })} />
              <TextField label="Category" value={article.category} onChange={(v) => update(i, { ...article, category: v })} />
              <TextField label="Date" value={article.date} onChange={(v) => update(i, { ...article, date: v })} />
              <TextField label="Read time" value={article.readTime} onChange={(v) => update(i, { ...article, readTime: v })} />
            </div>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">Cover image</span>
              {article.image && (
                <div className="relative h-16 w-24 overflow-hidden bg-sand">
                  <Image src={article.image} alt="" fill className="object-cover" />
                </div>
              )}
              <button type="button" className="admin-secondary" onClick={() => uploadArticleImage(i)}>Upload image</button>
            </div>
            <div className="mt-3">
              <TextArea label="Excerpt" value={article.excerpt} onChange={(v) => update(i, { ...article, excerpt: v })} />
              <TextArea
                label="Body (use ## for headings, separate paragraphs with blank lines)"
                value={article.body.map((b) => b.type === "h2" ? `## ${b.text}` : b.text).join("\n\n")}
                onChange={(v) => update(i, {
                  ...article,
                  body: v.split(/\n\n+/).map((part): ArticleBlock =>
                    part.startsWith("## ") ? { type: "h2", text: part.slice(3).trim() } : { type: "p", text: part.trim() }
                  ).filter((b) => b.text),
                })}
              />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <TextField label="SEO title (optional)" value={article.seoTitle ?? ""} onChange={(v) => update(i, { ...article, seoTitle: v })} />
              <TextField label="Meta description (optional)" value={article.seoDescription ?? ""} onChange={(v) => update(i, { ...article, seoDescription: v })} />
            </div>
            <button
              type="button"
              className="admin-danger mt-3"
              onClick={() => {
                if (!window.confirm(`Delete "${article.title}"?`)) return;
                setStore({ ...store, articles: store.articles.filter((_, idx) => idx !== i) });
              }}
            >
              Delete post
            </button>
          </div>
        ))}
        {store.articles.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-soft">No journal posts yet.</p>
        )}
      </div>
    </section>
  );
}

/* ──────────────────── Settings ──────────────────────── */

function SettingsSection({ store, setStore, saveStore }: SectionProps) {
  const s = store.settings;
  const set = (patch: Partial<SiteSettings>) =>
    setStore({ ...store, settings: { ...s, ...patch } });

  return (
    <section className="admin-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-3xl">Site Settings</h2>
        <button className="admin-dark" onClick={() => saveStore(store, "Settings saved.")}>Save settings</button>
      </div>

      <Fieldset title="General">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Site name" value={s.name} onChange={(v) => set({ name: v })} />
          <TextField label="Tagline" value={s.tagline} onChange={(v) => set({ tagline: v })} />
          <TextField label="Domain URL" value={s.url} onChange={(v) => set({ url: v })} />
          <TextField label="Currency" value={s.currency} onChange={(v) => set({ currency: v })} />
          <TextField label="Free shipping threshold" type="number" value={String(s.freeShippingThreshold)} onChange={(v) => set({ freeShippingThreshold: Number(v) })} />
        </div>
      </Fieldset>

      <Fieldset title="Customer Account">
        <label className="flex max-w-2xl items-start gap-3 border border-sand-deep bg-cream-soft p-4">
          <input
            type="checkbox"
            className="mt-1 accent-bronze"
            checked={s.showCustomerAccount}
            onChange={(e) => set({ showCustomerAccount: e.target.checked })}
          />
          <span>
            <span className="block text-sm font-medium text-ink">
              Show customer account on the website
            </span>
            <span className="mt-1 block text-sm text-ink-soft">
              Keep this off until real customer login, order history, and rewards
              are connected. When off, the header icon and footer account link
              are hidden.
            </span>
          </span>
        </label>
      </Fieldset>

      <Fieldset title="Promotions">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Promo code" value={s.firstOrderCode} onChange={(v) => set({ firstOrderCode: v })} />
          <TextField label="Promo discount %" type="number" value={String(s.firstOrderDiscount)} onChange={(v) => set({ firstOrderDiscount: Number(v) })} />
        </div>
      </Fieldset>

      <Fieldset title="WhatsApp">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="WhatsApp number" value={s.whatsapp.number} onChange={(v) => set({ whatsapp: { ...s.whatsapp, number: v } })} />
          <TextField label="Default message" value={s.whatsapp.defaultMessage} onChange={(v) => set({ whatsapp: { ...s.whatsapp, defaultMessage: v } })} />
          <TextField label="Styling message" value={s.whatsapp.stylingMessage} onChange={(v) => set({ whatsapp: { ...s.whatsapp, stylingMessage: v } })} />
          <TextField label="Order support message" value={s.whatsapp.orderSupportMessage} onChange={(v) => set({ whatsapp: { ...s.whatsapp, orderSupportMessage: v } })} />
        </div>
      </Fieldset>

      <Fieldset title="Social Links">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Instagram URL" value={s.social.instagram} onChange={(v) => set({ social: { ...s.social, instagram: v } })} />
          <TextField label="Instagram handle" value={s.social.instagramHandle} onChange={(v) => set({ social: { ...s.social, instagramHandle: v } })} />
          <TextField label="TikTok URL" value={s.social.tiktok} onChange={(v) => set({ social: { ...s.social, tiktok: v } })} />
          <TextField label="Pinterest URL" value={s.social.pinterest} onChange={(v) => set({ social: { ...s.social, pinterest: v } })} />
        </div>
      </Fieldset>

      <Fieldset title="Reviews">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Google Review URL" value={s.googleReviewUrl} onChange={(v) => set({ googleReviewUrl: v })} />
          <TextField label="Average rating" type="number" value={String(s.ratingAverage)} onChange={(v) => set({ ratingAverage: Number(v) })} />
          <TextField label="Review count" type="number" value={String(s.ratingCount)} onChange={(v) => set({ ratingCount: Number(v) })} />
        </div>
      </Fieldset>

      <Fieldset title="Contact Information">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Email" value={s.contact.email} onChange={(v) => set({ contact: { ...s.contact, email: v } })} />
          <TextField label="Phone" value={s.contact.phone} onChange={(v) => set({ contact: { ...s.contact, phone: v } })} />
          <TextField label="Hours" value={s.contact.hours} onChange={(v) => set({ contact: { ...s.contact, hours: v } })} />
          <div className="md:col-span-2">
            <TextArea label="Address" value={s.contact.addressLine} onChange={(v) => set({ contact: { ...s.contact, addressLine: v } })} />
          </div>
        </div>
      </Fieldset>

      <Fieldset title="Stats (shown on homepage)">
        {s.stats.map((stat, i) => (
          <div key={i} className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
            <input
              className="border border-sand-deep bg-cream px-2 py-1.5 text-sm"
              value={stat.value}
              placeholder="Value (e.g. 10,000+)"
              onChange={(e) => {
                const stats = [...s.stats];
                stats[i] = { ...stat, value: e.target.value };
                set({ stats });
              }}
            />
            <input
              className="border border-sand-deep bg-cream px-2 py-1.5 text-sm"
              value={stat.label}
              placeholder="Label"
              onChange={(e) => {
                const stats = [...s.stats];
                stats[i] = { ...stat, label: e.target.value };
                set({ stats });
              }}
            />
            <button type="button" className="text-xs text-red-800" onClick={() => set({ stats: s.stats.filter((_, idx) => idx !== i) })}>×</button>
          </div>
        ))}
        <button
          type="button"
          className="mt-2 text-xs text-bronze underline"
          onClick={() => set({ stats: [...s.stats, { value: "", label: "" }] })}
        >
          + Add stat
        </button>
      </Fieldset>
    </section>
  );
}

/* ──────────────── Shared form primitives ────────────── */

function Fieldset({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6 border-t border-sand-deep pt-5">
      <h3 className="mb-4 text-xs uppercase tracking-[0.16em] text-ink-soft">{title}</h3>
      {children}
    </div>
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

function SizeGroup({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = parseSizeInput(value);
  const selectedSet = new Set(selected);
  const customSizes = selected.filter((size) => !SIZE_OPTIONS.includes(size));
  const normalizedCustomText = customSizes.join("\n");
  const lastEmittedValue = useRef(value);
  const [customText, setCustomText] = useState(normalizedCustomText);
  useEffect(() => {
    if (value !== lastEmittedValue.current) {
      setCustomText(normalizedCustomText);
      lastEmittedValue.current = value;
    }
  }, [normalizedCustomText, value]);

  const format = (sizes: string[]) => {
    const next = parseSizeInput(sizes).join(", ");
    lastEmittedValue.current = next;
    onChange(next);
  };
  const togglePreset = (size: string, checked: boolean) => {
    format(checked ? [...selected, size] : selected.filter((item) => item !== size));
  };
  const updateCustomSizes = (text: string) => {
    setCustomText(text);
    const presets = SIZE_OPTIONS.filter((size) => selectedSet.has(size));
    format([...presets, ...parseSizeInput(text)]);
  };

  return (
    <fieldset>
      <legend className="text-xs uppercase tracking-[0.16em] text-ink-soft">Size codes</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {SIZE_OPTIONS.map((size) => (
          <label key={size} className="flex items-center gap-2 border border-sand-deep px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={selectedSet.has(size)}
              onChange={(event) => togglePreset(size, event.target.checked)}
            />
            {size}
          </label>
        ))}
      </div>
      <label className="mt-4 block">
        <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">
          Custom size codes
        </span>
        <textarea
          value={customText}
          rows={3}
          onChange={(event) => updateCustomSizes(event.target.value)}
          placeholder={"52\n54\nEU 38"}
          className="mt-2 w-full resize-y border border-sand-deep bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-bronze"
        />
      </label>
      <p className="mt-1 text-xs text-ink-soft">
        These exact size codes appear on the product page. If you use variant stock, use the same spelling there.
      </p>
    </fieldset>
  );
}

function ColorGroup({
  selected,
  customColors,
  onChange,
  onCustomColorsChange,
}: {
  selected: string[];
  customColors: string;
  onChange: (values: string[]) => void;
  onCustomColorsChange: (value: string) => void;
}) {
  const customLines = customColors.split("\n");
  const custom = customLines
    .map((line, index) => ({ line, index, color: parseColorInput(line) }))
    .filter((item): item is { line: string; index: number; color: NonNullable<ReturnType<typeof parseColorInput>> } =>
      Boolean(item.color),
    );
  const removeCustom = (index: number) => {
    onCustomColorsChange(
      customLines.filter((_, lineIndex) => lineIndex !== index).join("\n"),
    );
  };

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
      {custom.length > 0 && (
        <div className="mt-3">
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-soft">
            Custom colors
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {custom.map(({ color, index }) => (
              <label key={`${color.name}-${color.hex}-${index}`} className="flex items-center gap-2 border border-bronze/60 bg-cream-soft px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked
                  onChange={(e) => {
                    if (!e.target.checked) removeCustom(index);
                  }}
                />
                <span className="h-4 w-4 rounded-full border border-ink/20" style={{ backgroundColor: color.hex }} />
                {color.name}
              </label>
            ))}
          </div>
        </div>
      )}
    </fieldset>
  );
}
