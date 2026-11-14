/**
 * Minimal admin auth: a single shared password (ADMIN_PASSWORD env) gates the
 * control panel. On login we set an httpOnly cookie holding a hash of the
 * password; every protected request re-computes and compares it. Works in
 * both the Edge middleware and Node route handlers (Web Crypto only).
 */
export const ADMIN_COOKIE = "mazal_admin";

/** Dev default so the panel works locally without any setup. CHANGE in prod. */
function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "mazal-admin";
}

async function sha256hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** The cookie value a logged-in admin should carry. */
export async function sessionToken(): Promise<string> {
  return sha256hex("mazal::" + adminPassword());
}

/** True if the submitted password is correct. */
export async function isValidPassword(submitted: string): Promise<boolean> {
  if (!submitted) return false;
  return (await sha256hex("mazal::" + submitted)) === (await sessionToken());
}

/** True if the request's cookie proves a valid session. */
export async function isAuthed(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  return cookieValue === (await sessionToken());
}

function cookieFromHeader(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

/**
 * Route-level guard for /api/admin handlers. The middleware already blocks
 * unauthenticated requests, but a middleware bypass (e.g. CVE in Next.js
 * < 16.2.11) would otherwise expose orders and customer data, so every
 * handler checks again. Returns a 401 response when not authed, else null.
 */
export async function requireAdmin(req: Request): Promise<Response | null> {
  const value = cookieFromHeader(req.headers.get("cookie"), ADMIN_COOKIE);
  if (await isAuthed(value)) return null;
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
