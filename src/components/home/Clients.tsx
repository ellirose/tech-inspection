import Image from "next/image";
import { Handshake } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { clients, keyPartner } from "@/content/site";
import { Container, Eyebrow, IconBadge } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

/** Ulterra (named in the deck, no logo supplied) as a featured tile, then a drifting row of client logos. */
export function Clients({ lang, dict, className }: { lang: Locale; dict: Dictionary; className?: string }) {
  const since = { es: "Aliado desde", pt: "Aliado desde", en: "Partner since" }[lang];
  return (
    <section className={cn("relative bg-surface py-16 sm:py-20", className)}>
      <Container className="grid items-center gap-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <Eyebrow>{dict.ui.clients}</Eyebrow>
          <div className="mt-6 flex items-center gap-5 rounded-[2rem] rounded-tr-[4rem] bg-brand-600 p-6 text-white shadow-float dark:bg-brand-700">
            <IconBadge icon={Handshake} size="lg" tone="lime" className="ring-0" />
            <div>
              <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-lime">
                {since} {keyPartner.since}
              </p>
              <p className="mt-1 text-2xl font-extrabold leading-tight tracking-tight">{keyPartner.name}</p>
            </div>
          </div>
        </Reveal>
        <div className="overflow-hidden mask-fade-x lg:col-span-8">
          <div className="flex w-max animate-marquee items-center gap-4 py-4 hover:[animation-play-state:paused] motion-reduce:animate-none">
            {[...clients, ...clients].map((c, i) => (
              <div key={i} className="flex h-28 w-60 shrink-0 items-center justify-center rounded-[1.75rem] bg-white px-7 shadow-soft ring-1 ring-line">
                <Image src={c.logo} alt={i < clients.length ? c.name : ""} width={220} height={120} loading="eager" className={cn("object-contain", c.square ? "size-20" : "max-h-16 w-auto")} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
