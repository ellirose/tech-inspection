import Image from "next/image";
import { ChartBar, ClipboardText, FileText, Gear, Pulse } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { levelTwo } from "@/content/deck";
import { Container, IconBadge, SectionHeading, Swoosh } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

// One real record per stage of a Level II inspection (slide 4). Stage 4 is the acceptance standard itself.
const stageMedia: ({ src: string; fit?: "contain"; pos?: string } | null)[] = [
  { src: "/media/photos/uv-inspector.jpg", pos: "50% 40%" },
  { src: "/media/deck/ut-scan.jpg", fit: "contain" },
  { src: "/media/photos/bit-inspection.jpg", pos: "60% 50%" },
  null,
  { src: "/media/deck/bit-report.jpg", pos: "50% 0%" },
];
const canIcons = [Gear, Pulse, ClipboardText, ChartBar, FileText];
// Chevrons deepen from tint to cobalt as the inspection moves toward the report.
const chevronTone = [
  "bg-surface text-ink",
  "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200",
  "bg-brand-100 text-brand-800 dark:bg-brand-500/25 dark:text-brand-100",
  "bg-brand-400 text-white",
  "bg-brand-600 text-white dark:bg-neon dark:text-[#0b1533]",
];

/** Slide 4: what a Level II NDT inspection means. */
export function LevelTwo({ lang, dict, index = "02" }: { lang: Locale; dict: Dictionary; index?: string }) {
  const stages = levelTwo.stages[lang];
  return (
    <section className="relative isolate overflow-hidden bg-tint py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-blueprint mask-fade-y" />
      <Swoosh className="absolute -right-20 top-0 -z-10 w-[40rem] rotate-180 text-neon" />
      <Container>
        <SectionHeading
          index={index}
          eyebrow={{ es: "ASNT · Nivel II", pt: "ASNT · Nível II", en: "ASNT · Level II" }[lang]}
          title={levelTwo.title[lang]}
          lead={levelTwo.text[lang]}
        />

        {/* What a Level II inspector can do */}
        <Reveal className="mt-14">
          <p className="text-lg font-bold text-ink">{levelTwo.canTitle[lang]}</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {levelTwo.can[lang].map((c, i) => (
              <li key={c} className="flex items-center gap-4 rounded-full bg-surface py-2 pl-2 pr-5 shadow-soft ring-1 ring-line">
                <IconBadge icon={canIcons[i]} size="md" shape="circle" tone={i === 4 ? "solid" : "brand"} />
                <span className="text-[1.02rem] font-bold leading-tight text-ink">{c}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Stage pipeline: chevrons over circular records */}
        <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
          {stages.map((s, i) => {
            const m = stageMedia[i];
            return (
              <RevealItem key={s} className="relative flex flex-col items-center">
                <div className={cn("drop flex h-16 w-full items-center gap-3 px-8 lg:-mr-3", i === 0 ? "shape-chevron-first pl-6" : "shape-chevron", chevronTone[i])}>
                  <span className="font-mono text-sm font-medium opacity-70">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-lg font-extrabold tracking-tight">{s}</span>
                </div>
                <span aria-hidden className="h-8 w-0.5 bg-[repeating-linear-gradient(to_bottom,var(--color-neon)_0_4px,transparent_4px_8px)]" />
                <div className={cn("relative size-44 overflow-hidden rounded-full shadow-card ring-[6px] ring-surface sm:size-48", m?.fit ? "bg-white" : "bg-brand-700")}>
                  {m ? (
                    <Image
                      src={m.src}
                      alt={s}
                      fill
                      sizes="12rem"
                      className={m.fit === "contain" ? "object-contain p-5" : "object-cover"}
                      style={m.pos ? { objectPosition: m.pos } : undefined}
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center bg-lime text-[#0b1533]">
                      <span className="font-mono text-xs font-medium tracking-[0.2em]">STANDARD</span>
                      <span className="text-5xl font-extrabold tracking-tight">DS-1</span>
                    </div>
                  )}
                </div>
                <span className="-mt-5 z-10 rounded-full bg-surface px-3 py-1 font-mono text-xs font-medium text-accent-ink shadow-soft ring-1 ring-line">
                  {dict.ui.stage} {String(i + 1).padStart(2, "0")}
                </span>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
