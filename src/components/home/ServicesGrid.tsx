import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { services } from "@/content/services";
import { methodByKey, type MethodKey } from "@/content/methods";
import { Container, SectionHeading } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ServiceGlyph } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

const chip: Record<MethodKey, string> = {
  vt: "bg-vt/15 text-[#c47a00] dark:text-vt",
  mt: "bg-mt/15 text-lime-deep dark:text-mt",
  pt: "bg-pt/12 text-pt",
  ut: "bg-ut/15 text-[#0784b8] dark:text-ut",
};
// Varied silhouettes across the grid; captions stay under the photos so no one is covered.
const shapes = ["rounded-[2.5rem]", "rounded-[2rem] rounded-tr-[4rem]", "rounded-[2rem]", "rounded-[2rem] rounded-bl-[4rem]", "rounded-[2rem]", "rounded-[2rem] rounded-tl-[4rem]", "rounded-[2rem]", "rounded-[2rem] rounded-br-[4rem]", "rounded-[2rem]"];

/** Nine service lines as a bento: the drill-bit specialty large, the rest as photo cards. */
export function ServicesGrid({ lang, dict, index, heading = true }: { lang: Locale; dict: Dictionary; index?: string; heading?: boolean }) {
  return (
    <section className="relative bg-surface py-24 sm:py-32">
      <Container>
        {heading && <SectionHeading index={index} eyebrow={dict.servicesSection.eyebrow} title={dict.servicesSection.title} lead={dict.servicesSection.lead} />}
        <RevealGroup stagger={0.06} className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-4", heading && "mt-14")}>
          {services.map((s, i) => {
            const big = i === 0;
            return (
              <RevealItem key={s.slug} className={cn(big && "sm:col-span-2 lg:row-span-2")}>
                <Link
                  href={`/${lang}/servicios/${s.slug}`}
                  className={cn(
                    "group flex h-full flex-col overflow-hidden ring-1 transition duration-500 hover:-translate-y-1.5 hover:shadow-float",
                    shapes[i],
                    big ? "bg-brand-600 text-white shadow-float ring-brand-500 dark:bg-brand-700" : "bg-canvas shadow-soft ring-line",
                  )}
                >
                  <div className={cn("relative overflow-hidden", big ? "aspect-[16/11] lg:aspect-auto lg:flex-1" : "aspect-[16/10]")}>
                    <Image src={s.image} alt="" fill sizes={big ? "(min-width:1024px) 46vw, 100vw" : "(min-width:1024px) 23vw, (min-width:640px) 48vw, 100vw"} className="object-cover transition duration-700 group-hover:scale-105" />
                    <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 font-mono text-xs font-bold text-ink">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className={cn("flex flex-col", big ? "gap-4 p-7 sm:p-9" : "flex-1 p-5")}>
                    <div className="flex items-start gap-4">
                      <span className={cn("grid shrink-0 place-items-center rounded-2xl", big ? "size-16 bg-lime text-[#0b1533]" : "size-14 bg-tint text-accent ring-1 ring-neon/25")}>
                        <ServiceGlyph name={s.icon} className={big ? "size-9" : "size-8"} />
                      </span>
                      <div className="min-w-0">
                        <h3 className={cn("font-extrabold leading-tight tracking-tight", big ? "text-[clamp(1.6rem,2.4vw,2.2rem)]" : "text-xl text-ink")}>{s.name[lang]}</h3>
                        <p className={cn("mt-1.5 leading-snug", big ? "text-lg text-white/80" : "text-ink-soft")}>{s.short[lang]}</p>
                      </div>
                    </div>
                    <div className={cn("flex items-center justify-between", big ? "" : "mt-auto pt-4")}>
                      <span className="flex flex-wrap gap-1.5">
                        {s.methods.map((k) => (
                          <span key={k} className={cn("rounded-full px-2.5 py-0.5 font-mono text-xs font-bold", big ? "bg-white/15 text-white" : chip[k])}>
                            {methodByKey(k).code}
                          </span>
                        ))}
                      </span>
                      <span className={cn("grid size-11 place-items-center rounded-full transition duration-500 group-hover:rotate-45", big ? "bg-white text-brand-600" : "bg-brand-600 text-white dark:bg-neon dark:text-[#0b1533]")}>
                        <ArrowUpRight weight="bold" className="size-5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
