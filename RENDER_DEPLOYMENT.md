# Deploy MAZAL Rose to Render

This app needs a Render **Web Service**, not a static site, because the admin
panel uses server routes for login, saving content, and uploads.

## Backend persistence

The admin backend stores:

- `store.json` at `MAZAL_DATA_DIR/store.json`
- uploaded files at `MAZAL_DATA_DIR/uploads`

On Render, `render.yaml` mounts a persistent disk at `/var/data` and sets:

```txt
MAZAL_DATA_DIR=/var/data/mazal
```

Without the disk, Render's normal filesystem is temporary and admin changes can
disappear after restart or redeploy.

## Render settings

Use the included `render.yaml` Blueprint, or create a Web Service manually:

```txt
Runtime: Node
Build Command: npm ci && npm run build
Start Command: npm run start
Health Check Path: /api/health
Disk Mount Path: /var/data
Disk Size: 1 GB
```

Environment variables:

```txt
ADMIN_PASSWORD=<choose a strong private password>
MAZAL_DATA_DIR=/var/data/mazal
NODE_ENV=production
RESEND_API_KEY=<optional, for live email sending>
RESEND_FROM=MAZAL <care@mazal.ae>
ADMIN_EMAIL=<where new-order/contact alerts should go>
```

`BLOB_READ_WRITE_TOKEN` is optional. If you set it, the app will use Vercel Blob
instead of the Render disk for admin data and uploaded media.

Email notifications use Resend when `RESEND_API_KEY` is set. If it is not set,
the app still records email events in the admin panel as queued/outbox items.

## Important

Render deploys from a Git repository. Push this folder to GitHub, connect that
repo in Render, and choose Blueprint deployment if you want Render to read
`render.yaml` automatically.
