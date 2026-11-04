import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { brochures } from "@/content/brochures";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { CtaBand } from "@/components/ui/CtaBand";
import { BrochureViewer } from "@/components/media/BrochureViewer";

const pad = (n: number) => String(n).padStart(2, "0");

export async function generateMetadata({ params }: PageProps<"/[lang]/portafolio">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta(lang, "/portafolio", d.nav.portfolio, d.pages.portfolio.lead);
}

/** The client's sales decks as an on-site brochure: browse page by page, or download the PDF. */
export default async function PortfolioPage({ params }: PageProps<"/[lang]/portafolio">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const t = d.pages.portfolio;

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: d.nav.portfolio }]}
        eyebrow={d.nav.portfolio}
        title={t.title}
        lead={t.lead}
        image="/media/deck/pdc-bit.jpg"
        caption="NDT · QA/QC"
      >
        <ButtonLink href="#brochure" className="mt-8">
          {t.cta}
        </ButtonLink>
      </PageHero>

      <section id="brochure" className="scroll-mt-28 py-16 sm:py-24">
        <Container>
          <Reveal>
            <BrochureViewer
              t={{ pages: t.pages, page: t.page, download: t.download, share: t.share, copied: t.copied, contents: t.contents, prev: t.prev, next: t.next, fullscreen: t.fullscreen }}
              brochures={brochures.map((b) => ({
                key: b.key,
                name: b.name[lang],
                tagline: b.tagline[lang],
                pdf: b.pdf,
                pdfMb: b.pdfMb,
                pages: b.pages.map((pg, i) => ({
                  title: pg.title[lang],
                  summary: pg.summary[lang],
                  src: `/media/brochure/${b.key}/p-${pad(i + 1)}.webp`,
                  thumb: `/media/brochure/${b.key}/t-${pad(i + 1)}.webp`,
                })),
              }))}
            />
          </Reveal>
        </Container>
      </section>

      <CtaBand lang={lang} dict={d} />
    </>
  );
}
