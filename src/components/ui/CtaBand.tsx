import { WhatsappLogo } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { company, whatsappLink } from "@/content/site";
import { Container, Eyebrow, Swoosh } from "./Section";
import { Reveal } from "./Reveal";
import { ButtonLink } from "./Button";
import { BackgroundVideo } from "@/components/media/BackgroundVideo";

/** Closing call to action used at the end of inner pages: a cobalt card with a photo inset. */
export function CtaBand({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <Reveal className="relative isolate grid overflow-hidden rounded-[2.5rem] bg-brand-600 text-white shadow-float sm:rounded-[3.5rem] lg:grid-cols-12 dark:bg-brand-700">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-network opacity-50" />
          <Swoosh className="absolute -bottom-10 -left-20 -z-10 w-[36rem] text-neon" />
          <div className="p-8 sm:p-14 lg:col-span-7">
            <Eyebrow tone="onImage">{dict.quote.eyebrow}</Eyebrow>
            <h2 className="mt-6 text-balance text-[clamp(2.1rem,4vw,3.6rem)] font-extrabold leading-[1.04] tracking-[-0.035em]">{dict.contact.title}</h2>
            <p className="mt-5 max-w-xl text-lg text-white/80 sm:text-xl">{dict.quote.lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={`/${lang}/contacto#cotizar`} variant="light">
                {dict.cta.quote}
              </ButtonLink>
              <ButtonLink href={whatsappLink(dict.quote.waIntro)} variant="whatsapp" icon={<WhatsappLogo weight="fill" className="size-6" />}>
                {company.whatsappDisplay}
              </ButtonLink>
            </div>
          </div>
          <div className="relative min-h-64 lg:col-span-5">
            <div className="absolute inset-4 overflow-hidden rounded-[2rem] sm:inset-6 lg:left-0 lg:rounded-[2.5rem] lg:rounded-tl-[6rem]">
              <BackgroundVideo src="/media/video/pipe-detail.mp4" poster="/media/video/pipe-detail.jpg" className="absolute inset-0 size-full" />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
