import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { HomeHero } from "@/components/home/HomeHero";
import { Credentials } from "@/components/home/Credentials";
import { LevelTwo } from "@/components/home/LevelTwo";
import { WhyBit } from "@/components/home/WhyBit";
import { MethodsApplied } from "@/components/home/MethodsApplied";
import { Process } from "@/components/home/Process";
import { Standards } from "@/components/home/Standards";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { Partner } from "@/components/home/Partner";
import { PlatformShowcase } from "@/components/home/PlatformShowcase";
import { FieldGallery } from "@/components/home/FieldGallery";
import { Closing } from "@/components/home/Closing";
import { Clients } from "@/components/home/Clients";
import { QuoteSection } from "@/components/quote/QuoteSection";

// Follows the order of the client deck: cover, who we are, Level II, bits, methods, process, standards,
// services, partnership, TI-QMS, field record, closing.
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <HomeHero lang={lang} dict={dict} />
      <Credentials lang={lang} dict={dict} index="01" />
      <LevelTwo lang={lang} dict={dict} index="02" />
      <WhyBit lang={lang} dict={dict} index="03" />
      <MethodsApplied lang={lang} dict={dict} index="04" />
      <Process lang={lang} index="05" />
      <Standards lang={lang} index="06" />
      <ServicesGrid lang={lang} dict={dict} index="07" />
      <Partner lang={lang} dict={dict} index="08" />
      <PlatformShowcase lang={lang} dict={dict} index="09" />
      <FieldGallery dict={dict} index="10" />
      <Closing lang={lang} index="11" />
      <Clients lang={lang} dict={dict} />
      <QuoteSection lang={lang} dict={dict} index="12" />
    </>
  );
}
