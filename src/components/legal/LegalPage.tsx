import type { Locale } from "@/i18n/config";
import { Container } from "@/components/ui/Section";

type Section = { h: string; p?: string[]; list?: string[] };

const date = (lang: Locale, iso: string) =>
  new Intl.DateTimeFormat({ es: "es-CO", pt: "pt-BR", en: "en-GB" }[lang], { dateStyle: "long", timeZone: "UTC" }).format(new Date(iso));

/** Long-form legal text: numbered sections in a readable column, with the revision date. */
export function LegalBody({ lang, sections, updatedLabel, updated, children }: { lang: Locale; sections: Section[]; updatedLabel: string; updated: string; children?: React.ReactNode }) {
  return (
    <section className="pb-20 sm:pb-28">
      <Container>
        <div className="mx-auto max-w-3xl rounded-[2.25rem] bg-surface p-7 shadow-card ring-1 ring-line sm:p-12">
          <p className="font-mono text-sm font-bold text-mute">
            {updatedLabel}: {date(lang, updated)}
          </p>
          {children}
          <div className="mt-8 space-y-10">
            {sections.map((s, i) => (
              <div key={s.h}>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink">
                  <span className="mr-3 font-mono text-base text-neon">{String(i + 1).padStart(2, "0")}</span>
                  {s.h}
                </h2>
                {s.p?.map((p) => (
                  <p key={p.slice(0, 40)} className="mt-3 text-[1.05rem] leading-relaxed text-ink-soft">
                    {p}
                  </p>
                ))}
                {s.list && (
                  <ul className="mt-3 list-disc space-y-1.5 pl-6 text-[1.05rem] leading-relaxed text-ink-soft marker:text-neon">
                    {s.list.map((li) => (
                      <li key={li}>{li}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
