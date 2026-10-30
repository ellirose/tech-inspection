import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { LevelTwo } from "@/components/home/LevelTwo";
import { MethodsApplied } from "@/components/home/MethodsApplied";
import { Process } from "@/components/home/Process";
import { Standards } from "@/components/home/Standards";
import { CtaBand } from "@/components/ui/CtaBand";

export async function generateMetadata({ params }: PageProps<"/[lang]/metodos">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta(lang, "/metodos", d.nav.methods, d.pages.methods.lead);
}

export default async function MethodsPage({ params }: PageProps<"/[lang]/metodos">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: d.nav.methods }]}
        eyebrow={d.methodsSection.eyebrow}
        title={d.pages.methods.title}
        lead={d.pages.methods.lead}
        image="/media/deck/ut-inspector.jpg"
        imagePosition="60% 35%"
        caption="UT · ASNT Nivel II"
      />
      <MethodsApplied lang={lang} dict={d} index="01" />
      <LevelTwo lang={lang} dict={d} index="02" />
      <Process lang={lang} index="03" />
      <Standards lang={lang} index="04" />
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
