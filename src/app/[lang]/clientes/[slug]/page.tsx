import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle } from "@phosphor-icons/react/ssr";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getExtra } from "@/i18n/extra";
import { getCases, getServices } from "@/lib/data/content";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Eyebrow } from "@/components/ui/Section";
import { CtaBand } from "@/components/ui/CtaBand";

export async function generateStaticParams() {
  const cases = await getCases();
  // At least one entry: with no published cases yet the route still builds (and answers 404).
  const slugs = cases.length ? cases.map((c) => c.slug) : ["_"];
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/clientes/[slug]">) {
  const { lang, slug } = await params;
  const c = (await getCases()).find((x) => x.slug === slug);
  if (!hasLocale(lang) || !c) return {};
  return pageMeta(lang, `/clientes/${slug}`, c.title[lang], c.challenge[lang].slice(0, 160));
}

export default function CasePage({ params }: PageProps<"/[lang]/clientes/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <CasePageContent params={params} />
    </Suspense>
  );
}

/** One case study: challenge, solution, results, photos and the services involved. */
async function CasePageContent({ params }: Pick<PageProps<"/[lang]/clientes/[slug]">, "params">) {
  const { lang, slug } = await params;
  const [cases, services] = await Promise.all([getCases(), getServices()]);
  const c = cases.find((x) => x.slug === slug);
  if (!hasLocale(lang) || !c) notFound();
  const d = getDictionary(lang);
  const x = getExtra(lang);
  const used = services.filter((s) => c.services.includes(s.slug));
  const outcomes = c.outcomes?.[lang] ?? [];

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: x.nav.clients, href: `/${lang}/clientes` }, { label: c.title[lang] }]}
        eyebrow={[c.clientName, c.sector?.[lang]].filter(Boolean).join(" · ") || x.clients.casesTitle}
        title={c.title[lang]}
        image={c.images[0]}
      />
      <section className="band py-20 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2>
              <Eyebrow index="01">{x.clients.challenge}</Eyebrow>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">{c.challenge[lang]}</p>
          </div>
          <div>
            <h2>
              <Eyebrow index="02">{x.clients.solution}</Eyebrow>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">{c.solution[lang]}</p>
          </div>
        </Container>
      </section>
      {(outcomes.length > 0 || used.length > 0) && (
        <section className="py-20">
          <Container className="grid gap-10 lg:grid-cols-2">
            {outcomes.length > 0 && (
              <div>
                <h2>
                  <Eyebrow index="03">{x.clients.outcomes}</Eyebrow>
                </h2>
                <ul className="mt-6 space-y-3">
                  {outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-3 text-lg font-semibold text-ink">
                      <CheckCircle weight="fill" className="mt-0.5 size-6 shrink-0 text-neon" /> {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {used.length > 0 && (
              <div>
                <h2>
                  <Eyebrow index="04">{x.clients.servicesUsed}</Eyebrow>
                </h2>
                <div className="mt-6 flex flex-wrap gap-3">
                  {used.map((s) => (
                    <Link key={s.slug} href={`/${lang}/servicios/${s.slug}`} className="rounded-full bg-surface-2 px-5 py-2.5 font-bold text-ink-soft ring-1 ring-line transition hover:text-ink hover:ring-neon/40">
                      {s.name[lang]}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Container>
        </section>
      )}
      {c.images.length > 1 && (
        <section className="pb-20">
          <Container className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.images.slice(1).map((src) => (
              <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] ring-1 ring-line">
                <Image src={src} alt={c.title[lang]} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              </div>
            ))}
          </Container>
        </section>
      )}
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
