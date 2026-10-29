import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowDown, FilePdf, FirstAidKit, Heart, HardHat, Plant, UsersThree } from "@phosphor-icons/react/ssr";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { accountabilityDocs, policyDocs } from "@/content/site";
import { pageMeta } from "@/lib/metadata";
import { photo } from "@/lib/media";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Polaroids } from "@/components/media/Polaroids";
import { Filmstrip } from "@/components/media/Filmstrip";
import { Certifications } from "@/components/home/Certifications";
import { CtaBand } from "@/components/ui/CtaBand";
import { cn } from "@/lib/cn";

export async function generateMetadata({ params }: PageProps<"/[lang]/hseq">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta(lang, "/hseq", "HSEQ", d.pages.hseq.lead);
}

// Thumbnails shown on the policy rows (the data-protection banner comes from the original site).
const docThumb: Record<string, string> = { "PL-09-1": "/media/hseq/data-protection.jpg" };

export default async function HseqPage({ params }: PageProps<"/[lang]/hseq">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const h = d.pages.hseq;

  // Photo sits above the text (never under it), so nobody in the picture is covered.
  const pillars = [
    { icon: FirstAidKit, t: h.training, d: h.trainingText, img: "/media/hseq/training-1.jpg", pos: "50% 30%", tone: "bg-brand-50 text-brand-700", frame: "rounded-[1.6rem] rounded-tr-[4.5rem]" },
    { icon: UsersThree, t: h.integration, d: h.integrationText, img: "/media/hseq/integration-1.jpg", pos: "50% 40%", tone: "bg-ut-soft text-[#0784b8]", frame: "rounded-[1.6rem]" },
    { icon: Plant, t: h.environment, d: h.environmentText, img: "/media/hseq/planting-3.jpg", pos: "50% 45%", tone: "bg-mt-soft text-[#3f8a07]", frame: "rounded-[1.6rem] rounded-tl-[4.5rem]" },
    { icon: Heart, t: h.wellbeing, d: h.wellbeingText, img: "/media/hseq/wellbeing.jpg", pos: "50% 35%", tone: "bg-pt-soft text-pt", frame: "rounded-[1.6rem] rounded-br-[4.5rem]" },
  ];

  const planting = [
    photo("/media/hseq/planting-carlos.jpg", "Carlos"),
    photo("/media/hseq/planting-2.jpg"),
    photo("/media/hseq/planting-juan.jpg", "Juan"),
    photo("/media/hseq/planting-1.jpg"),
    photo("/media/hseq/planting-paola.jpg", "Paola"),
    photo("/media/hseq/planting-4.jpg"),
    photo("/media/hseq/planting-julio.jpg", "Julio"),
  ];

  const life = [
    photo("/media/hseq/integration-2.jpg"),
    photo("/media/hseq/integration-4.jpg"),
    photo("/media/hseq/training-2.jpg"),
    photo("/media/hseq/integration-3.jpg"),
    photo("/media/hseq/integration-1.jpg"),
    photo("/media/hseq/training-3.jpg"),
    photo("/media/hseq/wellbeing.jpg"),
  ];

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: "HSEQ" }]}
        eyebrow="HSEQ"
        title={h.title}
        lead={h.lead}
        image="/media/hseq/training-3.jpg"
        imageClass="rounded-[3rem] rounded-bl-[8rem]"
        imagePosition="50% 20%"
        accent="#6fd11c"
      />

      <Container className="pb-20">
        <RevealGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((p) => (
            <RevealItem key={p.t} className="flex flex-col rounded-[2rem] bg-white p-3 shadow-lift ring-1 ring-line">
              <div className={cn("relative aspect-[4/3] overflow-hidden", p.frame)}>
                <Image src={p.img} alt={p.t} fill sizes="(min-width:1280px) 22vw, 50vw" className="object-cover" style={{ objectPosition: p.pos }} />
              </div>
              <div className="flex flex-1 flex-col p-4 pt-5">
                <span className={cn("grid size-14 place-items-center rounded-2xl", p.tone)}>
                  <p.icon weight="duotone" className="size-8" />
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold text-ink">{p.t}</h2>
                <p className="mt-2 leading-relaxed text-ink-soft">{p.d}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>

      {/* PPE banner: the original site's four-up strip, shown at its full width */}
      <section className="relative overflow-hidden bg-brand-800 py-16 text-white sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-blueprint opacity-20" />
        <Container className="relative grid items-center gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <span className="grid size-16 place-items-center rounded-2xl bg-white/10 text-mt ring-1 ring-white/20">
              <HardHat weight="duotone" className="size-9" />
            </span>
            <h2 className="mt-6 font-display text-[clamp(2rem,3.4vw,3rem)] font-bold leading-tight tracking-tight">{h.ppe}</h2>
            <p className="mt-4 text-lg leading-relaxed text-white/75">{h.ppeText}</p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-8">
            <div className="overflow-hidden rounded-[2rem] bg-white p-2 shadow-float">
              <Image src="/media/hseq/ppe-strip.jpg" alt={h.ppe} width={1245} height={301} sizes="(min-width:1024px) 60vw, 100vw" className="h-auto w-full rounded-[1.5rem]" />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Tree planting */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="pointer-events-none absolute -left-40 top-20 size-[36rem] rounded-full bg-mt-soft blur-3xl" />
        <Container className="relative">
          <SectionHeading eyebrow={h.environment} title={h.planting} lead={h.plantingLead} align="center" />
          <Reveal delay={0.1}>
            <Polaroids items={planting} className="mt-14" />
          </Reveal>
        </Container>
      </section>

      {/* Team life */}
      <section className="relative bg-white py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow={h.integration} title={h.life} lead={h.lifeLead} />
          <Reveal delay={0.1} className="mt-10">
            <Filmstrip items={life} alt={h.life} prev={d.cta.prev} next={d.cta.next} />
          </Reveal>
        </Container>
      </section>

      {/* Documents */}
      <section className="relative py-20">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-60 mask-fade-y" />
        <Container className="relative grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>{h.policies}</Eyebrow>
            <RevealGroup className="mt-8 space-y-3">
              {policyDocs.map((doc) => (
                <RevealItem key={doc.code}>
                  <a href={doc.file} target="_blank" rel="noopener" className="group flex items-center gap-5 bg-white p-5 ring-1 ring-line shape-ticket transition hover:bg-brand-50">
                    {docThumb[doc.code] ? (
                      <span className="relative h-16 w-28 shrink-0 overflow-hidden rounded-2xl ring-1 ring-line">
                        <Image src={docThumb[doc.code]} alt="" fill sizes="7rem" className="object-cover" />
                      </span>
                    ) : (
                      <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-pt-soft text-pt">
                        <FilePdf weight="duotone" className="size-9" />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block font-mono text-xs font-bold tracking-widest text-mute">{doc.code}</span>
                      <span className="block font-display text-xl font-bold text-ink">{doc.title[lang]}</span>
                    </span>
                    <span className="ml-auto grid size-12 shrink-0 place-items-center rounded-full bg-brand-700 text-white transition group-hover:translate-y-0.5">
                      <ArrowDown weight="bold" className="size-5" />
                    </span>
                  </a>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
          <div className="lg:col-span-5">
            <Eyebrow>{h.accountability}</Eyebrow>
            <Reveal className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-3">
              {accountabilityDocs.map((doc) => (
                <a key={doc.year} href={doc.file} target="_blank" rel="noopener" title={doc.title[lang]} className="group flex aspect-square flex-col items-center justify-center rounded-full bg-white ring-1 ring-line transition hover:bg-brand-700 hover:text-white">
                  <FilePdf weight="duotone" className="size-7 text-pt group-hover:text-white" />
                  <span className="mt-1 font-display text-2xl font-extrabold">{doc.year}</span>
                </a>
              ))}
            </Reveal>
          </div>
        </Container>
      </section>

      <Certifications lang={lang} dict={d} />
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
