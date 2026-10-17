-- MAZAL store on Cloudflare D1. See src/lib/store-d1.ts.

CREATE TABLE IF NOT EXISTS store_sections (
  key TEXT PRIMARY KEY,
  data TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS store_orders (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  data TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS store_orders_created_at ON store_orders (created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS store_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  version INTEGER NOT NULL
);

INSERT OR IGNORE INTO store_meta (id, version) VALUES (1, 0);

-- Optimistic-lock guard: inserting NULL here aborts a write batch whose
-- version check failed. Rows are deleted in the same batch.
CREATE TABLE IF NOT EXISTS store_write_guard (
  ok INTEGER NOT NULL
);
