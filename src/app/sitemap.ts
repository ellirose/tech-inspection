import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { methods } from "@/content/methods";
import { services } from "@/content/services";
import { SITE_URL } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/nosotros",
    "/metodos",
    ...methods.map((m) => `/metodos/${m.slug}`),
    "/servicios",
    ...services.map((s) => `/servicios/${s.slug}`),
    "/hseq",
    "/plataforma",
    "/contacto",
  ];
  return paths.map((p) => ({
    url: `${SITE_URL}/es${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.7,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l === "pt" ? "pt-BR" : l === "es" ? "es-CO" : l, `${SITE_URL}/${l}${p}`])) },
  }));
}
