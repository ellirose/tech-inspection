// Structured data builders (design document §16.2): Organization/ProfessionalService site-wide, WebSite on
// the home page, BreadcrumbList on every inner page (from the page hero's breadcrumb), Service on service
// pages and FAQPage wherever questions are shown. Plain functions so they can be unit tested.
import { htmlLang, type L10n, type Locale } from "@/i18n/config";
import { SITE_URL } from "./site";

type Json = Record<string, unknown>;

export const ORG_ID = `${SITE_URL}/#organization`;
const abs = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

export function organizationLd(input: {
  lang: Locale;
  company: { name: string; short: string; address: string; phone: string; email: string };
  founded: number;
  methods: string[];
  certifications: { code: string; title: string; certifier?: string }[];
}): Json {
  const { lang, company } = input;
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: company.short,
    legalName: company.name,
    url: `${SITE_URL}/${lang}`,
    logo: abs("/media/brand/logo.png"),
    image: abs(`/${lang}/opengraph-image`),
    telephone: company.phone,
    email: company.email,
    foundingDate: String(input.founded),
    address: { "@type": "PostalAddress", streetAddress: company.address, addressRegion: "Cundinamarca", addressCountry: "CO" },
    areaServed: { "@type": "Country", name: "Colombia" },
    knowsAbout: input.methods,
    hasCredential: input.certifications.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      name: `${c.code} · ${c.title}`,
      credentialCategory: "certification",
      ...(c.certifier ? { recognizedBy: { "@type": "Organization", name: c.certifier } } : {}),
    })),
  };
}

export function websiteLd(lang: Locale, name: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: `${SITE_URL}/${lang}`,
    inLanguage: htmlLang[lang],
    publisher: { "@id": ORG_ID },
  };
}

/** The last crumb (the current page) may have no link: Google takes it as the page itself. */
export function breadcrumbLd(crumbs: { label: string; href?: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, ...(c.href ? { item: abs(c.href) } : {}) })),
  };
}

export function serviceLd(input: { lang: Locale; path: string; name: string; description: string; category?: string }): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    serviceType: input.category ?? input.name,
    description: input.description,
    url: abs(`/${input.lang}${input.path}`),
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "Colombia" },
  };
}

export function faqLd(lang: Locale, items: { question: L10n; answer: L10n }[]): Json | null {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.question[lang], acceptedAnswer: { "@type": "Answer", text: f.answer[lang] } })),
  };
}

/** Serialised for a <script> tag: "<" escaped so text can never close the tag. */
export const ldScript = (data: Json | Json[]) => JSON.stringify(data).replace(/</g, "\\u003c");
