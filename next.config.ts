import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
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
  },
  async redirects() {
    // Old Wix URLs are redirected by src/proxy.ts from the `redirect` table (editable in the admin).
    return [{ source: "/", destination: "/es", permanent: false }];
  },
};

export default nextConfig;
