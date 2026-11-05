import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getExtra, LEGAL_UPDATED } from "@/i18n/extra";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { LegalBody } from "@/components/legal/LegalPage";

export async function generateMetadata({ params }: PageProps<"/[lang]/terminos">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const x = getExtra(lang).terms;
  return pageMeta(lang, "/terminos", x.title, x.lead);
}

export default async function TermsPage({ params }: PageProps<"/[lang]/terminos">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const x = getExtra(lang);

  return (
    <>
      <PageHero crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: x.nav.terms }]} eyebrow={x.nav.legal} title={x.terms.title} lead={x.terms.lead} />
      <LegalBody lang={lang} sections={x.terms.sections} updatedLabel={x.terms.updated} updated={LEGAL_UPDATED} />
    </>
  );
}
