import Image from "next/image";
import { notFound } from "next/navigation";
import { EnvelopeSimple, Handshake, Medal, ShieldCheck, Target, Eye } from "@phosphor-icons/react/ssr";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { clients, leadership } from "@/content/site";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Eyebrow } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Experience } from "@/components/home/Experience";
import { Certifications } from "@/components/home/Certifications";
import { CtaBand } from "@/components/ui/CtaBand";
import { cn } from "@/lib/cn";

export async function generateMetadata({ params }: PageProps<"/[lang]/nosotros">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta(lang, "/nosotros", d.nav.about, d.pages.about.lead);
}

const pillarIcons = [ShieldCheck, Handshake, Medal];
const pillarStyles = ["bg-brand-700 text-white", "bg-white ring-1 ring-line", "bg-mt-soft"];

export default async function AboutPage({ params }: PageProps<"/[lang]/nosotros">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const a = d.pages.about;

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: d.nav.about }]}
        eyebrow={d.nav.about}
        title={a.title}
        lead={a.lead}
        image="/media/photos/team-blue.jpg"
        imageClass="shape-arch"
      />

      {/* Story + mission / vision */}
      <Container className="grid gap-6 pb-20 lg:grid-cols-12">
        <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-lift ring-1 ring-line sm:p-10 lg:col-span-4">
          <p className="font-display text-[1.65rem] font-bold leading-snug tracking-tight text-ink">{a.story}</p>
        </Reveal>
        <Reveal delay={0.08} className="rounded-[2.5rem] rounded-tr-[6rem] bg-brand-50 p-8 ring-1 ring-brand-100 sm:p-10 lg:col-span-4">
          <span className="grid size-16 place-items-center rounded-2xl bg-white text-brand-700 shadow-soft">
            <Target weight="duotone" className="size-9" />
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold text-ink">{a.mission}</h2>
          <p className="mt-3 text-lg leading-relaxed text-ink-soft">{a.missionText}</p>
        </Reveal>
        <Reveal delay={0.16} className="rounded-[2.5rem] rounded-bl-[6rem] border-2 border-dashed border-brand-200 p-8 sm:p-10 lg:col-span-4">
          <span className="grid size-16 place-items-center rounded-2xl bg-brand-700 text-white">
            <Eye weight="duotone" className="size-9" />
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold text-ink">{a.vision}</h2>
          <p className="mt-3 text-lg leading-relaxed text-ink-soft">{a.visionText}</p>
        </Reveal>
      </Container>

      {/* Pillars */}
      <section className="relative bg-white py-20">
        <div className="pointer-events-none absolute inset-0 bg-contours opacity-60" />
        <Container className="relative">
          <RevealGroup className="grid gap-5 md:grid-cols-3">
            {a.pillars.map((p, i) => {
              const Icon = pillarIcons[i];
              return (
                <RevealItem key={p.t} className={cn("flex flex-col p-8 sm:p-10", i === 1 ? "rounded-full sm:aspect-square sm:items-center sm:justify-center sm:text-center" : "rounded-[2.5rem]", pillarStyles[i])}>
                  <Icon weight="duotone" className={cn("size-14", i === 0 ? "text-mt" : "text-brand-700")} />
                  <h3 className="mt-5 font-display text-3xl font-bold">{p.t}</h3>
                  <p className={cn("mt-3 text-lg leading-relaxed", i === 0 ? "text-white/80" : "text-ink-soft")}>{p.d}</p>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </Container>
      </section>

      <Experience lang={lang} dict={d} />

      {/* Leadership */}
      <section id="liderazgo" className="py-20">
        <Container>
          <Eyebrow>{a.leadership}</Eyebrow>
          <RevealGroup className="mt-10 grid gap-6 md:grid-cols-2">
            {leadership.map((p, i) => (
              <RevealItem key={p.name} className="grid items-center gap-6 rounded-[2.5rem] bg-white p-6 shadow-lift ring-1 ring-line sm:grid-cols-[13rem_1fr] sm:p-7">
                <div className={cn("relative aspect-square overflow-hidden bg-mist sm:aspect-[4/5]", i ? "rounded-[2rem] rounded-tr-[5rem]" : "shape-arch")}>
                  <Image src={p.photo} alt={p.name} fill sizes="(min-width:640px) 13rem, 100vw" className="object-cover object-top" />
                </div>
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{p.role[lang]}</p>
                  <h3 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">{p.name}</h3>
                  <p className="mt-3 leading-relaxed text-ink-soft">{p.bio[lang]}</p>
                  <a href={`mailto:${p.email}`} className="mt-5 inline-flex items-center gap-2 break-all rounded-full bg-canvas px-4 py-2 text-sm font-semibold text-brand-700 ring-1 ring-line">
                    <EnvelopeSimple weight="duotone" className="size-5 shrink-0" /> {p.email}
                  </a>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      {/* Clients */}
      <section id="clientes" className="bg-white py-20">
        <Container>
          <Eyebrow>{a.clients}</Eyebrow>
          <RevealGroup className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {clients.map((c, i) => (
              <RevealItem key={c.name} className={cn("flex aspect-[4/3] items-center justify-center bg-canvas p-6 ring-1 ring-line", i % 2 ? "rounded-full" : "rounded-[2rem]")}>
                <Image src={c.logo} alt={c.name} width={220} height={120} className="max-h-20 w-auto object-contain" />
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      <Certifications lang={lang} dict={d} />
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
