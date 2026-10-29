import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { methods } from "@/content/methods";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { Experience } from "@/components/home/Experience";
import { MethodsScroll } from "@/components/home/MethodsScroll";
import { ServicesBento } from "@/components/home/ServicesBento";
import { FieldBand } from "@/components/home/FieldBand";
import { FieldGallery } from "@/components/home/FieldGallery";
import { Platform } from "@/components/home/Platform";
import { Certifications } from "@/components/home/Certifications";
import { Team } from "@/components/home/Team";
import { QuoteSection } from "@/components/quote/QuoteSection";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const methodCards = methods.map((m) => ({
    key: m.key,
    slug: m.slug,
    code: m.code,
    name: m.name[lang],
    tagline: m.tagline[lang],
    cover: m.cover,
    steps: m.steps.map((s) => ({ title: s.title[lang], text: s.text[lang] })),
    advantages: m.advantages[lang],
  }));

  return (
    <>
      <Hero lang={lang} dict={dict} />
      <TrustBar label={dict.trust.clients} />
      <Experience lang={lang} dict={dict} />
      <MethodsScroll lang={lang} dict={dict} items={methodCards} />
      <ServicesBento lang={lang} dict={dict} />
      <FieldBand dict={dict} />
      <FieldGallery dict={dict} />
      <Platform dict={dict} />
      <Certifications lang={lang} dict={dict} />
      <Team lang={lang} dict={dict} />
      <QuoteSection lang={lang} dict={dict} />
    </>
  );
}
