import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { WhyBit } from "@/components/home/WhyBit";
import { CtaBand } from "@/components/ui/CtaBand";

export async function generateMetadata({ params }: PageProps<"/[lang]/servicios">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta(lang, "/servicios", d.nav.services, d.pages.services.lead);
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/servicios">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: d.nav.services }]}
        eyebrow={d.servicesSection.eyebrow}
        title={d.pages.services.title}
        lead={d.pages.services.lead}
        image="/media/photos/workshop-team.jpg"
        video="/media/video/welding-loop.mp4"
        caption={d.ui.services}
      />
      <ServicesGrid lang={lang} dict={d} heading={false} />
      <WhyBit lang={lang} dict={d} index="DS-1" />
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
