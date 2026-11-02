import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSite } from "@/lib/data/content";
import { pageMeta } from "@/lib/metadata";
import { Container } from "@/components/ui/Section";
import { ThanksPanel } from "@/components/quote/ThanksPanel";

// Confirmation page after a quote request: the conversion URL for analytics (stage 7). Not indexed.
export async function generateMetadata({ params }: PageProps<"/[lang]/gracias">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const q = getDictionary(lang).quote;
  return { ...pageMeta(lang, "/gracias", q.successTitle, q.successText), robots: { index: false, follow: true } };
}

export default async function ThanksPage({ params }: PageProps<"/[lang]/gracias">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const q = getDictionary(lang).quote;
  const { company } = await getSite();

  return (
    <section className="relative isolate flex min-h-[85svh] items-center overflow-hidden pb-24 pt-36">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-blueprint mask-radial" />
      <Container className="max-w-3xl">
        <ThanksPanel
          lang={lang}
          t={{ successTitle: q.successTitle, successText: q.successText, continueWa: q.continueWa, newRequest: q.newRequest, reference: q.reference, emailSent: q.emailSent, backHome: q.backHome, waIntro: q.waIntro }}
          whatsapp={company.whatsapp}
        />
      </Container>
    </section>
  );
}
