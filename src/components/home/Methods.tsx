import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { methods } from "@/content/methods";
import { home } from "@/content/home";
import { cn } from "@/lib/cn";
import { MethodsScroll } from "./MethodsScroll";

/** The four NDT methods as a scroll-driven showcase. */
export function Methods({ lang, dict, className }: { lang: Locale; dict: Dictionary; className?: string }) {
  const s = dict.methodsSection;
  return (
    // overflow-x-clip (not hidden) keeps the sticky stage working
    <section id="metodos" className={cn("relative isolate overflow-x-clip bg-canvas", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-70 mask-fade-y" />
      <MethodsScroll
        base={`/${lang}/metodos`}
        t={{ eyebrow: s.eyebrow, title: s.title, lead: s.lead, step: s.step, detects: home.methods.detects[lang], details: dict.cta.details }}
        items={methods.map((m) => ({
          key: m.key,
          slug: m.slug,
          code: m.code,
          name: m.name[lang],
          tagline: m.tagline[lang],
          cover: m.cover,
          detects: m.detects[lang],
          steps: m.steps.map((x) => x.title[lang]),
        }))}
      />
    </section>
  );
}
