/**
 * Abuse protection for public endpoints (contact, newsletter, ratings,
 * orders, Meta events, admin login).
 *
 * Every write lands in the store, so an unbounded body or a flood of
 * requests could grow it until the server runs out of memory. Limits here
 * are per server instance (Render runs one); Cloudflare rate-limiting rules
 * are the outer layer.
 */
import "server-only";

/** Real client IP. Cloudflare sets cf-connecting-ip and overwrites any value
 * the client sends; x-forwarded-for's first entry can be forged. */
export function clientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip")?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ||
    "unknown"
  );
}

export class RequestTooLarge extends Error {}

/** Parse a JSON body, refusing anything over `maxBytes`. Returns {} for bad JSON. */
export async function readJsonBody(req: Request, maxBytes = 16 * 1024): Promise<Record<string, unknown>> {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (Number.isFinite(declared) && declared > maxBytes) throw new RequestTooLarge();
  const text = await req.text();
  if (text.length > maxBytes) throw new RequestTooLarge();
  try {
    const parsed = text ? JSON.parse(text) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

const buckets = new Map<string, number[]>();

/**
 * Sliding-window limit: at most `max` hits per `windowMs` for `key`.
 * Returns true if the request is allowed.
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return true;
}

export const tooManyRequests = () =>
  Response.json({ error: "Too many requests. Please wait a few minutes and try again." }, { status: 429 });

export const payloadTooLarge = () =>
  Response.json({ error: "Request is too large." }, { status: 413 });

/** Trim and cap a user-supplied string. */
export function limitText(value: unknown, max: number, fallback = ""): string {
  return String(value ?? fallback).trim().slice(0, max);
}
