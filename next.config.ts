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
    // The rewards programme isn't live; send old links to the shop
    // (temporary, so the page can come back).
    const hidden = [{ source: "/rewards", destination: "/shop", permanent: false }];
    const media = process.env.MEDIA_URL?.replace(/\/$/, "");
    if (!media) return hidden;
    return [
      ...hidden,
      ...["/video/:path*", "/images/:path*"].map((source) => ({
        source,
        destination: `${media}${source}`,
        permanent: true,
      })),
    ];
  },
  // Keep admin + transactional/account routes out of search indexes at the
  // header level (works for client components too, unlike page metadata).
  async headers() {
    const rule = (source: string, value: string) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value }],
    });
    return [
      {
        // Baseline security headers for every response. No CSP script
        // allow-list here: it would need maintaining for Meta Pixel, Google
        // Analytics and Noon, and a mistake would break checkout.
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
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
