import { Plus } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { FaqItem } from "@/lib/data/content";

/**
 * Questions as an accessible accordion built on <details>: the answers are real HTML in the page (for
 * search and answer engines, design document §16.4) and open without JavaScript.
 */
export function FaqList({ items, lang, open }: { items: FaqItem[]; lang: Locale; open?: number }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-[2rem] bg-surface shadow-card ring-1 ring-line">
      {items.map((f, i) => (
        <details key={f.question.es} open={i === open} className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-5 px-6 py-5 text-left transition hover:bg-tint/50 sm:px-8 [&::-webkit-details-marker]:hidden">
            <h3 className="text-lg font-extrabold leading-snug tracking-tight text-ink sm:text-xl">{f.question[lang]}</h3>
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-tint text-neon ring-1 ring-neon/25 transition group-open:rotate-45">
              <Plus weight="bold" className="size-4" />
            </span>
          </summary>
          <div className="space-y-3 px-6 pb-6 text-[1.05rem] leading-relaxed text-ink-soft sm:px-8">
            {f.answer[lang].split(/\n{2,}/).map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
