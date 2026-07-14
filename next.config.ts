import type { NextConfig } from "next";

const NOINDEX = "noindex, nofollow, noarchive";
const PRIVATE = "noindex, nofollow";

const nextConfig: NextConfig = {
  images: {
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
  async redirects() {
    return [
      {
        source: "/contact",
        has: [{ type: "query", key: "subject" }],
        destination: "/contact#review-form",
        permanent: true,
      },
      {
        source: "/contact",
        has: [{ type: "query", key: "message" }],
        destination: "/contact#review-form",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
