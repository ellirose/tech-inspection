import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { getMethods, getServices } from "@/lib/data/content";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [methods, services] = await Promise.all([getMethods(), getServices()]);
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
    "/portafolio",
    "/trabaja-con-nosotros",
  ];
  return paths.map((p) => ({
    url: `${SITE_URL}/es${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.7,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l === "pt" ? "pt-BR" : l === "es" ? "es-CO" : l, `${SITE_URL}/${l}${p}`])) },
  }));
}
