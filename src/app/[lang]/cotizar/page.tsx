import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getExtra } from "@/i18n/extra";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { QuoteSection } from "@/components/quote/QuoteSection";

export async function generateMetadata({ params }: PageProps<"/[lang]/cotizar">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const x = getExtra(lang).quote;
  return pageMeta(lang, "/cotizar", x.title, x.lead);
}

/** The quote wizard on its own page (design document §7.1 /cotizar), for links and campaigns. */
export default async function QuotePage({ params }: PageProps<"/[lang]/cotizar">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const x = getExtra(lang);

  return (
    <>
      <PageHero crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: x.quote.title }]} eyebrow={x.nav.quote} title={x.quote.title} lead={x.quote.lead} />
      <QuoteSection lang={lang} dict={d} heading={false} className="pt-0" />
    </>
  );
}
