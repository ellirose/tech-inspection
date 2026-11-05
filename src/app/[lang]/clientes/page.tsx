import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getExtra } from "@/i18n/extra";
import { getCases } from "@/lib/data/content";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container, SectionHeading } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Clients } from "@/components/home/Clients";
import { CtaBand } from "@/components/ui/CtaBand";

export async function generateMetadata({ params }: PageProps<"/[lang]/clientes">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const x = getExtra(lang).clients;
  return pageMeta(lang, "/clientes", x.title, x.lead);
}

/** Client logos (only those cleared for publication) and the case studies the clients have authorised. */
export default async function ClientsPage({ params }: PageProps<"/[lang]/clientes">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const x = getExtra(lang);
  const cases = await getCases();

  return (
    <>
      <PageHero crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: x.nav.clients }]} eyebrow={x.nav.clients} title={x.clients.title} lead={x.clients.lead} />
      <Clients lang={lang} dict={d} />
      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading index="01" eyebrow={x.clients.casesTitle} title={x.clients.casesTitle} lead={x.clients.casesLead} />
          {cases.length ? (
            <RevealGroup className="mt-12 grid gap-6 md:grid-cols-2">
              {cases.map((c) => (
                <RevealItem key={c.slug}>
                  <Link href={`/${lang}/clientes/${c.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[2.25rem] bg-surface shadow-card ring-1 ring-line transition hover:ring-neon/40">
                    {c.images[0] && (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image src={c.images[0]} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-7">
                      {(c.clientName || c.sector) && <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-mute">{[c.clientName, c.sector?.[lang]].filter(Boolean).join(" · ")}</p>}
                      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">{c.title[lang]}</h2>
                      <p className="mt-3 line-clamp-3 flex-1 leading-relaxed text-ink-soft">{c.challenge[lang]}</p>
                      <span className="mt-6 inline-flex items-center gap-2 font-bold text-accent">
                        {x.clients.read} <ArrowRight weight="bold" className="size-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <div className="mt-12 flex flex-col items-start gap-6 rounded-[2.25rem] bg-surface p-8 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-2xl text-lg leading-relaxed text-ink-soft">{x.clients.noCases}</p>
              <ButtonLink href={`/${lang}/servicios`} variant="ghost">
                {d.nav.services}
              </ButtonLink>
            </div>
          )}
        </Container>
      </section>
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
