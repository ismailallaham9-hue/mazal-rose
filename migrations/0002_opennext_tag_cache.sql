-- OpenNext D1 tag cache (instant page refresh after admin saves and orders).
-- `opennextjs-cloudflare deploy` normally creates this while populating the
-- remote cache; created here so `wrangler deploy` (no cache upload) also works.
CREATE TABLE IF NOT EXISTS revalidations (
  tag TEXT NOT NULL,
  revalidatedAt INTEGER NOT NULL,
  stale INTEGER,
  expire INTEGER DEFAULT NULL,
  UNIQUE(tag) ON CONFLICT REPLACE
);
