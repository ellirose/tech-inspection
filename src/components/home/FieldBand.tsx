import type { Dictionary } from "@/i18n/dictionaries";
import { Container, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { FieldMonitor } from "@/components/visuals/FieldMonitor";

/** Inset video band: cinematic welding loop behind real field footage of MT and PT. */
export function FieldBand({ dict }: { dict: Dictionary }) {
  const f = dict.field;
  return (
    <section className="relative py-10 sm:py-16">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[3rem] rounded-bl-[7rem] px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
          <video
            src="/media/video/welding-loop.mp4"
            poster="/media/photos/workshop-team.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 -z-20 size-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-800/80 via-brand-700/55 to-brand-600/15" />
          <div className="absolute inset-0 -z-10 bg-blueprint opacity-20 [filter:invert(1)]" />

          <div className="grid items-center gap-12 lg:grid-cols-12">
            <Reveal className="text-white lg:col-span-5">
              <Eyebrow tone="light">{f.eyebrow}</Eyebrow>
              <h2 className="mt-5 text-balance font-display text-[clamp(2.3rem,4.4vw,4rem)] font-bold leading-[1.02] tracking-[-0.03em]">{f.title}</h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/85">{f.lead}</p>
            </Reveal>
            <div className="relative grid gap-5 sm:grid-cols-2 lg:col-span-7">
              <Reveal delay={0.1} className="sm:translate-y-8">
                <FieldMonitor src="/media/video/mt-field.mp4" poster="/media/methods/mt-6.jpg" label={f.recMt} />
              </Reveal>
              <Reveal delay={0.2} className="sm:-translate-y-6">
                <FieldMonitor src="/media/video/pt-field.mp4" poster="/media/methods/pt-1.jpg" label={f.recPt} tone="#ff8796" />
              </Reveal>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
