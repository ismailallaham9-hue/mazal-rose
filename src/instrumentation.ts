/**
 * Render builds without the data disk mounted, so pages prerendered at build
 * time contain the seed catalogue. Right after the server boots, ask it to
 * revalidate the storefront so the first visitors get pages built from the
 * live store. The token only lives in this process's memory.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "production") return;
  // On Cloudflare Workers there is no long-lived server to call back into;
  // the deploy script calls /api/internal/warm with REVALIDATE_SECRET instead.
  if (typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers") return;

  const token = crypto.randomUUID();
  (globalThis as { __mazalWarmToken?: string }).__mazalWarmToken = token;

  const port = process.env.PORT || "3000";
  const base = `http://127.0.0.1:${port}`;
  setTimeout(async () => {
    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        const res = await fetch(`${base}/api/internal/warm`, {
          method: "POST",
          headers: { "x-warm-token": token },
        });
        if (res.ok) {
          // Regenerate the busiest pages before real traffic asks for them.
          await Promise.allSettled(
            ["/", "/shop", "/journal"].map((path) => fetch(base + path)),
          );
          return;
        }
      } catch {
        /* server not listening yet */
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.error("Storefront warm-up failed; pages refresh within 60s instead.");
  }, 500);
}
