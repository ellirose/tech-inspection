import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getExtra } from "@/i18n/extra";
import { getIndustries } from "@/lib/data/content";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { CtaBand } from "@/components/ui/CtaBand";

export async function generateMetadata({ params }: PageProps<"/[lang]/industrias">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const x = getExtra(lang).industries;
  return pageMeta(lang, "/industrias", x.title, x.lead);
}

/** Industries served, each with what we inspect for it and a link to its page. */
export default async function IndustriesPage({ params }: PageProps<"/[lang]/industrias">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const x = getExtra(lang);
  const industries = await getIndustries();

  return (
    <>
      <PageHero crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: x.nav.industries }]} eyebrow={x.industries.eyebrow} title={x.industries.title} lead={x.industries.lead} />
      <section className="pb-20 sm:pb-28">
        <Container>
          <RevealGroup className="grid gap-6 md:grid-cols-2">
            {industries.map((ind) => (
              <RevealItem key={ind.slug}>
                <Link href={`/${lang}/industrias/${ind.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[2.25rem] bg-surface shadow-card ring-1 ring-line transition hover:ring-neon/40">
                  {ind.image && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image src={ind.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-7">
                    <h2 className="text-2xl font-extrabold tracking-tight text-ink">{ind.name[lang]}</h2>
                    <p className="mt-3 flex-1 text-[1.05rem] leading-relaxed text-ink-soft">{ind.intro[lang]}</p>
                    <span className="mt-6 inline-flex items-center gap-2 font-bold text-accent">
                      {x.industries.more} <ArrowRight weight="bold" className="size-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
