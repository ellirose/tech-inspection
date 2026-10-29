import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Container, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { photo } from "@/lib/media";
import { cn } from "@/lib/cn";

const columns = [
  [photo("/media/photos/team-uniform.jpg"), photo("/media/hseq/training-2.jpg")],
  [photo("/media/photos/team-office.jpg"), photo("/media/hseq/training-1.jpg")],
];
const frames = ["rounded-[2rem] rounded-tl-[5rem]", "rounded-[2rem]", "rounded-[2rem]", "rounded-[2rem] rounded-br-[5rem]"];

/** Collage of real team photos in two offset columns. */
export function Team({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.team;
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
          <Reveal delay={0.15} className="mt-8 flex flex-wrap gap-2">
            {t.tags.map((tag, i) => (
              <span key={tag} className={["bg-brand-50 text-brand-700", "bg-ut-soft text-[#0784b8]", "bg-mt-soft text-[#3f8a07]", "bg-vt-soft text-[#b46f00]"][i] + " rounded-full px-4 py-2 font-display font-bold"}>
                {tag}
              </span>
            ))}
          </Reveal>
          <Reveal delay={0.25} className="mt-8 flex flex-wrap gap-5">
            <Link href={`/${lang}/hseq`} className="inline-flex items-center gap-2 font-display text-lg font-bold text-brand-700 transition-all hover:gap-3">
              HSEQ <ArrowRight weight="bold" className="size-5" />
            </Link>
            <Link href={`/${lang}/nosotros`} className="inline-flex items-center gap-2 font-display text-lg font-bold text-brand-700 transition-all hover:gap-3">
              {dict.nav.about} <ArrowRight weight="bold" className="size-5" />
            </Link>
          </Reveal>
        </div>

        {/* Staggered columns at each photo's natural ratio: whole groups stay in frame. */}
        <div className="grid grid-cols-2 items-start gap-3 sm:gap-4 lg:col-span-8">
          {columns.map((col, c) => (
            <RevealGroup key={c} className={cn("space-y-3 sm:space-y-4", c === 1 && "pt-10 sm:pt-16")}>
              {col.map((p, i) => (
                <RevealItem key={p.src} className={cn("overflow-hidden bg-mist shadow-lift", frames[c * 2 + i])}>
                  <Image src={p.src} alt="" width={p.w} height={p.h} sizes="(min-width:1024px) 30vw, 50vw" className="h-auto w-full" />
                </RevealItem>
              ))}
            </RevealGroup>
          ))}
        </div>
      </Container>
    </section>
  );
}
