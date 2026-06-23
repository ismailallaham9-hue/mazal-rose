# MAZAL (rose theme) — project handoff

This is the **rose/blush** variant of the MAZAL storefront (the one that runs on
**port 3001**). It is a clone of the original `mazal-website`, re-themed and with
real campaign photography + a control panel in progress.

## Stack
- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript**
- **Tailwind v4** — all brand tokens live in `src/app/globals.css` under `@theme`
  (there is NO `tailwind.config`). Blush/espresso palette:
  cream `#fdf7f3`, sand `#f0d6ca`, sand-deep `#e2bcae`, bronze/accent `#c2887a`,
  ink/text `#46352e`.
- `framer-motion`, `lenis` (smooth scroll), `@vercel/blob` (admin storage).
- Fonts: Cormorant Garamond (serif) + Inter (sans).

## Run it
Node is a **portable** install on this machine (not global):
`C:\Users\RANEEM\node-portable\node-v24.17.0-win-x64`. On another machine just use
any Node 20+.

```bash
npm install
npm run dev -- --port 3001     # http://localhost:3001
npm run build                  # production build (verified passing)
```
Helper scripts in the repo root: `start-rose.bat` / `start-rose.ps1` (run dev),
`deploy-online.bat` (deploy to Vercel).

## Key structure
```
src/app/
  page.tsx            homepage (HeroVideo → EditorialHero → InlineChipHeadline →
                      Collection2026 → rails → story → testimonials)
  layout.tsx          SmoothScroll, VeilIntro, AnnouncementMarquee, Header, Footer
  globals.css         @theme brand tokens + utilities
  api/admin/*         control-panel API (IN PROGRESS — see below)
  admin/*             control-panel UI (TO BUILD — see below)
src/components/        HeroVideo, EditorialHero, InlineChipHeadline, Collection2026,
                      CategoryGrid (uses /public/images/categories/*), PillButton,
                      VeilIntro, SmoothScroll, Footer, FooterNewsletter, etc.
src/lib/
  products.ts         catalogue seed (18 products) + selectors
  store.ts            content store (Vercel Blob in prod / local file in dev /
                      seed fallback) — the admin panel reads & writes this
  admin-auth.ts       password gate (ADMIN_PASSWORD env) + session cookie
  admin-product.ts    product form options + normalizeProduct()
  site.ts             central config (WhatsApp, reviews, socials — has TODOs)
src/middleware.ts     protects /admin and /api/admin
public/
  video/              after-dark.* (unused now), hero-fashion.* (current hero),
                      mazal-qr.png
  images/brand/       real MAZAL campaign photos (lookbook-1, collection-feature,
                      statement, about-1/2, logo, etc.)
  images/categories/  the 8 shop-by-category photos
MAZAL_FASHION_90_DAY_MARKETING_REPORT.{html,pdf}  marketing strategy deliverable
```

## Hero
`HeroVideo.tsx` plays `public/video/hero-fashion.{webm,mp4}` (1080p, full-screen,
dark overlay, scroll cue). The earlier `AfterDarkHero` + `after-dark.*` files are
unused leftovers.

## Control panel — STATUS: IN PROGRESS (~60%)
Goal: a no-code `/admin` so a non-technical owner can add/remove products, upload
images, and edit hero text. Persistence = **Vercel Blob** in production (a single
`mazal/store.json` blob + uploaded images), a local `data/store.json` in dev, and
the `products.ts` seed as a read-only fallback.

DONE:
- `src/lib/store.ts` — read/write store, image upload, env-aware persistence.
- `src/lib/admin-auth.ts` + `src/middleware.ts` — password gate.
- `src/lib/admin-product.ts` — form options + product normalizer.
- `src/app/api/admin/login/route.ts` — login (sets cookie).

TODO (next steps):
1. API routes: `logout`, `products` (POST create), `products/[id]` (PUT/DELETE),
   `content` (POST), `upload` (POST image → `uploadImage()` in store.ts).
2. Admin UI under `src/app/admin/`: `login/page.tsx`, `page.tsx` (dashboard:
   product list + add/edit/delete + image upload), content editor.
3. Wire public pages (home rails, `/shop`) to read products from `getStoreData()`
   instead of importing `products.ts` directly (keep the seed fallback).
4. `next.config.ts` → add `images.remotePatterns` for
   `*.public.blob.vercel-storage.com` so uploaded images render via next/image.

### Env vars needed (set in Vercel → Project → Settings → Environment Variables)
- `ADMIN_PASSWORD` — the control-panel password (defaults to `mazal-admin` in dev).
- `BLOB_READ_WRITE_TOKEN` — auto-added when you enable **Storage → Blob** on the
  Vercel project. Without it, the site uses the seed catalogue (read-only on prod).

## Notes / gotchas
- Tailwind v4: edit tokens in `globals.css`, not a config file.
- Do NOT cache-bust local next/image with `?v=` — Next 16 throws on query strings
  unless whitelisted in `images.localPatterns`.
- The original (red "After Dark") site lives separately in `C:\Users\RANEEM\mazal-website`.
