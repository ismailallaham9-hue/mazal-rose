/**
 * Cloudflare D1 persistence for the MAZAL store (used when the site runs on
 * Cloudflare Workers, where there is no disk).
 *
 * Layout (see migrations/0001_store.sql):
 *   • store_sections — one row per top-level StoreData key except `orders`
 *   • store_orders   — one row per order, so a new order writes one small row
 *   • store_meta     — a single version counter used for optimistic locking
 *
 * Writes keep the exact semantics of the disk store: the caller's updater gets
 * a fresh copy of the whole store and returns the next one. Only rows that
 * changed are written, in one D1 batch (a transaction) that first checks the
 * version is unchanged; if another write won the race the batch aborts and the
 * updater is re-run on the newer data.
 */
import "server-only";

type D1Result<T> = { results: T[]; meta: { changes?: number } };
type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
};
export type D1Like = {
  prepare(sql: string): D1Statement;
  batch(statements: D1Statement[]): Promise<D1Result<unknown>[]>;
};
type R2Object = { body: ReadableStream; size: number; httpMetadata?: { contentType?: string } };
export type R2Like = {
  put(key: string, value: ArrayBuffer | Uint8Array, options?: { httpMetadata?: { contentType?: string; cacheControl?: string } }): Promise<unknown>;
  get(key: string): Promise<R2Object | null>;
};

type Bindings = { DB?: D1Like; MEDIA_BUCKET?: R2Like };

async function bindings(): Promise<Bindings> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    return (getCloudflareContext().env ?? {}) as Bindings;
  } catch {
    // Not running on Cloudflare (Render, local `next start`, or `next build`).
    return {};
  }
}

export async function getD1(): Promise<D1Like | null> {
  return (await bindings()).DB ?? null;
}

export async function getMediaBucket(): Promise<R2Like | null> {
  return (await bindings()).MEDIA_BUCKET ?? null;
}

type RawStore = Record<string, unknown> & { orders?: unknown[] };
type RawOrder = { id: string; createdAt?: string } & Record<string, unknown>;

/** Read the raw (un-normalised) store, or null if the database is empty. */
export async function readD1Store(db: D1Like): Promise<{ store: RawStore; version: number } | null> {
  const [meta, sections, orders] = await db.batch([
    db.prepare("SELECT version FROM store_meta WHERE id = 1"),
    db.prepare("SELECT key, data FROM store_sections"),
    db.prepare("SELECT data FROM store_orders ORDER BY created_at DESC, id DESC"),
  ]);
  const version = Number((meta.results[0] as { version?: number } | undefined)?.version ?? 0);
  const sectionRows = sections.results as { key: string; data: string }[];
  if (!sectionRows.length) return null;
  const store: RawStore = {};
  for (const row of sectionRows) store[row.key] = JSON.parse(row.data);
  store.orders = (orders.results as { data: string }[]).map((row) => JSON.parse(row.data));
  return { store, version };
}

export class D1WriteConflict extends Error {}

/**
 * Write `next` over `prev` (both raw stores), touching only changed rows.
 * Throws D1WriteConflict if the store changed since `version` was read.
 */
export async function writeD1Store(
  db: D1Like,
  prev: RawStore | null,
  next: RawStore,
  version: number,
): Promise<void> {
  const statements: D1Statement[] = [
    // Aborts the whole batch (NOT NULL violation) unless the version matches.
    db
      .prepare(
        "INSERT INTO store_write_guard (ok) SELECT CASE WHEN version = ?1 THEN 1 ELSE NULL END FROM store_meta WHERE id = 1",
      )
      .bind(version),
    db.prepare("DELETE FROM store_write_guard"),
    db.prepare("UPDATE store_meta SET version = version + 1 WHERE id = 1"),
  ];

  for (const [key, value] of Object.entries(next)) {
    if (key === "orders" || value === undefined) continue;
    const json = JSON.stringify(value);
    if (prev && JSON.stringify(prev[key]) === json) continue;
    statements.push(
      db
        .prepare(
          "INSERT INTO store_sections (key, data) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET data = excluded.data",
        )
        .bind(key, json),
    );
  }

  const prevOrders = new Map(
    ((prev?.orders ?? []) as RawOrder[]).map((order) => [order.id, JSON.stringify(order)]),
  );
  const nextOrders = (next.orders ?? []) as RawOrder[];
  const nextIds = new Set<string>();
  for (const order of nextOrders) {
    nextIds.add(order.id);
    const json = JSON.stringify(order);
    if (prevOrders.get(order.id) === json) continue;
    statements.push(
      db
        .prepare(
          "INSERT INTO store_orders (id, created_at, data) VALUES (?1, ?2, ?3) ON CONFLICT(id) DO UPDATE SET created_at = excluded.created_at, data = excluded.data",
        )
        .bind(order.id, order.createdAt ?? "", json),
    );
  }
  for (const id of prevOrders.keys()) {
    if (!nextIds.has(id)) {
      statements.push(db.prepare("DELETE FROM store_orders WHERE id = ?1").bind(id));
    }
  }

  try {
    await db.batch(statements);
  } catch (error) {
    if (/NOT NULL constraint failed: store_write_guard/i.test(String(error))) {
      throw new D1WriteConflict("Store changed during write");
    }
    throw error;
  }
}
