import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { home } from "@/content/home";
import { HomeHero } from "@/components/home/HomeHero";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { Methods } from "@/components/home/Methods";
import { ProcessBand } from "@/components/home/ProcessBand";
import { WhyUs } from "@/components/home/WhyUs";
import { PlatformShowcase } from "@/components/home/PlatformShowcase";
import { FieldGallery } from "@/components/home/FieldGallery";
import { QuoteSection } from "@/components/quote/QuoteSection";

// One idea per section: promise → what we inspect → how (methods, process) → why trust us → digital record → field → quote.
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <HomeHero lang={lang} dict={dict} />
      <ServicesGrid lang={lang} dict={dict} />
      <Methods lang={lang} dict={dict} />
      <ProcessBand lang={lang} />
      <WhyUs lang={lang} dict={dict} className="sheet" />
      <PlatformShowcase lang={lang} dict={dict} compact title={home.platform.title[lang]} />
      <FieldGallery dict={dict} />
      <QuoteSection lang={lang} dict={dict} className="sheet bg-surface" />
    </>
  );
}
