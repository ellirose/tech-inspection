import Image from "next/image";
import Link from "next/link";
import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { whatsappLink } from "@/content/site";
import { Container } from "./Section";
import { Reveal } from "./Reveal";
import { Waveform } from "@/components/visuals/Waveform";

/** Closing call to action used at the end of inner pages. */
export function CtaBand({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal className="relative isolate overflow-hidden rounded-[3rem] rounded-tl-[7rem] bg-brand-700 px-7 py-14 text-white sm:px-14 sm:py-16">
          {/* Architectural texture from the original site, tinted into the brand blue */}
          <Image src="/media/photos/abstract-arch.jpg" alt="" fill sizes="(min-width:1440px) 1300px, 100vw" className="-z-10 object-cover opacity-30 mix-blend-luminosity" />
          <div className="absolute inset-0 -z-10 bg-blueprint opacity-25 [filter:invert(1)]" />
          <div className="absolute -right-20 -top-24 -z-10 size-96 rounded-full bg-mt/25 blur-3xl" />
          <Waveform className="absolute bottom-6 right-8 -z-10 hidden h-24 w-[28rem] text-white opacity-60 lg:block" color="#7ee52a" />
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-mt">{dict.quote.eyebrow}</p>
              <h2 className="mt-3 text-balance font-display text-[clamp(2.1rem,4vw,3.6rem)] font-bold leading-[1.03] tracking-[-0.03em]">{dict.contact.title}</h2>
              <p className="mt-4 max-w-xl text-lg text-white/80">{dict.quote.lead}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
              <Link href={`/${lang}/contacto#cotizar`} className="group inline-flex items-center justify-center gap-3 rounded-full bg-white py-4 pl-7 pr-5 font-display text-lg font-bold text-brand-700 transition hover:bg-mt hover:text-brand-900">
                {dict.cta.quote}
                <ArrowRight weight="bold" className="size-5 transition group-hover:translate-x-1" />
              </Link>
              <a href={whatsappLink(dict.quote.waIntro)} target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-2.5 rounded-full bg-whatsapp px-6 py-4 font-display text-lg font-bold text-white">
                <WhatsappLogo weight="fill" className="size-6" /> WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
