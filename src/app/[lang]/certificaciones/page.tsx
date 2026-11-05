import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getExtra } from "@/i18n/extra";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Certifications } from "@/components/home/Certifications";
import { CtaBand } from "@/components/ui/CtaBand";

export async function generateMetadata({ params }: PageProps<"/[lang]/certificaciones">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const x = getExtra(lang).certifications;
  return pageMeta(lang, "/certificaciones", x.title, x.lead);
}

/** Management-system certifications (seals per the CCS manual) and personnel credentials, then the HSEQ documents. */
export default async function CertificationsPage({ params }: PageProps<"/[lang]/certificaciones">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const x = getExtra(lang);

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: x.nav.certifications }]}
        eyebrow={x.nav.certifications}
        title={x.certifications.title}
        lead={x.certifications.lead}
        image="/media/hseq/training-1.jpg"
        imagePosition="50% 40%"
      />
      <Certifications lang={lang} dict={d} index="01" />
      <section className="band py-20">
        <Container className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{x.certifications.docsTitle}</h2>
            <p className="mt-3 text-lg leading-relaxed text-ink-soft">{x.certifications.docsLead}</p>
          </div>
          <ButtonLink href={`/${lang}/hseq`}>{x.certifications.docsCta}</ButtonLink>
        </Container>
      </section>
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
