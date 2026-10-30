import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import { hasLocale, htmlLang, locales, ogLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { methods } from "@/content/methods";
import { services } from "@/content/services";
import { company, FOUNDED, PLATFORM_URL, SITE_URL } from "@/content/site";
import { Header, type NavData } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { SmoothScroll } from "@/components/layout/SmoothScroll";

const sans = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-jakarta", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

// Runs before paint: the saved choice wins, otherwise the system setting decides.
const themeScript = `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f7fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1d30" },
  ],
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
    foundingDate: String(FOUNDED),
    address: { "@type": "PostalAddress", streetAddress: company.address, addressCountry: "CO" },
    areaServed: "CO",
    knowsAbout: methods.map((m) => m.name.en),
  };

  return (
    <html lang={htmlLang[lang as Locale]} className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-svh overflow-x-clip">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SmoothScroll>
          <Header data={navData} theme={dict.ui.theme} />
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
