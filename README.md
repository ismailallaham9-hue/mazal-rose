# MAZAL — Premium Modest Fashion Storefront

_"MAZAL means Still."_ A high-converting, premium fashion eCommerce front end
built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4**.

Multi-category (abayas, kaftans, dresses, modest, formal, casual, throws,
scarves, accessories, bags, shoes) with the conversion, trust, and marketing
machinery of leading fashion retailers — inside an editorial, quiet-luxury
design system.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

> Node isn't required to be system-installed; a portable Node 24 LTS lives in
> `C:\Users\RANEEM\node-portable` and is on your PATH.

---

## ⚙️ Configure your real values (do this first)

Everything brand/marketing-specific is centralised in **`src/lib/site.ts`**.
Search for `TODO` and replace:

| Value | What it powers |
|---|---|
| `whatsapp.number` | Floating WhatsApp button, product inquiry, contact page |
| `googleReviewUrl` | "Write a review" CTAs sitewide |
| `ratingAverage` / `ratingCount` | Sitewide social-proof rating |
| `social.*` | Instagram feed + footer links |
| `stats` | Store-statistics strip |
| `contact.*` | Contact page details |
| `freeShippingThreshold` | Cart free-shipping progress bar |
| `firstOrderCode` / `firstOrderDiscount` | Promo bar + newsletter incentive |
| `url` | Canonical domain for SEO/sitemap/schema |

---

## 🛍️ Product data → real API later

Mock catalogue lives in **`src/lib/products.ts`**, shaped like an API response.
To go live, replace the bodies of `getProducts()` / `getProduct()` with `fetch()`
calls and keep the return types — the UI won't change.

**Product images:** drop real photos into `public/images/brand/` (see
`README.txt` there) or add an `image` path per product in `products.ts`.
Products without an image render an elegant sand "atelier" placeholder.

---

## 🗂️ Structure

```
src/
  app/
    layout.tsx              # providers, promo bar, header/footer, WhatsApp, SEO
    page.tsx                # homepage (hero, rails, social proof, IG, etc.)
    shop/page.tsx           # collection w/ filters + sort + SEO
    shop/[slug]/page.tsx    # product detail + schema (Product/FAQ JSON-LD)
    about/ contact/ wishlist/
    sitemap.ts  robots.ts   # SEO
  components/               # Header, Footer, ProductCard, CartDrawer,
                            # ProductRail, Testimonials, TrustBadges, etc.
  lib/
    site.ts                 # ⚙️ central config (replace TODOs)
    products.ts             # catalogue + selectors
    cart-context.tsx        # cart (localStorage)
    wishlist-context.tsx    # wishlist (localStorage)
```

---

## ✨ Features implemented

**Homepage:** split hero, trust badges, shop-by-category, New Arrivals /
Best Sellers / Trending rails, featured collection band, seasonal (Eid) campaign
banner, brand story, statement band, testimonials + Google rating, store stats,
Instagram feed, newsletter with first-order incentive.

**Shop:** category/size/colour/price/on-sale filters, sort, result count,
mobile filter drawer, breadcrumbs, collection SEO copy.

**Product:** gallery, colour/size selectors, qty, buy box, low-stock urgency,
sale pricing, wishlist, WhatsApp inquiry, size guide, material/care,
delivery/returns accordions, frequently-bought-together (add-all bundle),
complete-the-look, similar styles, recently viewed, reviews + rating
distribution + customer photos.

**Conversion/trust:** flash-sale countdown promo bar, first-order discount,
free-shipping cart progress bar, quick-add, wishlist, trust badges, verified
reviews, store stats, floating WhatsApp w/ quick replies.

**SEO:** per-page metadata, Product + AggregateRating + FAQ JSON-LD, sitemap,
robots, clean `/shop/[slug]` URLs, image optimization via `next/image`.

---

## 🔜 Suggested next steps (need a backend)

Real checkout/payments, customer accounts & order history, live reviews,
blog/journal, loyalty & referral programs, abandoned-cart WhatsApp automation,
and a real Instagram feed. Hooks/structure are in place for all of these.
