import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react/ssr";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { methodBySlug, methods, type MethodKey } from "@/content/methods";
import { services } from "@/content/services";
import { methodsApplied } from "@/content/deck";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Eyebrow } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MethodGlyph, ServiceGlyph } from "@/components/ui/Icons";
import { FieldMonitor } from "@/components/visuals/FieldMonitor";
import { Masonry } from "@/components/media/Masonry";
import { photos } from "@/lib/media";
import { CtaBand } from "@/components/ui/CtaBand";
import { cn } from "@/lib/cn";

const tone: Record<MethodKey, { tile: string; text: string; hex: string }> = {
  vt: { tile: "bg-vt text-[#0b1533]", text: "text-[#c47a00] dark:text-vt", hex: "#f5a524" },
  mt: { tile: "bg-mt text-[#0b1533]", text: "text-lime-deep dark:text-mt", hex: "#7ad62a" },
  pt: { tile: "bg-pt text-white", text: "text-pt", hex: "#ef3e57" },
  ut: { tile: "bg-ut text-[#0b1533]", text: "text-[#0784b8] dark:text-ut", hex: "#1fb3ee" },
};

export async function generateStaticParams() {
  return locales.flatMap((lang) => methods.map((m) => ({ lang, slug: m.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/metodos/[slug]">) {
  const { lang, slug } = await params;
  const m = methodBySlug(slug);
  if (!hasLocale(lang) || !m) return {};
  return pageMeta(lang, `/metodos/${slug}`, `${m.name[lang]} (${m.code})`, m.tagline[lang]);
}

// Params are awaited inside <Suspense> so navigations into this route stay instant.
export default function MethodPage({ params }: PageProps<"/[lang]/metodos/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <MethodPageContent params={params} />
    </Suspense>
  );
}

async function MethodPageContent({ params }: Pick<PageProps<"/[lang]/metodos/[slug]">, "params">) {
  const { lang, slug } = await params;
  const m = methodBySlug(slug);
  if (!hasLocale(lang) || !m) notFound();
  const d = getDictionary(lang);
  const t = tone[m.key];
  const related = services.filter((s) => s.methods.includes(m.key));
  const others = methods.filter((x) => x.key !== m.key);

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: d.nav.methods, href: `/${lang}/metodos` }, { label: m.name[lang] }]}
        eyebrow={`${m.code} · ${d.methodsSection.eyebrow}`}
        title={m.name[lang]}
        lead={m.tagline[lang]}
        image={m.gallery[1]}
        caption={m.code}
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className={cn("grid size-16 place-items-center rounded-2xl shadow-card", t.tile)}>
            <MethodGlyph name={m.key} className="size-9" />
          </span>
          <span className={cn("font-mono text-sm font-bold uppercase tracking-[0.14em]", t.text)}>{methodsApplied.detects[lang]}</span>
          {m.detects[lang].map((x) => (
            <span key={x} className="rounded-full bg-surface px-3.5 py-1.5 font-bold text-ink shadow-soft ring-1 ring-line">
              {x}
            </span>
          ))}
        </div>
      </PageHero>

      {/* Intro over a photo that bleeds to the edge */}
      <section className="relative isolate overflow-hidden bg-surface py-24 sm:py-32">
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 mask-fade-l lg:block">
          <Image src={m.cover} alt="" fill sizes="50vw" className="object-cover" />
        </div>
        <Container>
          <Reveal className="glass max-w-2xl rounded-[2.5rem] rounded-tr-[5rem] p-8 shadow-float ring-1 ring-line/70 sm:p-10">
            <Eyebrow index="01">{m.code}</Eyebrow>
            <p className="mt-6 text-balance text-[clamp(1.6rem,2.4vw,2.2rem)] font-extrabold leading-snug tracking-[-0.02em] text-ink">{m.intro[lang]}</p>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">{m.body[lang]}</p>
          </Reveal>
          <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-[2rem] lg:hidden">
            <Image src={m.cover} alt={m.name[lang]} fill sizes="100vw" className="object-cover" />
          </div>
        </Container>
      </section>

      {/* How it works: numbered steps on a rail */}
      <section className="py-24 sm:py-28">
        <Container>
          <Eyebrow index="02">{d.pages.methods.how}</Eyebrow>
          <RevealGroup className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <span aria-hidden className="absolute left-0 right-0 top-10 hidden h-0.5 bg-[repeating-linear-gradient(to_right,var(--color-neon)_0_6px,transparent_6px_12px)] lg:block" />
            {m.steps.map((s, i) => (
              <RevealItem key={i} className={cn("relative bg-surface p-7 shadow-card ring-1 ring-line", i % 2 ? "rounded-[2rem] rounded-tr-[4rem]" : "rounded-[2rem] rounded-bl-[4rem]")}>
                <span className={cn("relative grid size-20 place-items-center rounded-full text-3xl font-extrabold shadow-card ring-8 ring-canvas", t.tile)}>{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-6 text-2xl font-extrabold tracking-tight text-ink">{s.title[lang]}</p>
                <p className="mt-2 text-[1.05rem] leading-relaxed text-ink-soft">{s.text[lang]}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      {/* Advantages + video */}
      <section className="bg-tint py-24 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className={cn(m.video ? "lg:col-span-5" : "lg:col-span-12")}>
            <Eyebrow index="03">{d.methodsSection.advantages}</Eyebrow>
            <RevealGroup className={cn("mt-8 grid gap-3", !m.video && "sm:grid-cols-2 lg:grid-cols-3")}>
              {m.advantages[lang].map((a) => (
                <RevealItem key={a} className="flex items-center gap-4 rounded-full bg-surface py-2 pl-2 pr-6 shadow-soft ring-1 ring-line">
                  <span className={cn("grid size-12 shrink-0 place-items-center rounded-full", t.tile)}>
                    <CheckCircle weight="duotone" className="size-7" />
                  </span>
                  <span className="text-lg font-bold text-ink">{a}</span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
          {m.video && (
            <Reveal delay={0.1} className="lg:col-span-7">
              <FieldMonitor src={m.video.src} poster={m.video.poster} label={`${m.code} · REC`} tone={t.hex} />
            </Reveal>
          )}
        </Container>
      </section>

      {/* Gallery */}
      <section className="py-24 sm:py-28">
        <Container>
          <Eyebrow index="04">{d.pages.methods.gallery}</Eyebrow>
          <div className="mt-8">
            <Masonry items={photos(m.gallery)} alt={m.name[lang]} />
          </div>
        </Container>
      </section>

      {/* Related services and other methods */}
      <section className="bg-surface py-20">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold tracking-tight text-ink">{d.pages.methods.related}</h2>
            <div className="mt-7 flex flex-wrap gap-3">
              {related.map((s) => (
                <Link key={s.slug} href={`/${lang}/servicios/${s.slug}`} className="group inline-flex items-center gap-3 rounded-full bg-canvas py-2 pl-2 pr-5 text-[1.05rem] font-bold text-ink ring-1 ring-line transition hover:bg-brand-600 hover:text-white">
                  <span className="grid size-11 place-items-center rounded-full bg-surface text-accent">
                    <ServiceGlyph name={s.icon} className="size-6" />
                  </span>
                  {s.name[lang]}
                  <ArrowUpRight weight="bold" className="size-4 transition group-hover:rotate-45" />
                </Link>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <h2 className="text-xl font-extrabold text-mute">{d.pages.methods.others}</h2>
            <div className="mt-5 grid gap-3">
              {others.map((o) => (
                <Link key={o.key} href={`/${lang}/metodos/${o.slug}`} className="group flex items-center gap-4 rounded-[1.75rem] bg-canvas p-3 ring-1 ring-line transition hover:shadow-card">
                  <span className={cn("grid size-14 place-items-center rounded-2xl", tone[o.key].tile)}>
                    <MethodGlyph name={o.key} className="size-8" />
                  </span>
                  <span className="text-lg font-extrabold text-ink">{o.name[lang]}</span>
                  <ArrowUpRight weight="bold" className="ml-auto mr-2 size-5 text-accent transition group-hover:rotate-45" />
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
