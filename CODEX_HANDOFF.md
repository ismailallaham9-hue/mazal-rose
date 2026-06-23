# MAZAL Rose Codex Handoff

## Current State

This project is a Next.js MAZAL Rose storefront with a newly completed no-code admin/control panel foundation.

Local project path:

`C:\Users\RANEEM\.claude\mazal-rose`

GitHub repository created:

`https://github.com/ismailallaham9-hue/mazal-rose`

The repo exists on GitHub, but the local push was blocked by Windows HTTPS authentication errors:

`schannel: AcquireCredentialsHandle failed: SEC_E_NO_CREDENTIALS`

GitHub web login worked in the browser. Git push/device login did not work from this Windows environment.

## How To Run Locally

Use Node 20+.

```powershell
npm install
npm run dev -- --port 3001
```

Admin login:

`http://localhost:3001/admin/login`

Default local password:

`mazal-admin`

For production, set:

`ADMIN_PASSWORD`

## What Was Added

- Full admin login UI.
- Admin dashboard at `/admin`.
- Product create/edit/delete APIs.
- Product image/media upload API.
- Content/settings/theme/category/journal management APIs.
- Logout API.
- Health endpoint for Render.
- Store persistence layer that supports:
  - Vercel Blob when `BLOB_READ_WRITE_TOKEN` exists.
  - Render persistent disk when `MAZAL_DATA_DIR` or `RENDER_DATA_DIR` exists.
  - Local `data/store.json` fallback.
- Uploaded file serving route at `/uploads/[filename]`.
- Public site wiring for store-backed products, categories, journal, hero text, announcement marquee, theme colors, footer content, and newsletter content.
- Render deployment files:
  - `render.yaml`
  - `RENDER_DEPLOYMENT.md`

## Validation Already Done

These passed locally:

```powershell
npx tsc --noEmit
npm run lint
npm run build
```

Lint completed with only pre-existing unused-variable warnings in a few components.

## Deployment Notes

The intended Render setup is a Node web service or Render Blueprint using `render.yaml`.

Important Render env vars:

- `ADMIN_PASSWORD`: required secret for admin login.
- `MAZAL_DATA_DIR=/var/data/mazal`: used with the persistent disk.

The Render disk is configured in `render.yaml`:

- Disk name: `mazal-data`
- Mount path: `/var/data`
- Size: `1GB`

## Remaining Work For Next Developer

1. Push the project to GitHub.
   - Best workaround: use SSH auth or push from an environment where GitHub HTTPS auth works.
   - Remote already intended as:
     `https://github.com/ismailallaham9-hue/mazal-rose.git`
2. Connect the GitHub repo to Render.
3. Set `ADMIN_PASSWORD` in Render.
4. Deploy using the included `render.yaml`.
5. After deploy, test:
   - `/`
   - `/shop`
   - `/journal`
   - `/admin/login`
   - product create/edit/delete
   - media upload
   - theme/content edits persisting after restart.

## Files/Folders To Exclude From Handoff Uploads

Do not upload these generated/local folders:

- `node_modules`
- `.next`
- `.npm-cache`
- `.vercel`
- `data`
- `public/uploads`
- `tsconfig.tsbuildinfo`

