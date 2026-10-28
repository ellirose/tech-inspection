import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Bricolage_Grotesque, JetBrains_Mono, Manrope } from "next/font/google";
import "../globals.css";
import { hasLocale, htmlLang, locales, ogLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { methods } from "@/content/methods";
import { services } from "@/content/services";
import { company, PLATFORM_URL, SITE_URL } from "@/content/site";
import { Header, type NavData } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { SmoothScroll } from "@/components/layout/SmoothScroll";

const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-bricolage", display: "swap" });
const sans = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-manrope", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", weight: ["500", "700"] });

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#f6f8fc",
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
    foundingDate: "2017",
    address: { "@type": "PostalAddress", streetAddress: company.address, addressCountry: "CO" },
    areaServed: "CO",
    knowsAbout: methods.map((m) => m.name.en),
  };

  return (
    <html lang={htmlLang[lang as Locale]} className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-svh overflow-x-clip">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SmoothScroll>
          <Header data={navData} />
          <main>{children}</main>
          <Footer lang={lang} dict={dict} />
          <FloatingActions
            whatsappLabel={dict.cta.whatsapp}
            assistant={{
              lang,
              t: dict.chat,
              quantities: dict.quote.quantities,
              waIntro: dict.quote.waIntro,
              whatsapp: company.whatsapp,
              platformUrl: PLATFORM_URL,
              services: navData.services.map((s) => ({ slug: s.slug, name: s.name })),
              methods: navData.methods.map((m) => ({ key: m.key, slug: m.slug, name: m.name })),
            }}
          />
        </SmoothScroll>
      </body>
    </html>
  );
}
