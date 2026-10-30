import Image from "next/image";
import { ArrowsClockwise, Check, GraduationCap, Headset } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { partner, timelineIntro } from "@/content/deck";
import { Container, Eyebrow, IconBadge } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const icons = { support: Headset, knowledge: GraduationCap, improvement: ArrowsClockwise } as const;
const tones = ["solid", "neon", "lime"] as const;
const shapes = ["rounded-[2rem] rounded-tl-[4rem]", "rounded-[2rem]", "rounded-[2rem] rounded-tr-[4rem]"];

/** Slide 9: more than a supplier, a strategic partner. Photo panel with cards rising over it. */
export function Partner({ lang, dict, index = "08", intro = true }: { lang: Locale; dict: Dictionary; index?: string; intro?: boolean }) {
  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        {/* The title panel sits over the workbench (lower left), never over faces; on phones it stacks above. */}
        <Reveal className="relative">
          <div className="mb-5 sm:hidden">
            <Eyebrow index={index}>{dict.ui.partnerSince}</Eyebrow>
            <h2 className="mt-5 text-balance text-[2rem] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink">
              {partner.titleA[lang]}. <span className="text-accent">{partner.titleB[lang]}.</span>
            </h2>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] shadow-float sm:aspect-[16/9] sm:rounded-[3.5rem] lg:aspect-[16/7.5]">
            <Image src="/media/deck/partner-meeting.jpg" alt="" fill sizes="(min-width:1440px) 1340px, 100vw" className="object-cover object-[55%_30%]" />
          </div>
          <div className="glass absolute bottom-6 left-6 hidden max-w-[34rem] rounded-[2rem] p-7 shadow-float ring-1 ring-white/50 sm:block lg:bottom-8 lg:left-8">
            <Eyebrow index={index}>{dict.ui.partnerSince}</Eyebrow>
            <h2 className="mt-5 text-balance text-[clamp(2rem,3.4vw,3.1rem)] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink">
              {partner.titleA[lang]}. <span className="text-accent">{partner.titleB[lang]}.</span>
            </h2>
          </div>
        </Reveal>

        {intro && (
          <Reveal className="mx-auto mt-10 max-w-3xl text-center">
            <p className="text-pretty text-lg leading-relaxed text-ink-soft sm:text-xl">{timelineIntro[lang]}</p>
          </Reveal>
        )}

        <RevealGroup className={cn("relative z-10 grid gap-5 lg:grid-cols-3", intro ? "mt-10" : "mt-6")}>
          {partner.pillars.map((p, i) => {
            const Icon = icons[p.key as keyof typeof icons];
            return (
              <RevealItem key={p.key} className={cn("relative flex flex-col bg-surface p-7 shadow-card ring-1 ring-line sm:p-8", shapes[i])}>
                <div className="flex items-center justify-between gap-4">
                  <IconBadge icon={Icon} size="xl" tone={tones[i]} />
                  <span className="relative size-20 overflow-hidden rounded-full ring-4 ring-canvas">
                    <Image src={p.image} alt="" fill sizes="5rem" className="object-cover" />
                  </span>
                </div>
                <h3 className="mt-6 text-2xl font-extrabold leading-tight tracking-tight text-ink">{p.t[lang]}</h3>
                <ul className="mt-4 space-y-2.5">
                  {p.points[lang].map((pt) => (
                    <li key={pt} className="flex items-center gap-3 text-[1.05rem] font-semibold text-ink-soft">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tint text-accent-ink">
                        <Check weight="bold" className="size-3.5" />
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
