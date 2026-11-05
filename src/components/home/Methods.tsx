import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getBlock, getMediaAlts, getMethods } from "@/lib/data/content";
import { altFor } from "@/lib/media";
import { MethodsScroll } from "./MethodsScroll";

/** The four NDT methods over the scroll-scrubbed methods video. */
export async function Methods({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const [methods, home, alts] = await Promise.all([getMethods(), getBlock("home"), getMediaAlts()]);
  const s = dict.methodsSection;
  return (
    <MethodsScroll
      id="metodos"
      base={`/${lang}/metodos`}
      t={{ eyebrow: s.eyebrow, title: s.title, lead: s.lead, step: s.step, detects: home.methods.detects[lang], details: dict.cta.details }}
      items={methods.map((m) => ({
        key: m.key,
        slug: m.slug,
        code: m.code,
        name: m.name[lang],
        tagline: m.tagline[lang],
        cover: m.cover,
        coverAlt: altFor(m.cover, alts, lang, m.name[lang]),
        detects: m.detects[lang],
        steps: m.steps.map((x) => x.title[lang]),
      }))}
    />
  );
}
