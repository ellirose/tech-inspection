export const locales = ["es", "pt", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const htmlLang: Record<Locale, string> = { es: "es-CO", pt: "pt-BR", en: "en" };
export const ogLocale: Record<Locale, string> = { es: "es_CO", pt: "pt_BR", en: "en_US" };

/** A string available in every supported language. */
export type L10n = Record<Locale, string>;
export type L10nList = Record<Locale, string[]>;

export const t = (value: L10n, lang: Locale) => value[lang];

/** Prefix an internal path with the active locale. */
export const href = (lang: Locale, path = "") => `/${lang}${path}`;
