import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Container, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

/** Collage of real team photos, each framed in a different shape. */
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

        <RevealGroup className="grid grid-cols-6 grid-rows-[repeat(6,4.2rem)] gap-3 sm:grid-rows-[repeat(6,5.5rem)] lg:col-span-8">
          <RevealItem className="relative col-span-3 row-span-6 overflow-hidden shape-arch shadow-lift">
            <Image src="/media/photos/team-uniform.jpg" alt="" fill sizes="(min-width:1024px) 30vw, 50vw" className="object-cover" />
          </RevealItem>
          <RevealItem className="relative col-span-3 row-span-3 overflow-hidden rounded-full shadow-lift">
            <Image src="/media/hseq/training-2.jpg" alt="" fill sizes="(min-width:1024px) 30vw, 50vw" className="object-cover" />
          </RevealItem>
          <RevealItem className="relative col-span-2 row-span-3 overflow-hidden shape-leaf shadow-lift">
            <Image src="/media/photos/inspector-logo.jpg" alt="" fill sizes="(min-width:1024px) 20vw, 33vw" className="object-cover object-top" />
          </RevealItem>
          <RevealItem className="relative col-span-1 row-span-3 overflow-hidden rounded-full bg-mt-soft shadow-lift">
            <Image src="/media/hseq/planting-1.jpg" alt="" fill sizes="15vw" className="object-cover" />
          </RevealItem>
        </RevealGroup>
      </Container>
    </section>
  );
}
