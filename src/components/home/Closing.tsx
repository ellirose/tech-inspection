import Image from "next/image";
import { Desktop, GearSix, Handshake } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import { closing } from "@/content/deck";
import { Container, Eyebrow, IconBadge } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const icons = { reliability: GearSix, support: Handshake, digital: Desktop } as const;
const tones = ["solid", "neon", "lime"] as const;

/** Slide 11: the closing statement over a rig at dusk, with the three commitments rising out of it. */
export function Closing({ lang, index, ulterra = false }: { lang: Locale; index?: string; ulterra?: boolean }) {
  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <Reveal className="relative isolate overflow-hidden rounded-[2.5rem] px-6 pb-36 pt-14 shadow-float sm:rounded-[3.5rem] sm:px-14 sm:pb-40 sm:pt-20">
          <Image src="/media/stock/rig-dusk.jpg" alt="" fill sizes="(min-width:1440px) 1340px, 100vw" className="-z-10 object-cover object-[60%_45%]" />
          <div className="absolute inset-0 -z-10 bg-brand-900/45" />
          <Eyebrow index={index} tone="onImage">
            {{ es: "Nuestro compromiso", pt: "Nosso compromisso", en: "Our commitment" }[lang]}
          </Eyebrow>
          <p className="mt-7 max-w-4xl text-balance text-[clamp(1.8rem,3.4vw,3.2rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-white">
            <span className="text-white/70">{closing.statementA[lang]} </span>
            {ulterra ? closing.statementUlterra[lang] : closing.statementB[lang]}
          </p>
        </Reveal>

        <RevealGroup className="relative z-10 -mt-24 grid gap-5 px-3 sm:px-8 lg:grid-cols-3">
          {closing.pillars.map((p, i) => (
            <RevealItem key={p.key} className={cn("flex flex-col items-start bg-surface p-7 shadow-float ring-1 ring-line sm:p-8", i === 1 ? "rounded-[2rem]" : i === 0 ? "rounded-[2rem] rounded-tl-[4.5rem]" : "rounded-[2rem] rounded-tr-[4.5rem]")}>
              <IconBadge icon={icons[p.key as keyof typeof icons]} size="xl" tone={tones[i]} shape={i === 1 ? "circle" : "square"} />
              <h3 className="mt-5 text-2xl font-extrabold leading-tight tracking-tight text-ink">{p.t[lang]}</h3>
              <p className="mt-2 text-[1.05rem] leading-relaxed text-ink-soft">{p.d[lang]}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
