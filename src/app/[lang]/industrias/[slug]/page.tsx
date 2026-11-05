import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react/ssr";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getExtra } from "@/i18n/extra";
import { getCases, getIndustries, getMethods, getServices } from "@/lib/data/content";
import { serviceLd } from "@/lib/jsonld";
import { pageMeta } from "@/lib/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Eyebrow } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MethodGlyph, ServiceGlyph } from "@/components/ui/Icons";
import { CtaBand } from "@/components/ui/CtaBand";

export async function generateStaticParams() {
  const industries = await getIndustries();
  return locales.flatMap((lang) => industries.map((i) => ({ lang, slug: i.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/industrias/[slug]">) {
  const { lang, slug } = await params;
  const ind = (await getIndustries()).find((i) => i.slug === slug);
  if (!hasLocale(lang) || !ind) return {};
  return pageMeta(lang, `/industrias/${slug}`, ind.seo.title?.[lang] || ind.name[lang], ind.seo.description?.[lang] || ind.intro[lang]);
}

// Params are awaited inside <Suspense> so navigations into this route stay instant.
export default function IndustryPage({ params }: PageProps<"/[lang]/industrias/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <IndustryPageContent params={params} />
    </Suspense>
  );
}

async function IndustryPageContent({ params }: Pick<PageProps<"/[lang]/industrias/[slug]">, "params">) {
  const { lang, slug } = await params;
  const [industries, services, methods, cases] = await Promise.all([getIndustries(), getServices(), getMethods(), getCases()]);
  const ind = industries.find((i) => i.slug === slug);
  if (!hasLocale(lang) || !ind) notFound();
  const d = getDictionary(lang);
  const x = getExtra(lang);
  const own = ind.services.map((s) => services.find((v) => v.slug === s)).filter((v) => v !== undefined);
  const usedMethods = methods.filter((m) => ind.methods.includes(m.key));
  const related = cases.filter((c) => c.industries.includes(ind.slug));
  const others = industries.filter((i) => i.slug !== ind.slug);

  return (
    <>
      <JsonLd data={serviceLd({ lang, path: `/industrias/${ind.slug}`, name: ind.name[lang], description: ind.intro[lang] })} />
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: x.nav.industries, href: `/${lang}/industrias` }, { label: ind.name[lang] }]}
        eyebrow={x.industries.eyebrow}
        title={ind.name[lang]}
        lead={ind.intro[lang]}
        image={ind.image ?? undefined}
      />

      <section className="band py-20 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2>
              <Eyebrow index="01">{x.industries.componentsTitle}</Eyebrow>
            </h2>
            <ul className="mt-8 space-y-3">
              {ind.components[lang].map((c) => (
                <li key={c} className="flex items-start gap-3 text-lg font-semibold text-ink">
                  <CheckCircle weight="fill" className="mt-0.5 size-6 shrink-0 text-neon" /> {c}
                </li>
              ))}
            </ul>
          </div>
          {usedMethods.length > 0 && (
            <div className="lg:col-span-7">
              <h2>
                <Eyebrow index="02">{x.industries.methodsTitle}</Eyebrow>
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {usedMethods.map((m) => (
                  <Link key={m.key} href={`/${lang}/metodos/${m.slug}`} className="group flex items-center gap-4 rounded-[1.75rem] bg-surface p-5 shadow-soft ring-1 ring-line transition hover:ring-neon/40">
                    <MethodGlyph name={m.key} className="size-10 shrink-0 text-neon" />
                    <span>
                      <span className="block font-mono text-xs font-bold text-mute">{m.code}</span>
                      <span className="block text-lg font-extrabold leading-tight text-ink">{m.name[lang]}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>

      {own.length > 0 && (
        <section className="py-20 sm:py-24">
          <Container>
            <h2>
              <Eyebrow index="03">{x.industries.servicesTitle}</Eyebrow>
            </h2>
            <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {own.map((s) => (
                <RevealItem key={s.slug}>
                  <Link href={`/${lang}/servicios/${s.slug}`} className="group flex h-full flex-col rounded-[2rem] bg-surface p-7 shadow-card ring-1 ring-line transition hover:ring-neon/40">
                    <ServiceGlyph name={s.icon} className="size-11 text-neon" />
                    <h3 className="mt-5 text-xl font-extrabold leading-tight tracking-tight text-ink">{s.name[lang]}</h3>
                    <p className="mt-2 flex-1 leading-relaxed text-ink-soft">{s.short[lang]}</p>
                    <ArrowRight weight="bold" className="mt-5 size-5 text-accent transition group-hover:translate-x-1" />
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </Container>
        </section>
      )}

      {related.length > 0 && (
        <section className="band py-20">
          <Container>
            <h2>
              <Eyebrow index="04">{x.industries.casesTitle}</Eyebrow>
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {related.map((c) => (
                <Link key={c.slug} href={`/${lang}/clientes/${c.slug}`} className="rounded-[2rem] bg-surface p-7 shadow-card ring-1 ring-line transition hover:ring-neon/40">
                  <h3 className="text-xl font-extrabold text-ink">{c.title[lang]}</h3>
                  <p className="mt-2 line-clamp-3 text-ink-soft">{c.challenge[lang]}</p>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {others.length > 0 && (
        <section className="py-16">
          <Container>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-mute">{x.industries.others}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {others.map((o) => (
                <Link key={o.slug} href={`/${lang}/industrias/${o.slug}`} className="rounded-full bg-surface-2 px-5 py-2.5 font-bold text-ink-soft ring-1 ring-line transition hover:text-ink hover:ring-neon/40">
                  {o.name[lang]}
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
