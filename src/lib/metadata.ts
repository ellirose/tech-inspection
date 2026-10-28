import type { Metadata } from "next";
import { locales, ogLocale, type Locale } from "@/i18n/config";

/** Per-page metadata with canonical + hreflang alternates for every locale. */
export function pageMeta(lang: Locale, path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}${path}`,
      languages: Object.fromEntries([
        ...locales.map((l) => [l === "es" ? "es-CO" : l === "pt" ? "pt-BR" : "en", `/${l}${path}`]),
        ["x-default", `/es${path}`],
      ]),
    },
    openGraph: { title, description, locale: ogLocale[lang], url: `/${lang}${path}` },
  };
}
