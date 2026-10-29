import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react/ssr";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { methodBySlug, methods, methodTone } from "@/content/methods";
import { services } from "@/content/services";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Eyebrow } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MethodGlyph, ServiceGlyph } from "@/components/ui/Icons";
import { MethodOverlay } from "@/components/visuals/MethodOverlay";
import { FieldMonitor } from "@/components/visuals/FieldMonitor";
import { Masonry } from "@/components/media/Masonry";
import { photos } from "@/lib/media";
import { CtaBand } from "@/components/ui/CtaBand";
import { cn } from "@/lib/cn";

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
  const tone = methodTone[m.key];
  const related = services.filter((s) => s.methods.includes(m.key));
  const others = methods.filter((x) => x.key !== m.key);

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: d.nav.methods, href: `/${lang}/metodos` }, { label: m.name[lang] }]}
        eyebrow={`${m.code} · ${d.methodsSection.eyebrow}`}
        title={m.name[lang]}
        lead={m.tagline[lang]}
        accent={tone.hex}
        image={m.gallery[1]}
        imageClass="rounded-[3rem] rounded-bl-[8rem]"
      >
        <div className="mt-8 flex items-center gap-3">
          <span className={cn("grid size-16 place-items-center rounded-2xl", tone.soft, tone.text)}>
            <MethodGlyph name={m.key} className="size-9" />
          </span>
          <span className="font-mono text-lg font-bold tracking-widest" style={{ color: tone.hex }}>
            {m.code}
          </span>
        </div>
      </PageHero>

      {/* Intro + animated stage */}
      <Container className="grid items-center gap-12 pb-20 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <p className="font-display text-[clamp(1.6rem,2.4vw,2.2rem)] font-bold leading-snug tracking-tight text-ink">{m.intro[lang]}</p>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">{m.body[lang]}</p>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[3rem] rounded-tr-[8rem] bg-brand-900 shadow-float">
            <Image src={m.cover} alt={m.name[lang]} fill preload sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" quality={80} />
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/50 to-transparent" />
            <MethodOverlay method={m.key} />
          </div>
        </Reveal>
      </Container>

      {/* Process */}
      <section className="relative bg-white py-20 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-60 mask-fade-y" />
        <Container className="relative">
          <Eyebrow>{d.pages.methods.how}</Eyebrow>
          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {m.steps.map((s, i) => (
              <RevealItem key={i} className={cn("relative bg-canvas p-7 ring-1 ring-line", i % 2 ? "rounded-[2rem] rounded-tr-[4.5rem]" : "rounded-[2rem] rounded-bl-[4.5rem]")}>
                <span className="font-display text-7xl font-extrabold leading-none" style={{ color: tone.hex, opacity: 0.22 }}>
                  0{i + 1}
                </span>
                <p className="mt-3 font-display text-2xl font-bold text-ink">{s.title[lang]}</p>
                <p className="mt-2 leading-relaxed text-ink-soft">{s.text[lang]}</p>
                <span className="absolute right-7 top-8 size-3 rounded-full" style={{ backgroundColor: tone.hex }} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      {/* Advantages + video */}
      <Container className="grid gap-10 py-20 sm:py-24 lg:grid-cols-12">
        <div className={cn(m.video ? "lg:col-span-6" : "lg:col-span-12")}>
          <Eyebrow>{d.methodsSection.advantages}</Eyebrow>
          <RevealGroup className={cn("mt-8 grid gap-3", m.video ? "sm:grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3")}>
            {m.advantages[lang].map((a) => (
              <RevealItem key={a} className="flex items-center gap-4 rounded-full bg-white py-3 pl-3 pr-6 shadow-soft ring-1 ring-line">
                <span className={cn("grid size-12 shrink-0 place-items-center rounded-full", tone.soft, tone.text)}>
                  <CheckCircle weight="duotone" className="size-7" />
                </span>
                <span className="text-lg font-semibold text-ink">{a}</span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
        {m.video && (
          <Reveal delay={0.1} className="lg:col-span-6">
            <Eyebrow>{d.pages.methods.video}</Eyebrow>
            <FieldMonitor src={m.video.src} poster={m.video.poster} label={`${m.code} · REC`} tone={tone.hex} className="mt-8" />
          </Reveal>
        )}
      </Container>

      {/* Gallery */}
      <Container className="pb-20">
        <Eyebrow>{d.pages.methods.gallery}</Eyebrow>
        <div className="mt-8">
          <Masonry items={photos(m.gallery)} alt={m.name[lang]} />
        </div>
      </Container>

      {/* Related services */}
      <section className="bg-white py-20">
        <Container>
          <h2 className="font-display text-[clamp(1.9rem,3vw,2.75rem)] font-bold tracking-tight text-ink">{d.pages.methods.related}</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {related.map((s) => (
              <Link key={s.slug} href={`/${lang}/servicios/${s.slug}`} className="group inline-flex items-center gap-3 rounded-full bg-canvas py-2.5 pl-2.5 pr-5 font-display text-lg font-bold text-ink ring-1 ring-line transition hover:bg-brand-700 hover:text-white">
                <span className="grid size-11 place-items-center rounded-full bg-white text-brand-700">
                  <ServiceGlyph name={s.icon} className="size-6" />
                </span>
                {s.name[lang]}
                <ArrowUpRight weight="bold" className="size-4 transition group-hover:rotate-45" />
              </Link>
            ))}
          </div>
          <h2 className="mt-14 font-display text-xl font-bold text-mute">{d.pages.methods.others}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {others.map((o) => (
              <Link key={o.key} href={`/${lang}/metodos/${o.slug}`} className="group flex items-center gap-4 rounded-[1.75rem] bg-canvas p-4 ring-1 ring-line transition hover:shadow-lift">
                <span className={cn("grid size-14 place-items-center rounded-2xl", methodTone[o.key].soft, methodTone[o.key].text)}>
                  <MethodGlyph name={o.key} className="size-8" />
                </span>
                <span className="font-display text-xl font-bold text-ink">{o.name[lang]}</span>
                <ArrowUpRight weight="bold" className="ml-auto size-5 text-brand-700 transition group-hover:rotate-45" />
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
