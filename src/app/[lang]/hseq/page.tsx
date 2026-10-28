import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowDown, FilePdf, FirstAidKit, Heart, Plant, UsersThree } from "@phosphor-icons/react/ssr";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { accountabilityDocs, policyDocs } from "@/content/site";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Eyebrow } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Gallery } from "@/components/ui/Gallery";
import { Certifications } from "@/components/home/Certifications";
import { CtaBand } from "@/components/ui/CtaBand";
import { cn } from "@/lib/cn";

export async function generateMetadata({ params }: PageProps<"/[lang]/hseq">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta(lang, "/hseq", "HSEQ", d.pages.hseq.lead);
}

export default async function HseqPage({ params }: PageProps<"/[lang]/hseq">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const h = d.pages.hseq;

  const pillars = [
    { icon: FirstAidKit, t: h.training, d: h.trainingText, img: "/media/hseq/training-1.jpg", tone: "bg-brand-50 text-brand-700", frame: "rounded-[2.5rem] rounded-tr-[6rem]" },
    { icon: UsersThree, t: h.integration, d: h.integrationText, img: "/media/hseq/integration-1.jpg", tone: "bg-ut-soft text-[#0784b8]", frame: "shape-arch" },
    { icon: Plant, t: h.environment, d: h.environmentText, img: "/media/hseq/planting-3.jpg", tone: "bg-mt-soft text-[#3f8a07]", frame: "shape-leaf" },
    { icon: Heart, t: h.wellbeing, d: h.wellbeingText, img: "/media/hseq/wellbeing.jpg", tone: "bg-pt-soft text-pt", frame: "rounded-[2.5rem] rounded-bl-[6rem]" },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: "HSEQ" }]}
        eyebrow="HSEQ"
        title={h.title}
        lead={h.lead}
        image="/media/hseq/training-3.jpg"
        imageClass="rounded-full"
        accent="#6fd11c"
      />

      <Container className="pb-20">
        <RevealGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((p) => (
            <RevealItem key={p.t} className="flex flex-col">
              <div className={cn("relative aspect-[4/3.3] overflow-hidden shadow-lift", p.frame)}>
                <Image src={p.img} alt={p.t} fill sizes="(min-width:1280px) 22vw, 50vw" className="object-cover" />
              </div>
              <div className="relative -mt-10 ml-5 mr-5 rounded-[1.75rem] bg-white p-6 shadow-lift ring-1 ring-line">
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

      {/* Documents */}
      <section className="relative bg-white py-20">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-60 mask-fade-y" />
        <Container className="relative grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>{h.policies}</Eyebrow>
            <RevealGroup className="mt-8 space-y-3">
              {policyDocs.map((doc) => (
                <RevealItem key={doc.code}>
                  <a href={doc.file} target="_blank" rel="noopener" className="group flex items-center gap-5 bg-canvas p-5 ring-1 ring-line shape-ticket transition hover:bg-brand-50">
                    <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-pt-soft text-pt">
                      <FilePdf weight="duotone" className="size-9" />
                    </span>
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
                <a key={doc.year} href={doc.file} target="_blank" rel="noopener" title={doc.title[lang]} className="group flex aspect-square flex-col items-center justify-center rounded-full bg-canvas ring-1 ring-line transition hover:bg-brand-700 hover:text-white">
                  <FilePdf weight="duotone" className="size-7 text-pt group-hover:text-white" />
                  <span className="mt-1 font-display text-2xl font-extrabold">{doc.year}</span>
                </a>
              ))}
            </Reveal>
          </div>
        </Container>
      </section>

      <Container className="py-20">
        <Eyebrow>{h.environment}</Eyebrow>
        <div className="mt-8">
          <Gallery
            images={["/media/hseq/planting-2.jpg", "/media/hseq/training-2.jpg", "/media/hseq/integration-2.jpg", "/media/hseq/planting-1.jpg", "/media/hseq/planting-4.jpg", "/media/hseq/training-1.jpg", "/media/photos/team-uniform.jpg", "/media/hseq/integration-1.jpg"]}
            alt="HSEQ"
          />
        </div>
      </Container>

      <Certifications lang={lang} dict={d} />
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
