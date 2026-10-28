import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { certifications } from "@/content/site";
import { Container, SectionHeading } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Seal } from "@/components/visuals/Seal";
import { cn } from "@/lib/cn";

const outlines = [
  "rounded-[2.5rem] bg-white shadow-lift ring-1 ring-line",
  "rounded-[2.5rem] rounded-tl-[6rem] bg-brand-50/70 ring-1 ring-brand-100",
  "rounded-[2.5rem] border-2 border-dashed border-brand-200 bg-white/60",
  "rounded-[2.5rem] rounded-br-[6rem] bg-white shadow-lift ring-1 ring-line",
];

export function Certifications({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const c = dict.certs;
  return (
    <section id="certificaciones" className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-contours opacity-60" />
      <Container className="relative">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} lead={c.lead} align="center" className="max-w-4xl" />
        <RevealGroup className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {certifications.map((cert, i) => (
            <RevealItem key={cert.id} className={cn("group flex flex-col items-center p-8 text-center transition duration-500 hover:-translate-y-2", outlines[i])}>
              <Seal ring={cert.ring} code={cert.code} className="w-44 transition duration-700 group-hover:rotate-[20deg]" />
              <h3 className="mt-7 font-display text-2xl font-bold tracking-tight text-ink">{cert.title[lang]}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{cert.body[lang]}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
