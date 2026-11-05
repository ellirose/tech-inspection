import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getExtra } from "@/i18n/extra";
import { faqCategories } from "@/content/faqs";
import { getFaqs, getSite } from "@/lib/data/content";
import { faqLd } from "@/lib/jsonld";
import { pageMeta } from "@/lib/metadata";
import { whatsappLink } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqList } from "@/components/faq/FaqList";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Eyebrow } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

export async function generateMetadata({ params }: PageProps<"/[lang]/preguntas-frecuentes">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const x = getExtra(lang).faq;
  return pageMeta(lang, "/preguntas-frecuentes", x.title, x.lead);
}

/** The FAQ hub (design document §8.9): every question, grouped by category, with FAQPage markup. */
export default async function FaqPage({ params }: PageProps<"/[lang]/preguntas-frecuentes">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const x = getExtra(lang);
  const [faqs, { company }] = await Promise.all([getFaqs(), getSite()]);
  const groups = faqCategories.map((c) => ({ key: c, items: faqs.filter((f) => f.category === c) })).filter((g) => g.items.length);

  return (
    <>
      <JsonLd data={faqLd(lang, faqs)} />
      <PageHero crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: x.nav.faq }]} eyebrow={x.faq.eyebrow} title={x.faq.title} lead={x.faq.lead}>
        <nav aria-label={x.faq.title} className="mt-8 flex flex-wrap gap-2">
          {groups.map((g) => (
            <a key={g.key} href={`#${g.key}`} className="rounded-full bg-surface-2 px-4 py-2 text-[0.95rem] font-bold text-ink-soft ring-1 ring-line transition hover:text-ink hover:ring-neon/40">
              {x.faq.categories[g.key]}
            </a>
          ))}
        </nav>
      </PageHero>

      <section className="pb-20 sm:pb-28">
        <Container className="space-y-14">
          {groups.map((g, i) => (
            <div key={g.key} id={g.key} className="scroll-mt-28 grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2>
                  <Eyebrow index={String(i + 1).padStart(2, "0")}>{x.faq.categories[g.key]}</Eyebrow>
                </h2>
              </div>
              <div className="lg:col-span-8">
                <FaqList items={g.items} lang={lang} />
              </div>
            </div>
          ))}
        </Container>
      </section>

      <section className="band py-20">
        <Container className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{x.faq.askTitle}</h2>
            <p className="mt-3 text-lg leading-relaxed text-ink-soft">{x.faq.askLead}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={whatsappLink(company.whatsapp, d.quote.waIntro)} variant="whatsapp">
              WhatsApp
            </ButtonLink>
            <ButtonLink href={`/${lang}/cotizar`}>{x.nav.quote}</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
