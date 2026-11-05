import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { getCases, getIndustries, getMethods, getServices } from "@/lib/data/content";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [methods, services, industries, cases] = await Promise.all([getMethods(), getServices(), getIndustries(), getCases()]);
  const paths = [
    "",
    "/nosotros",
    "/metodos",
    ...methods.map((m) => `/metodos/${m.slug}`),
    "/servicios",
    ...services.map((s) => `/servicios/${s.slug}`),
    "/industrias",
    ...industries.map((i) => `/industrias/${i.slug}`),
    "/certificaciones",
    "/clientes",
    ...cases.map((c) => `/clientes/${c.slug}`),
    "/hseq",
    "/plataforma",
    "/preguntas-frecuentes",
    "/cotizar",
    "/contacto",
    "/portafolio",
    "/trabaja-con-nosotros",
    "/politica-de-privacidad",
    "/terminos",
  ];
  return paths.map((p) => ({
    url: `${SITE_URL}/es${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : p === "/cotizar" || p === "/servicios" ? 0.9 : 0.7,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l === "pt" ? "pt-BR" : l === "es" ? "es-CO" : l, `${SITE_URL}/${l}${p}`])) },
  }));
}
