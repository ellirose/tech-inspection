import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import { hasLocale, htmlLang, locales, ogLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getDocuments, getMethods, getServices, getSite } from "@/lib/data/content";
import { SITE_URL } from "@/lib/site";
import { Header, type NavData } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { LandingRecorder } from "@/components/leads/LandingRecorder";
import { PreviewBar } from "@/components/layout/PreviewBar";
import { SceneBackground } from "@/components/scene/SceneBackground";

const sans = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-jakarta", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#030a12",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: dict.meta.title, template: `%s | Tech-Inspection` },
    description: dict.meta.description,
    applicationName: "Tech-Inspection",
    alternates: {
      canonical: `/${lang}`,
      languages: { "es-CO": "/es", "pt-BR": "/pt", en: "/en", "x-default": "/es" },
    },
    openGraph: {
      type: "website",
      siteName: "Tech-Inspection S.A.S.",
      locale: ogLocale[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocale[l]),
      title: dict.meta.title,
      description: dict.meta.description,
    },
    twitter: { card: "summary_large_image", title: dict.meta.title, description: dict.meta.description },
    verification: { google: "t_Wm_e4kKF-xRY0wjO5PuNlfLst20byIAkwxDwcG4WA" },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const [site, methods, services, policyDocs, draft] = await Promise.all([getSite(), getMethods(), getServices(), getDocuments("policy"), draftMode()]);
  const { company } = site;

  const navData: NavData = {
    lang,
    nav: dict.nav,
    methods: methods.map((m) => ({ key: m.key, slug: m.slug, code: m.code, name: m.name[lang], tagline: m.tagline[lang] })),
    services: services.map((s) => ({ slug: s.slug, icon: s.icon, name: s.name[lang], short: s.short[lang] })),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: company.name,
    url: `${SITE_URL}/${lang}`,
    logo: `${SITE_URL}/media/brand/logo.png`,
    image: `${SITE_URL}/${lang}/opengraph-image`,
    telephone: company.phone,
    email: company.email,
    foundingDate: String(site.founded),
    address: { "@type": "PostalAddress", streetAddress: company.address, addressCountry: "CO" },
    areaServed: "CO",
    knowsAbout: methods.map((m) => m.name.en),
  };

  return (
    // Dark only: the fixed data-theme keeps every `dark:` style on.
    <html lang={htmlLang[lang as Locale]} data-theme="dark" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-svh overflow-x-clip">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SceneBackground />
        <SmoothScroll>
          <Header data={navData} />
          <main>{children}</main>
          <Footer lang={lang} dict={dict} />
          <FloatingActions
            whatsappLabel={dict.cta.whatsapp}
            // Read at build time: the chatbot needs ANTHROPIC_API_KEY both when the site is built and when it runs.
            ai={Boolean(process.env.ANTHROPIC_API_KEY)}
            assistant={{
              lang,
              t: dict.chat,
              quantities: dict.quote.quantities,
              waIntro: dict.quote.waIntro,
              whatsapp: company.whatsapp,
              phone: company.phone,
              phoneHref: company.phoneHref,
              quote: {
                quantities: dict.quote.quantities,
                locations: dict.quote.locations,
                urgencies: dict.quote.urgencies,
                unsure: dict.quote.unsure,
                consent: dict.quote.consent,
                consentLink: dict.quote.consentLink,
                captcha: dict.quote.captcha,
                invalid: dict.quote.invalid,
                rateLimited: dict.quote.rateLimited,
              },
              platformUrl: site.platformUrl,
              policyHref: policyDocs.find((d) => d.code === "PL-09-1")?.file ?? `/${lang}/hseq`,
              services: navData.services.map((s) => ({ slug: s.slug, name: s.name })),
              methods: navData.methods.map((m) => ({ key: m.key, slug: m.slug, name: m.name })),
            }}
          />
        </SmoothScroll>
        <LandingRecorder />
        {draft.isEnabled && <PreviewBar />}
      </body>
    </html>
  );
}
