import type { NextConfig } from "next";

// Security headers (design document §19.3). Scripts may come only from the site, Cloudflare Turnstile
// and Google Tag Manager (loaded after analytics consent). Inline scripts stay allowed because Next.js
// streams its page data inline and the pages are prerendered, so a per-request nonce is not possible.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tech-inspection.com";
const https = siteUrl.startsWith("https://");
const google = "https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com";
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${google}`,
  "font-src 'self' data:",
  `connect-src 'self' https://challenges.cloudflare.com ${google}`,
  "frame-src https://challenges.cloudflare.com",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(https ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  // HTTPS only (browsers ignore COOP on plain HTTP and log an error), and HSTS without includeSubDomains:
  // TI-QMS and other subdomains are not this server's to decide.
  ...(https
    ? [
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Strict-Transport-Security", value: "max-age=31536000" },
      ]
    : []),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Addresses that match no route get the site's own 404 page (src/app/global-not-found.tsx).
    globalNotFound: true,
  },
  async headers() {
    // Development keeps Next's defaults: its dev tools need eval and a live-reload connection.
    return process.env.NODE_ENV === "production" ? [{ source: "/:path*", headers: securityHeaders }] : [];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // The OG image reads these from disk at request time; make sure they ship with the function.
  outputFileTracingIncludes: {
    "/[lang]/opengraph-image": ["./src/assets/**/*", "./public/media/brand/logo.png"],
  },
  images: {
    qualities: [70, 80, 90],
    formats: ["image/avif", "image/webp"],
    // Fewer widths than the defaults (16 in all): every image's srcset lists each of them, and the home
    // page alone has over a hundred images, so the HTML is noticeably smaller.
    deviceSizes: [640, 828, 1200, 1920, 2560],
    imageSizes: [64, 128, 256, 384],
  },
  async redirects() {
    // Old Wix URLs are redirected by src/proxy.ts from the `redirect` table (editable in the admin).
    return [{ source: "/", destination: "/es", permanent: false }];
  },
};

export default nextConfig;
