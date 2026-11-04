import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { officialSeals } from "@/content/site";
import { getCertifications } from "@/lib/data/content";
import { Container, SectionHeading } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const seal = ["bg-brand-600 text-white dark:bg-brand-500", "bg-lime text-[#071a2e]", "bg-surface text-ink ring-2 ring-line", "bg-neon text-[#071a2e]", "bg-pt text-white", "bg-vt text-[#071a2e]"];

/** Company certifications and personnel credentials, each with a seal-like badge. */
export async function Certifications({ lang, dict, index }: { lang: Locale; dict: Dictionary; index?: string }) {
  const { system: certifications, personnel: personnelCredentials } = await getCertifications();
  const c = dict.certs;
  const rows = [
    ...certifications.map((x) => ({
      code: x.code === "1072" ? "1072" : x.code,
      title: x.title[lang],
      body: x.body[lang],
      // The CCS manuals require the certificate code with the seal: no code, no seal
      official: x.certificateNumber && officialSeals[x.id] ? { ...officialSeals[x.id], number: x.certificateNumber } : undefined,
    })),
    ...personnelCredentials.map((x) => ({ code: x.code === "ASNT-TC-1A" ? "ASNT" : x.code, title: x.title[lang], body: x.body[lang], official: undefined })),
  ];
  return (
    <section id="certificaciones" className="relative isolate overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dots mask-fade-y" />
      <Container>
        <SectionHeading index={index} eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
        <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r, i) =>
            r.official ? (
              // CCS seal as published, upright, at the 210 px digital minimum, on a white plate so its white
              // border holds in dark mode. Clear space of 3u (≈63 px): plate padding plus the gap below, and
              // plate plus card padding plus grid gap to the side. Full row on sm, where two columns are too narrow.
              <RevealItem key={r.code} className="flex flex-col items-center gap-12 rounded-[2rem] bg-surface p-6 text-center shadow-soft ring-1 ring-line sm:max-md:col-span-2">
                <figure className="rounded-[1.5rem] bg-white p-4 ring-1 ring-line">
                  <Image src={r.official.src} width={r.official.width} height={r.official.height} alt={r.official.alt} sizes="210px" className="size-[210px] max-w-none" />
                  <figcaption className="mt-3 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-base font-medium tracking-wide text-[#00539b]">{r.official.number}</figcaption>
                </figure>
                <div>
                  <h3 className="text-xl font-extrabold leading-tight tracking-tight text-ink">{r.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{r.body}</p>
                </div>
              </RevealItem>
            ) : (
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
            ),
          )}
        </RevealGroup>

        {/* Projects: kept apart from the certifications above so nothing reads as held before it is */}
        <div id="proyectos" className="mt-16 scroll-mt-32">
          <p className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-mute">{c.projects}</p>
          <div className="mt-5 flex flex-col gap-5 rounded-[2rem] border-2 border-dashed border-line p-6 sm:flex-row sm:items-center sm:p-7 lg:max-w-3xl">
            <span className="grid size-24 shrink-0 place-items-center rounded-full border-2 border-dashed border-line text-center font-mono text-[0.78rem] font-bold leading-tight text-ink-soft">
              17020
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-extrabold leading-tight tracking-tight text-ink">{c.iso17020.title}</h3>
                <span className="rounded-full bg-mist px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-ink-soft">{c.iso17020.status}</span>
              </div>
              <p className="mt-2 leading-relaxed text-ink-soft">{c.iso17020.body}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
