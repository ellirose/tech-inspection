import type { NextConfig } from "next";

// Old Wix URLs → new localized routes, so existing links and search results keep working.
const legacy: [string, string][] = [
  ["/inicio", "/es"],
  ["/nosotros", "/es/nosotros"],
  ["/directivas", "/es/nosotros#liderazgo"],
  ["/nuestro-clientes", "/es/nosotros#clientes"],
  ["/tecnicas-de-inspeccion", "/es/metodos"],
  ["/particulas-magneticas", "/es/metodos/particulas-magneticas"],
  ["/liquidos-penetrantes", "/es/metodos/liquidos-penetrantes"],
  ["/ultrasonido", "/es/metodos/ultrasonido"],
  ["/dimensional-visual", "/es/metodos/dimensional-visual"],
  ["/servicios", "/es/servicios"],
  ["/inspeccion-de-tuberia", "/es/servicios/tuberia"],
  ["/inspeccion-de-componentes-bha", "/es/servicios/componentes-bha"],
  ["/inspeccion-de-lineas-de-presion", "/es/servicios/lineas-de-presion"],
  ["/inspeccion-de-herramientas-de-fishing-y", "/es/servicios/fishing-wireline"],
  ["/inspeccion-de-equipos-de-cementacion", "/es/servicios/equipos-de-cementacion"],
  ["/inspecci%C3%B3n-de-herremientas-de-levante", "/es/servicios/levante-e-izaje"],
  ["/inspecci%C3%B3n-de-herramientas-de-levante", "/es/servicios/levante-e-izaje"],
  ["/inspecci%C3%B3n-de-tanques", "/es/servicios/tanques"],
  ["/copia-de-inspecci%C3%B3n-de-tanques", "/es/servicios/estructural"],
  ["/hseq", "/es/hseq"],
  ["/contacto", "/es/contacto"],
  ["/fullscreen-page", "/es"],
  ["/members-area", "/es/plataforma"],
];

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
    return [
      { source: "/", destination: "/es", permanent: false },
      ...legacy.map(([source, destination]) => ({ source, destination, permanent: true })),
    ];
  },
};

export default nextConfig;
