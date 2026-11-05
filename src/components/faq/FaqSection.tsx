import type { Locale } from "@/i18n/config";
import { getExtra } from "@/i18n/extra";
import type { FaqItem } from "@/lib/data/content";
import { faqLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { FaqList } from "./FaqList";

/** A block of questions on a home, method or service page, with its FAQPage markup and a link to all of them. */
export function FaqSection({ lang, items, index, title, className }: { lang: Locale; items: FaqItem[]; index?: string; title?: string; className?: string }) {
  if (!items.length) return null;
  const x = getExtra(lang).faq;
  return (
    <section className={cn("py-20 sm:py-28", className)}>
      <JsonLd data={faqLd(lang, items)} />
      <Container className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading index={index} eyebrow={x.eyebrow} title={title ?? x.sectionTitle} align="stack" />
          <ButtonLink href={`/${lang}/preguntas-frecuentes`} variant="ghost" className="mt-8">
            {x.seeAll}
          </ButtonLink>
        </div>
        <div className="lg:col-span-8">
          <FaqList items={items} lang={lang} />
        </div>
      </Container>
    </section>
  );
}
