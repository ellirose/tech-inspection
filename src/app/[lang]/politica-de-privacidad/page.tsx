import { notFound } from "next/navigation";
import { FilePdf } from "@phosphor-icons/react/ssr";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getExtra, LEGAL_UPDATED } from "@/i18n/extra";
import { getDocuments, getSite } from "@/lib/data/content";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { LegalBody } from "@/components/legal/LegalPage";

export async function generateMetadata({ params }: PageProps<"/[lang]/politica-de-privacidad">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const x = getExtra(lang).privacy;
  return pageMeta(lang, "/politica-de-privacidad", x.title, x.lead);
}

/** Privacy policy for the website (Ley 1581 de 2012), summarising PL-09 and adding what the site itself does. */
export default async function PrivacyPage({ params }: PageProps<"/[lang]/politica-de-privacidad">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const x = getExtra(lang);
  const [{ company }, policies] = await Promise.all([getSite(), getDocuments("policy")]);
  const pdf = policies.find((p) => p.code.startsWith("PL-09"));

  return (
    <>
      <PageHero crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: x.nav.privacy }]} eyebrow={x.nav.legal} title={x.privacy.title} lead={x.privacy.lead} />
      <LegalBody lang={lang} sections={x.privacy.sections} updatedLabel={x.privacy.updated} updated={LEGAL_UPDATED}>
        <div className="mt-6 rounded-2xl bg-tint p-5 ring-1 ring-neon/20">
          <p className="font-bold text-ink">{x.privacy.controller}</p>
          <p className="mt-1 text-ink-soft">
            {company.name} · {company.address}
          </p>
          <p className="mt-1 text-ink-soft">
            {x.privacy.contact}{" "}
            <a href={`mailto:${company.email}`} className="font-bold text-accent underline-offset-4 hover:underline">
              {company.email}
            </a>
          </p>
          {pdf && (
            <a href={pdf.file} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-2 font-bold text-accent underline-offset-4 hover:underline">
              <FilePdf weight="bold" className="size-5" /> {x.privacy.fullPolicy}
            </a>
          )}
        </div>
      </LegalBody>
    </>
  );
}
