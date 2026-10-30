import Image from "next/image";
import { Buildings, Certificate, Factory, HardHat, Ruler, ShieldCheck } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { credentials, timeline, whoWeAre, type Credential } from "@/content/deck";
import { Container, Eyebrow, IconBadge } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const icons: Record<Credential["key"], typeof HardHat> = {
  people: HardHat,
  equipment: Ruler,
  experience: Factory,
  quality: Certificate,
  safety: ShieldCheck,
};

// Each credential gets its own silhouette so the set reads as five distinct facts, not a table.
const cards: Record<Credential["key"], { card: string; tone: "brand" | "neon" | "lime" | "solid"; shape: "square" | "circle" | "hex" }> = {
  people: { card: "shape-chamfer bg-canvas", tone: "solid", shape: "square" },
  equipment: { card: "rounded-[2rem] bg-surface ring-1 ring-line", tone: "neon", shape: "circle" },
  experience: { card: "rounded-[2rem] rounded-tr-[5rem] bg-brand-600 text-white dark:bg-brand-700", tone: "lime", shape: "hex" },
  quality: { card: "rounded-[2rem] border-2 border-dashed border-neon/50 bg-tint", tone: "brand", shape: "square" },
  safety: { card: "shape-chamfer-bl bg-canvas", tone: "lime", shape: "circle" },
};

/** Slide 3: who we are, as five credentials around a field photo. */
export function Credentials({ lang, dict, index = "01" }: { lang: Locale; dict: Dictionary; index?: string }) {
  const founding = timeline[0];
  return (
    <section className="relative isolate overflow-hidden bg-surface py-24 sm:py-32">
      <div className="pointer-events-none absolute right-0 top-0 -z-10 h-full w-1/2 bg-dots mask-fade-l" />
      <Container className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        {/* Photo with a floating stat */}
        <Reveal className="relative self-start lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] rounded-tr-[7rem] shadow-float">
            <Image src="/media/photos/crew-yard.jpg" alt="" fill sizes="(min-width:1024px) 38vw, 100vw" className="object-cover object-[38%_45%]" />
          </div>
          <div className="glass absolute -bottom-8 right-4 flex items-center gap-4 rounded-3xl p-4 pr-6 shadow-float ring-1 ring-line/70 sm:-right-8">
            <IconBadge icon={Buildings} size="lg" tone="solid" />
            <div>
              <p className="text-4xl font-extrabold tracking-tight text-ink">{founding.year}</p>
              <p className="max-w-[13rem] text-sm font-bold text-ink-soft">{founding.t[lang]}</p>
            </div>
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal>
            <Eyebrow index={index}>{dict.ui.whoWeAre}</Eyebrow>
            <h2 className="mt-6 text-balance text-[clamp(2.1rem,3.8vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink">{whoWeAre[lang]}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl">{dict.experience.lead}</p>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2">
            {credentials.map((c, i) => {
              const s = cards[c.key];
              const dark = c.key === "experience";
              return (
                <RevealItem key={c.key} className={cn(i === 4 && "sm:col-span-2", c.key === "people" || c.key === "safety" ? "drop" : "")}>
                  <div className={cn("flex h-full gap-5 p-6 sm:p-7", i === 4 ? "items-center" : "flex-col", s.card, !dark && "shadow-soft")}>
                    <IconBadge icon={icons[c.key]} size="xl" tone={s.tone} shape={s.shape} />
                    <div>
                      <p className={cn("text-[1.7rem] font-extrabold leading-none tracking-tight", dark ? "text-lime" : "text-accent")}>{c.value[lang]}</p>
                      <h3 className={cn("mt-2 text-xl font-bold tracking-tight", dark ? "text-white" : "text-ink")}>{c.t[lang]}</h3>
                      <p className={cn("mt-1 leading-relaxed", dark ? "text-white/75" : "text-ink-soft")}>{c.d[lang]}</p>
                    </div>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
