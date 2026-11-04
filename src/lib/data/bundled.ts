// The public-site content as bundled in the code (src/content and the seed's page blocks), shaped like
// the database reads in content.ts. Used when no database is configured, e.g. a frontend-only Vercel
// preview; it mirrors what `npm run db:seed` loads, so such a deployment shows the seeded site.
import "server-only";
import type { SiteSettings } from "@/db/schema";
import type { PageBlockKey, PageBlocks } from "@/db/seed/blocks";
import { blocks, homeBlock } from "@/db/seed/blocks";
import { home } from "@/content/home";
import { methods } from "@/content/methods";
import { services } from "@/content/services";
import {
  FOUNDED,
  PLATFORM_URL,
  YEARS,
  accountabilityDocs,
  certifications,
  channels,
  clients,
  company,
  keyPartner,
  leadership,
  personnelCredentials,
  policyDocs,
} from "@/content/site";

// Same as the seed: the one document thumbnail that was hard-coded on the HSEQ page.
const docThumbnails: Record<string, string> = { "PL-09-1": "/media/hseq/data-protection.jpg" };

export const bundled = {
  site: (): SiteSettings => ({ company, founded: FOUNDED, years: YEARS, platformUrl: PLATFORM_URL, keyPartner }),
  methods: () => methods,
  services: () => services,
  certifications: () => ({
    system: certifications.map((c) => ({ id: c.id, code: c.code, ring: c.ring ?? "", title: c.title, body: c.body, certifier: c.certifier, certificateNumber: c.certificateNumber })),
    personnel: personnelCredentials.map((c) => ({ code: c.code, title: c.title, body: c.body })),
  }),
  clients: () => clients.map((c) => ({ name: c.name, logo: c.logo, ...(c.square ? { square: true } : {}) })),
  stats: () => home.hero.stats.map((s) => ({ value: s.value, ...("prefix" in s && s.prefix ? { prefix: s.prefix } : {}), label: s.label })),
  leadership: () => leadership.map((p) => ({ name: p.name, photo: p.photo ?? "", email: p.email ?? "", role: p.role, bio: p.bio ?? p.role })),
  channels: () => channels.map((c) => ({ role: c.role, scope: c.scope, phone: c.phone, email: c.email })),
  documents: (kind: "policy" | "accountability") =>
    kind === "policy"
      ? policyDocs.map((d) => ({ code: d.code, title: d.title, file: d.file, ...(docThumbnails[d.code] ? { thumbnail: docThumbnails[d.code] } : {}) }))
      : accountabilityDocs.map((d) => ({ code: d.code, title: d.title, file: d.file, ...(d.year ? { year: d.year } : {}) })),
  block: <K extends PageBlockKey>(key: K) => ((key === "home" ? homeBlock : blocks[key as Exclude<PageBlockKey, "home">]) as PageBlocks[K]),
};
