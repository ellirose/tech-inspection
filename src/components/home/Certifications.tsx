import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { certifications, personnelCredentials } from "@/content/site";
import { Container, SectionHeading } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const seal = ["bg-brand-600 text-white dark:bg-brand-500", "bg-lime text-[#071a2e]", "bg-surface text-ink ring-2 ring-line", "bg-neon text-[#071a2e]", "bg-pt text-white", "bg-vt text-[#071a2e]"];

/** Company certifications and personnel credentials, each with a seal-like badge. */
export function Certifications({ lang, dict, index }: { lang: Locale; dict: Dictionary; index?: string }) {
  const c = dict.certs;
  const rows = [
    ...certifications.map((x) => ({ code: x.code === "1072" ? "1072" : x.code, title: x.title[lang], body: x.body[lang] })),
    ...personnelCredentials.map((x) => ({ code: x.code === "ASNT-TC-1A" ? "ASNT" : x.code, title: x.title[lang], body: x.body[lang] })),
  ];
  return (
    <section id="certificaciones" className="relative isolate overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dots mask-fade-y" />
      <Container>
        <SectionHeading index={index} eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
        <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r, i) => (
            <RevealItem key={r.code} className={cn("group flex items-start gap-5 bg-surface p-6 shadow-soft ring-1 ring-line transition hover:-translate-y-1 hover:shadow-card sm:p-7", i % 2 ? "rounded-[2rem]" : "rounded-[2rem] rounded-tr-[4rem]")}>
              <span className="relative grid size-24 shrink-0 place-items-center">
                <span aria-hidden className="absolute inset-0 animate-orbit rounded-full border-2 border-dashed border-neon/50 transition group-hover:border-neon" />
                <span className={cn("grid size-[4.6rem] place-items-center rounded-full text-center font-mono text-[0.78rem] font-bold leading-tight shadow-soft", seal[i % seal.length])}>{r.code}</span>
              </span>
              <div>
                <h3 className="text-xl font-extrabold leading-tight tracking-tight text-ink">{r.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{r.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
