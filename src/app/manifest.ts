import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tech-Inspection S.A.S.",
    short_name: "Tech-Inspection",
    description: "Ensayos no destructivos (NDT) en Colombia",
    start_url: "/es",
    display: "standalone",
    background_color: "#f6f8fc",
    theme_color: "#030a8c",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
