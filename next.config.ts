import type { NextConfig } from "next";

const NOINDEX = "noindex, nofollow, noarchive";
const PRIVATE = "noindex, nofollow";

const nextConfig: NextConfig = {
  images: {
    // Serve images as-is. On-the-fly resizing (sharp) pushed the 512 MB Render
    // instance over its memory limit, and its cache is wiped on every restart,
    // so each restart re-resized everything and crashed again. Uploads are
    // already compressed WebP; Cloudflare caches them at the edge.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // Keep admin + transactional/account routes out of search indexes at the
  // header level (works for client components too, unlike page metadata).
  async headers() {
    const rule = (source: string, value: string) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value }],
    });
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
