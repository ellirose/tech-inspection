import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react/ssr";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { serviceBySlug, services } from "@/content/services";
import { methodByKey, methodTone } from "@/content/methods";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Eyebrow } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MethodGlyph, ServiceGlyph } from "@/components/ui/Icons";
import { CtaBand } from "@/components/ui/CtaBand";
import { cn } from "@/lib/cn";

export async function generateStaticParams() {
  return locales.flatMap((lang) => services.map((s) => ({ lang, slug: s.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/servicios/[slug]">) {
  const { lang, slug } = await params;
  const s = serviceBySlug(slug);
  if (!hasLocale(lang) || !s) return {};
  return pageMeta(lang, `/servicios/${slug}`, s.name[lang], s.short[lang]);
}

// Params are awaited inside <Suspense> so navigations into this route stay instant.
export default function ServicePage({ params }: PageProps<"/[lang]/servicios/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <ServicePageContent params={params} />
    </Suspense>
  );
}

async function ServicePageContent({ params }: Pick<PageProps<"/[lang]/servicios/[slug]">, "params">) {
  const { lang, slug } = await params;
  const s = serviceBySlug(slug);
  if (!hasLocale(lang) || !s) notFound();
  const d = getDictionary(lang);
  const others = services.filter((x) => x.slug !== s.slug);

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: d.nav.services, href: `/${lang}/servicios` }, { label: s.name[lang] }]}
        eyebrow={d.servicesSection.eyebrow}
        title={s.name[lang]}
        lead={s.short[lang]}
        image={s.image}
      >
        <span className="mt-8 grid size-20 place-items-center bg-brand-700 text-white shape-hex">
          <ServiceGlyph name={s.icon} className="size-10" />
        </span>
      </PageHero>

      <Container className="grid gap-10 pb-20 lg:grid-cols-12">
        <Reveal className="space-y-5 lg:col-span-7">
          <p className="font-display text-[clamp(1.6rem,2.4vw,2.2rem)] font-bold leading-snug tracking-tight text-ink">{s.body[0][lang]}</p>
          <p className="text-lg leading-relaxed text-ink-soft">{s.body[1][lang]}</p>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-5">
          <div className="rounded-[2.5rem] rounded-tr-[6rem] bg-white p-7 shadow-lift ring-1 ring-line sm:p-9">
            <Eyebrow>{d.servicesSection.scope}</Eyebrow>
            <ul className="mt-6 space-y-3">
              {s.scope[lang].map((x) => (
                <li key={x} className="flex items-center gap-3 text-lg font-semibold text-ink">
                  <CheckCircle weight="duotone" className="size-7 shrink-0 text-brand-600" /> {x}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>

      <section className="relative bg-white py-20">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-60 mask-fade-y" />
        <Container className="relative">
          <Eyebrow>{d.servicesSection.methodsUsed}</Eyebrow>
          <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {s.methods.map((k) => {
              const m = methodByKey(k);
              return (
                <RevealItem key={k}>
                  <Link href={`/${lang}/metodos/${m.slug}`} className="group flex h-full flex-col rounded-[2rem] bg-canvas p-6 ring-1 ring-line transition hover:-translate-y-1 hover:shadow-lift">
                    <div className="flex items-center justify-between">
                      <span className={cn("grid size-16 place-items-center rounded-2xl", methodTone[k].soft, methodTone[k].text)}>
                        <MethodGlyph name={k} className="size-9" />
                      </span>
                      <span className="font-mono text-sm font-bold" style={{ color: methodTone[k].hex }}>
                        {m.code}
                      </span>
                    </div>
                    <p className="mt-5 font-display text-xl font-bold text-ink">{m.name[lang]}</p>
                    <p className="mt-2 line-clamp-3 text-ink-soft">{m.tagline[lang]}</p>
                    <ArrowUpRight weight="bold" className="mt-auto size-6 pt-4 text-brand-700 transition group-hover:rotate-45" />
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </Container>
      </section>

      <Container className="py-16">
        <h2 className="font-display text-xl font-bold text-mute">{d.pages.services.others}</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          {others.map((o) => (
            <Link key={o.slug} href={`/${lang}/servicios/${o.slug}`} className="group inline-flex items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 font-display text-[1.05rem] font-bold text-ink shadow-soft ring-1 ring-line transition hover:bg-brand-700 hover:text-white">
              <span className="grid size-10 place-items-center rounded-full bg-brand-50 text-brand-700">
                <ServiceGlyph name={o.icon} className="size-6" />
              </span>
              {o.name[lang]}
            </Link>
          ))}
        </div>
      </Container>
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
