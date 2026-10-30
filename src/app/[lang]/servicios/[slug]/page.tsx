import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react/ssr";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { serviceBySlug, services } from "@/content/services";
import { methodByKey, type MethodKey } from "@/content/methods";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Eyebrow } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MethodGlyph, ServiceGlyph } from "@/components/ui/Icons";
import { CtaBand } from "@/components/ui/CtaBand";
import { Showcase } from "@/components/media/Showcase";
import { WhyBit } from "@/components/home/WhyBit";
import { Standards } from "@/components/home/Standards";
import { photos } from "@/lib/media";
import { cn } from "@/lib/cn";

const tile: Record<MethodKey, string> = {
  vt: "bg-vt text-[#071a2e]",
  mt: "bg-mt text-[#071a2e]",
  pt: "bg-pt text-white",
  ut: "bg-ut text-[#071a2e]",
};

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
  const bits = s.slug === "brocas";

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: d.nav.services, href: `/${lang}/servicios` }, { label: s.name[lang] }]}
        eyebrow={d.servicesSection.eyebrow}
        title={s.name[lang]}
        lead={s.short[lang]}
        image={s.image}
        caption={s.methods.map((k) => methodByKey(k).code).join(" · ")}
      >
        <span className="mt-8 grid size-20 place-items-center rounded-3xl bg-brand-600 text-white shadow-float dark:bg-neon dark:text-[#071a2e]">
          <ServiceGlyph name={s.icon} className="size-11" />
        </span>
      </PageHero>

      <section className="bg-surface py-20 sm:py-28">
        <Container className="grid gap-10 lg:grid-cols-12">
          <Reveal className="space-y-5 lg:col-span-7">
            <Eyebrow index="01">{s.name[lang]}</Eyebrow>
            <p className="text-balance text-[clamp(1.6rem,2.4vw,2.2rem)] font-extrabold leading-snug tracking-[-0.02em] text-ink">{s.body[0][lang]}</p>
            <p className="text-lg leading-relaxed text-ink-soft sm:text-xl">{s.body[1][lang]}</p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-[2.5rem] rounded-tr-[5rem] bg-brand-600 p-8 text-white shadow-float sm:p-10 dark:bg-brand-700">
              <div className="pointer-events-none absolute inset-0 bg-network opacity-40" />
              <p className="relative text-xl font-extrabold">{d.servicesSection.scope}</p>
              <ul className="relative mt-6 space-y-3">
                {s.scope[lang].map((x) => (
                  <li key={x} className="flex items-center gap-3 text-lg font-bold">
                    <CheckCircle weight="fill" className="size-7 shrink-0 text-lime" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <Eyebrow index="02">{d.pages.services.gallery}</Eyebrow>
          <Reveal className="mt-8">
            <Showcase items={photos(s.gallery.filter((g) => g !== s.image))} alt={s.name[lang]} />
          </Reveal>
        </Container>
      </section>

      {bits && <WhyBit lang={lang} dict={d} index="03" link={false} />}

      <section className="bg-tint py-20 sm:py-28">
        <Container>
          <Eyebrow index={bits ? "04" : "03"}>{d.servicesSection.methodsUsed}</Eyebrow>
          <RevealGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
            {s.methods.map((k, i) => {
              const m = methodByKey(k);
              return (
                <RevealItem key={k}>
                  <Link href={`/${lang}/metodos/${m.slug}`} className={cn("group flex h-full flex-col bg-surface p-6 shadow-soft ring-1 ring-line transition hover:-translate-y-1 hover:shadow-card", i % 2 ? "rounded-[2rem] rounded-tr-[4rem]" : "rounded-[2rem]")}>
                    <div className="flex items-center justify-between">
                      <span className={cn("grid size-16 place-items-center rounded-2xl", tile[k])}>
                        <MethodGlyph name={k} className="size-9" />
                      </span>
                      <span className="font-mono text-lg font-bold text-mute">{m.code}</span>
                    </div>
                    <p className="mt-5 text-xl font-extrabold tracking-tight text-ink">{m.name[lang]}</p>
                    <p className="mt-2 line-clamp-3 text-ink-soft">{m.tagline[lang]}</p>
                    <ArrowUpRight weight="bold" className="mt-auto size-6 pt-4 text-accent transition group-hover:rotate-45" />
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </Container>
      </section>

      {bits && <Standards lang={lang} index="05" />}

      <section className="py-16">
        <Container>
          <h2 className="text-xl font-extrabold text-mute">{d.pages.services.others}</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {others.map((o) => (
              <Link key={o.slug} href={`/${lang}/servicios/${o.slug}`} className="group inline-flex items-center gap-3 rounded-full bg-surface py-2 pl-2 pr-5 text-[1.05rem] font-bold text-ink shadow-soft ring-1 ring-line transition hover:bg-brand-600 hover:text-white">
                <span className="grid size-11 place-items-center rounded-full bg-tint text-accent">
                  <ServiceGlyph name={o.icon} className="size-6" />
                </span>
                {o.name[lang]}
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
