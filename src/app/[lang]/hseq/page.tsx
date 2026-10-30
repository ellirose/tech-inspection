import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowDown, FilePdf, FirstAidKit, Heart, HardHat, Plant, ShieldCheck, Certificate, UsersThree } from "@phosphor-icons/react/ssr";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { accountabilityDocs, policyDocs } from "@/content/site";
import { credentials } from "@/content/deck";
import { pageMeta } from "@/lib/metadata";
import { photo } from "@/lib/media";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Eyebrow, IconBadge, SectionHeading } from "@/components/ui/Section";
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
  const deckFacts = [credentials.find((c) => c.key === "quality")!, credentials.find((c) => c.key === "safety")!];

  // Photo sits above the text (never under it), so nobody in the picture is covered.
  const pillars = [
    { icon: FirstAidKit, t: h.training, d: h.trainingText, img: "/media/hseq/training-1.jpg", pos: "50% 30%", tone: "solid" as const, shape: "rounded-[2rem] rounded-tl-[4rem]" },
    { icon: UsersThree, t: h.integration, d: h.integrationText, img: "/media/hseq/integration-1.jpg", pos: "50% 40%", tone: "neon" as const, shape: "rounded-[2rem]" },
    { icon: Plant, t: h.environment, d: h.environmentText, img: "/media/hseq/planting-3.jpg", pos: "50% 45%", tone: "lime" as const, shape: "rounded-[2rem]" },
    { icon: Heart, t: h.wellbeing, d: h.wellbeingText, img: "/media/hseq/wellbeing.jpg", pos: "50% 35%", tone: "red" as const, shape: "rounded-[2rem] rounded-br-[4rem]" },
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
        imagePosition="50% 20%"
        caption="ISO 9001 · ISO 45001 · RUC"
      >
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {deckFacts.map((c, i) => (
            <div key={c.key} className="flex items-center gap-4 rounded-[1.75rem] bg-surface p-4 shadow-soft ring-1 ring-line">
              <IconBadge icon={i ? ShieldCheck : Certificate} size="lg" tone={i ? "lime" : "solid"} />
              <div>
                <p className="font-extrabold text-ink">{c.t[lang]}</p>
                <p className="text-sm font-medium text-ink-soft">{c.d[lang]}</p>
              </div>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="bg-surface py-20 sm:py-28">
        <Container>
          <RevealGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {pillars.map((p, i) => (
              <RevealItem key={p.t} className={cn("flex flex-col overflow-hidden bg-canvas shadow-card ring-1 ring-line", p.shape, i % 2 && "xl:mt-10")}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={p.img} alt={p.t} fill sizes="(min-width:1280px) 22vw, 50vw" className="object-cover" style={{ objectPosition: p.pos }} />
                </div>
                <div className="relative flex flex-1 flex-col px-6 pb-7 pt-12">
                  <IconBadge icon={p.icon} size="xl" tone={p.tone} className="absolute -top-10 left-6 ring-4 ring-canvas" />
                  <h2 className="text-2xl font-extrabold tracking-tight text-ink">{p.t}</h2>
                  <p className="mt-2 text-[1.05rem] leading-relaxed text-ink-soft">{p.d}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      {/* PPE band: the original site's four-up strip inside a cobalt card */}
      <section className="py-10 sm:py-14">
        <Container>
          <div className="relative isolate grid items-center gap-10 overflow-hidden rounded-[2.5rem] bg-brand-600 p-8 text-white shadow-float sm:rounded-[3.5rem] sm:p-12 lg:grid-cols-12 dark:bg-brand-700">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-network opacity-50" />
            <Reveal className="lg:col-span-4">
              <IconBadge icon={HardHat} size="xl" tone="lime" className="ring-0" />
              <h2 className="mt-6 text-[clamp(2rem,3.4vw,3rem)] font-extrabold leading-tight tracking-tight">{h.ppe}</h2>
              <p className="mt-4 text-lg leading-relaxed text-white/80">{h.ppeText}</p>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-8">
              <div className="overflow-hidden rounded-[2rem] bg-white p-2 shadow-float">
                <Image src="/media/hseq/ppe-strip.jpg" alt={h.ppe} width={1245} height={301} sizes="(min-width:1024px) 60vw, 100vw" className="h-auto w-full rounded-[1.5rem]" />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Tree planting */}
      <section className="relative isolate overflow-hidden py-24 sm:py-32">
        <div className="pointer-events-none absolute -left-40 top-20 -z-10 size-[36rem] rounded-full bg-lime/15 blur-[110px]" />
        <Container>
          <SectionHeading align="center" index="01" eyebrow={h.environment} title={h.planting} lead={h.plantingLead} />
          <Reveal delay={0.1}>
            <Polaroids items={planting} className="mt-14" />
          </Reveal>
        </Container>
      </section>

      {/* Team life */}
      <section className="relative bg-surface py-24 sm:py-28">
        <Container>
          <SectionHeading index="02" eyebrow={h.integration} title={h.life} lead={h.lifeLead} />
          <Reveal delay={0.1} className="mt-10">
            <Filmstrip items={life} alt={h.life} prev={d.cta.prev} next={d.cta.next} />
          </Reveal>
        </Container>
      </section>

      {/* Documents */}
      <section className="relative isolate py-24">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots mask-fade-y" />
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow index="03">{h.policies}</Eyebrow>
            <RevealGroup className="mt-8 space-y-3">
              {policyDocs.map((doc) => (
                <RevealItem key={doc.code}>
                  <a href={doc.file} target="_blank" rel="noopener" className="group flex items-center gap-5 bg-surface p-5 shadow-soft ring-1 ring-line shape-ticket transition hover:bg-tint">
                    {docThumb[doc.code] ? (
                      <span className="relative h-16 w-28 shrink-0 overflow-hidden rounded-2xl ring-1 ring-line">
                        <Image src={docThumb[doc.code]} alt="" fill sizes="7rem" className="object-cover" />
                      </span>
                    ) : (
                      <IconBadge icon={FilePdf} size="lg" tone="red" />
                    )}
                    <span className="min-w-0">
                      <span className="block font-mono text-xs font-medium tracking-widest text-mute">{doc.code}</span>
                      <span className="block text-xl font-extrabold text-ink">{doc.title[lang]}</span>
                    </span>
                    <span className="ml-auto grid size-12 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition group-hover:translate-y-0.5 dark:bg-neon dark:text-[#071a2e]">
                      <ArrowDown weight="bold" className="size-5" />
                    </span>
                  </a>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
          <div className="lg:col-span-5">
            <Eyebrow index="04">{h.accountability}</Eyebrow>
            <Reveal className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-3">
              {accountabilityDocs.map((doc) => (
                <a key={doc.year} href={doc.file} target="_blank" rel="noopener" title={doc.title[lang]} className="group flex aspect-square flex-col items-center justify-center rounded-full bg-surface shadow-soft ring-1 ring-line transition hover:bg-brand-600 hover:text-white">
                  <FilePdf weight="duotone" className="size-8 text-pt group-hover:text-lime" />
                  <span className="mt-1 text-2xl font-extrabold text-ink group-hover:text-white">{doc.year}</span>
                </a>
              ))}
            </Reveal>
          </div>
        </Container>
      </section>

      <Certifications lang={lang} dict={d} index="05" />
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
