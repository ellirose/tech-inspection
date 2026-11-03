import { ArrowsClockwise, ChatCircleText, ClipboardText, FileText, HardHat, Handshake, MagnifyingGlass, Scales } from "@phosphor-icons/react/ssr";
import type { Dictionary } from "@/i18n/dictionaries";
import { Container, IconBadge, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

const icons = [ClipboardText, MagnifyingGlass, FileText, Handshake, HardHat, ChatCircleText];

/** What happens after a request, from the general commercial procedure (PM-01-01). */
export function RequestFlow({ dict, index }: { dict: Dictionary; index?: string }) {
  const c = dict.contact;
  return (
    <section className="py-24 sm:py-28">
      <Container>
        <SectionHeading index={index} eyebrow={c.flowEyebrow} title={c.flowTitle} lead={c.flowLead} />
        <RevealGroup stagger={0.06} className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {c.flow.map((s, i) => (
            <RevealItem key={s.t} className="flex gap-5 rounded-[2rem] bg-surface p-6 shadow-soft ring-1 ring-line sm:p-7">
              <IconBadge icon={icons[i]} size="lg" tone={i === 0 ? "solid" : "brand"} />
              <div>
                <p className="font-mono text-sm text-mute">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 text-xl font-extrabold leading-tight tracking-tight text-ink">{s.t}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{s.d}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
        <Reveal className="mt-8 grid gap-5 lg:grid-cols-2">
          <p className="flex items-center gap-4 rounded-[2rem] bg-tint p-6 text-lg font-bold leading-snug text-ink">
            <ArrowsClockwise weight="duotone" className="size-8 shrink-0 text-accent" />
            {c.flowRecurring}
          </p>
          <p className="flex items-center gap-4 rounded-[2rem] bg-tint p-6 leading-snug text-ink-soft">
            <Scales weight="duotone" className="size-8 shrink-0 text-accent" />
            <span>
              <span className="block text-lg font-extrabold text-ink">{c.flowImpartialTitle}</span>
              {c.flowImpartial}
            </span>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
