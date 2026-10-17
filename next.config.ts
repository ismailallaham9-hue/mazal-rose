import type { NextConfig } from "next";

const NOINDEX = "noindex, nofollow, noarchive";
const PRIVATE = "noindex, nofollow";

const nextConfig: NextConfig = {
  images: {
    // Serve images as-is. On-the-fly resizing (sharp) pushed the 512 MB Render
    // instance over its memory limit, and its cache is wiped on every restart,
    // so each restart re-resized everything and crashed again. Uploads are
    // already compressed WebP.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // Brand images and hero videos are served from Cloudflare R2 (free egress)
  // instead of Render, whose plan meters bandwidth; the hero video alone was
  // ~5 MB per homepage visit. Redirecting covers hardcoded paths and paths
  // saved in the store. Set MEDIA_URL (e.g. https://media.mazal.ae) at build
  // time to enable; without it the files are served from public/ as before.
  async redirects() {
    const media = process.env.MEDIA_URL?.replace(/\/$/, "");
    if (!media) return [];
    const sources = ["/video/:path*", "/images/:path*"];
    // On Cloudflare, admin uploads live in the same R2 bucket under uploads/.
    if (process.env.MEDIA_UPLOADS) sources.push("/uploads/:path*");
    return sources.map((source) => ({
      source,
      destination: `${media}${source}`,
      permanent: true,
    }));
  },
  // Keep admin + transactional/account routes out of search indexes at the
  // header level (works for client components too, unlike page metadata).
  async headers() {
    const rule = (source: string, value: string) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value }],
    });
    // Test deployments (e.g. *.workers.dev) must not be indexed.
    if (process.env.NOINDEX_ALL) return [rule("/:path*", NOINDEX)];
    return [
      rule("/admin", NOINDEX),
      rule("/admin/:path*", NOINDEX),
      rule("/account", PRIVATE),
      rule("/account/:path*", PRIVATE),
      rule("/wishlist", PRIVATE),
      rule("/cart", PRIVATE),
      rule("/checkout", PRIVATE),
    ];
  },
};

export default nextConfig;
