#!/usr/bin/env node
/**
 * Convert a store backup (admin → Export backup, i.e. /api/admin/export?kind=backup)
 * into SQL for the D1 layout in migrations/0001_store.sql, replacing whatever
 * the database holds.
 *
 *   node scripts/store-to-d1-sql.mjs backup.json > import.sql
 *   npx wrangler d1 execute mazal-store --remote --file import.sql
 *
 * D1 caps a single statement at 100 KB, so large values are written in chunks
 * (INSERT the first chunk, then append with UPDATE ... SET data = data || ...).
 */
import { readFileSync } from "node:fs";

const CHUNK = 40_000; // characters; escaped SQL stays well under 100 KB

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/store-to-d1-sql.mjs <backup.json>");
  process.exit(1);
}
// Upload names containing ".." are stored in R2 with a single dot (Cloudflare's
// API firewall rejects ".." in keys); rewrite references to match.
const raw = readFileSync(file, "utf8").replace(
  /\/uploads\/([A-Za-z0-9._-]+)/g,
  (_, name) => `/uploads/${name.replace(/\.{2,}/g, ".")}`,
);
const store = JSON.parse(raw);
if (!store || typeof store !== "object" || !Array.isArray(store.products)) {
  console.error("Not a store backup: expected an object with a products array.");
  process.exit(1);
}

const q = (value) => `'${String(value).replace(/'/g, "''")}'`;
const out = [];

function writeChunked(table, keyColumn, keyValue, extraColumns, json) {
  const chunks = [];
  for (let i = 0; i < json.length; i += CHUNK) chunks.push(json.slice(i, i + CHUNK));
  if (!chunks.length) chunks.push("");
  const cols = [keyColumn, ...Object.keys(extraColumns), "data"];
  const vals = [q(keyValue), ...Object.values(extraColumns).map(q), q(chunks[0])];
  out.push(`INSERT INTO ${table} (${cols.join(", ")}) VALUES (${vals.join(", ")});`);
  for (const chunk of chunks.slice(1)) {
    out.push(`UPDATE ${table} SET data = data || ${q(chunk)} WHERE ${keyColumn} = ${q(keyValue)};`);
  }
}

out.push("DELETE FROM store_sections;");
out.push("DELETE FROM store_orders;");
out.push("DELETE FROM store_write_guard;");

let sections = 0;
for (const [key, value] of Object.entries(store)) {
  if (key === "orders" || value === undefined) continue;
  writeChunked("store_sections", "key", key, {}, JSON.stringify(value));
  sections++;
}

const orders = Array.isArray(store.orders) ? store.orders : [];
const seen = new Set();
for (const order of orders) {
  if (!order || typeof order.id !== "string" || seen.has(order.id)) {
    console.error(`Skipping order without a unique id: ${JSON.stringify(order).slice(0, 80)}`);
    continue;
  }
  seen.add(order.id);
  writeChunked("store_orders", "id", order.id, { created_at: order.createdAt ?? "" }, JSON.stringify(order));
}

// Bump the version so any write that read the old data retries.
out.push("INSERT OR IGNORE INTO store_meta (id, version) VALUES (1, 0);");
out.push("UPDATE store_meta SET version = version + 1 WHERE id = 1;");

process.stdout.write(out.join("\n") + "\n");
console.error(`Generated: ${sections} sections, ${seen.size} orders, ${out.length} statements.`);
