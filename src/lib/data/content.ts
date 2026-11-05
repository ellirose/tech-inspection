// Public-site content reads. Every function is cached and tagged; admin mutations call updateTag()
// with the same tags so the site refreshes in seconds without a rebuild. Only published rows are returned
// (drafts too in preview, see visible()), in the editors' order, shaped exactly like the types the components
// already use. Without a database (frontend-only deployment) each one returns the bundled content instead.
import "server-only";
import { and, asc, eq, gte, isNull, or, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { db, hasDatabase, schema as s } from "@/db";
import type { PendingChanges } from "@/db/schema";
import { bundled } from "./bundled";
import type { PageBlockKey, PageBlocks } from "@/db/seed/blocks";
import type { L10n, L10nList } from "@/i18n/config";
import type { FaqCategory } from "@/content/faqs";
import type { Method, MethodKey } from "@/content/methods";
import type { Service, ServiceIcon } from "@/content/services";
import type { Certification, DocItem } from "@/content/site";

/** Cache tags, shared with the admin's revalidation calls. */
export const tags = {
  all: "content",
  site: "content:site",
  methods: "content:methods",
  services: "content:services",
  certifications: "content:certifications",
  clients: "content:clients",
  stats: "content:stats",
  team: "content:team",
  channels: "content:channels",
  documents: "content:documents",
  faqs: "content:faqs",
  industries: "content:industries",
  cases: "content:cases",
  media: "content:media",
  block: (key: PageBlockKey) => `content:block:${key}`,
} as const;

/**
 * Rows the current request may see: published ones, or every row while an editor previews the site
 * (draft mode, switched on from the admin). Draft mode makes the cached functions below run fresh on
 * each request and keeps their results out of the cache, so drafts never reach other visitors.
 */
async function visible(t: { status: PgColumn }) {
  const { isEnabled } = await draftMode();
  return isEnabled ? undefined : eq(t.status, "published");
}

/**
 * In preview, rows show the changes saved as a draft on top of their published version (the `pending`
 * column, see PendingChanges in db/schema.ts). Visitors always get the rows as published.
 */
async function withPending<T extends { pending: PendingChanges | null }>(query: PromiseLike<T[]>): Promise<T[]> {
  const rows = await query;
  if (!rows.some((r) => r.pending?.values) || !(await draftMode()).isEnabled) return rows;
  return rows.map((r) => (r.pending?.values ? { ...r, ...(r.pending.values as Partial<T>) } : r));
}

/** In preview, the methods of services whose draft changes them, by service id. */
async function draftMethodKeys(rows: { id: string; pending: PendingChanges | null }[]) {
  const out = new Map<string, MethodKey[]>();
  const drafted = rows.filter((r) => r.pending?.methodIds);
  if (!drafted.length || !(await draftMode()).isEnabled) return out;
  const keys = new Map((await db.select({ id: s.method.id, key: s.method.key }).from(s.method)).map((m) => [m.id, m.key as MethodKey]));
  for (const r of drafted) out.set(r.id, r.pending!.methodIds!.map((id) => keys.get(id)).filter((k) => k !== undefined));
  return out;
}

export async function getSite() {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.site);
  if (!hasDatabase) return bundled.site();
  const [row] = await db.select().from(s.siteSettings).limit(1);
  if (!row) throw new Error("site_settings is empty: run `npm run db:seed`");
  return row.data;
}

export async function getMethods(): Promise<Method[]> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.methods);
  if (!hasDatabase) return bundled.methods();
  const rows = await withPending(db.select().from(s.method).where(await visible(s.method)).orderBy(asc(s.method.sortOrder)));
  return rows.map((m) => ({
    key: m.key as MethodKey,
    slug: m.slug,
    code: m.code,
    name: m.name,
    tagline: m.tagline,
    intro: m.intro,
    body: m.body,
    advantages: m.advantages,
    detects: m.detects,
    steps: m.steps,
    cover: m.cover,
    gallery: m.gallery,
    ...(m.video ? { video: m.video } : {}),
  }));
}

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.services, tags.methods);
  if (!hasDatabase) return bundled.services();
  const [rows, links] = await Promise.all([
    withPending(db.select().from(s.service).where(await visible(s.service)).orderBy(asc(s.service.sortOrder))),
    db
      .select({ serviceId: s.serviceMethod.serviceId, key: s.method.key })
      .from(s.serviceMethod)
      .innerJoin(s.method, and(eq(s.method.id, s.serviceMethod.methodId), await visible(s.method)))
      .orderBy(asc(s.serviceMethod.sortOrder)),
  ]);
  const drafted = await draftMethodKeys(rows);
  return rows.map((r) => ({
    slug: r.slug,
    icon: r.icon as ServiceIcon,
    image: r.image,
    gallery: r.gallery,
    name: r.name,
    short: r.short,
    body: r.body,
    scope: r.scope,
    methods: drafted.get(r.id) ?? links.filter((l) => l.serviceId === r.id).map((l) => l.key as MethodKey),
    ...(r.needsReview ? { draft: true } : {}),
  }));
}

/** One published service (or draft, in preview) by slug, with its search-result overrides; null when missing or a draft.
 * Detail pages use this rather than getServices(): a slug that was not prerendered is rendered from a
 * fallback page built with the data of that time, and only a lookup keyed by the slug is fetched fresh.
 */
export async function getService(slug: string): Promise<(Service & { seo: SeoOverride }) | null> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.services, tags.methods);
  if (!hasDatabase) {
    const svc = bundled.services().find((x) => x.slug === slug);
    return svc ? { ...svc, seo: { title: null, description: null } } : null;
  }
  const [row] = await withPending(
    db
      .select()
      .from(s.service)
      .where(and(await visible(s.service), eq(s.service.slug, slug))),
  );
  if (!row) return null;
  const links = await db
    .select({ key: s.method.key })
    .from(s.serviceMethod)
    .innerJoin(s.method, and(eq(s.method.id, s.serviceMethod.methodId), await visible(s.method)))
    .where(eq(s.serviceMethod.serviceId, row.id))
    .orderBy(asc(s.serviceMethod.sortOrder));
  return {
    slug: row.slug,
    icon: row.icon as ServiceIcon,
    image: row.image,
    gallery: row.gallery,
    name: row.name,
    short: row.short,
    body: row.body,
    scope: row.scope,
    methods: (await draftMethodKeys([row])).get(row.id) ?? links.map((l) => l.key as MethodKey),
    ...(row.needsReview ? { draft: true } : {}),
    seo: { title: row.seoTitle, description: row.seoDescription },
  };
}

/** Published certifications that have not expired. Refreshed daily so an expiry takes effect on its own. */
export async function getCertifications() {
  "use cache";
  cacheLife("days");
  cacheTag(tags.all, tags.certifications);
  if (!hasDatabase) return bundled.certifications();
  const rows = await withPending(
    db
      .select()
      .from(s.certification)
      .where(and(await visible(s.certification), or(isNull(s.certification.expiryDate), gte(s.certification.expiryDate, sql`current_date`))))
      .orderBy(asc(s.certification.sortOrder)),
  );
  const system: Certification[] = rows
    .filter((r) => r.kind === "system")
    .map((r) => ({ id: r.key, code: r.code, ring: r.ring ?? "", title: r.title, body: r.body, certifier: r.certifier ?? undefined, certificateNumber: r.certificateNumber ?? undefined }));
  const personnel = rows
    .filter((r) => r.kind === "personnel")
    .map((r) => ({ code: r.code, title: r.title, body: r.body }));
  return { system, personnel };
}

/** Client logos the client has cleared for publication. */
export async function getClients(): Promise<{ name: string; logo: string; square?: boolean }[]> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.clients);
  if (!hasDatabase) return bundled.clients();
  const rows = await withPending(
    db
      .select()
      .from(s.client)
      .where(and(await visible(s.client), eq(s.client.showLogo, true)))
      .orderBy(asc(s.client.sortOrder)),
  );
  return rows.map((c) => ({ name: c.name, logo: c.logo, ...(c.square ? { square: true } : {}) }));
}

export async function getStats(): Promise<{ value: number; prefix?: string; label: L10n }[]> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.stats);
  if (!hasDatabase) return bundled.stats();
  const rows = await withPending(db.select().from(s.stat).where(await visible(s.stat)).orderBy(asc(s.stat.sortOrder)));
  return rows.map((r) => ({ value: r.value, ...(r.prefix ? { prefix: r.prefix } : {}), label: r.label }));
}

export async function getLeadership() {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.team);
  if (!hasDatabase) return bundled.leadership();
  const rows = await withPending(
    db
      .select()
      .from(s.teamMember)
      .where(and(await visible(s.teamMember), eq(s.teamMember.isLeadership, true)))
      .orderBy(asc(s.teamMember.sortOrder)),
  );
  return rows.map((p) => ({ name: p.name, photo: p.photo ?? "", email: p.email ?? "", role: p.role, bio: p.bio ?? p.role }));
}

export async function getChannels() {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.channels);
  if (!hasDatabase) return bundled.channels();
  const rows = await withPending(
    db
      .select()
      .from(s.contactChannel)
      .where(await visible(s.contactChannel))
      .orderBy(asc(s.contactChannel.sortOrder)),
  );
  return rows.map((c) => ({ role: c.role, scope: c.scope, phone: c.phone, email: c.email }));
}

export type CompanyDocument = DocItem & { thumbnail?: string };

export async function getDocuments(kind: "policy" | "accountability"): Promise<CompanyDocument[]> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.documents);
  if (!hasDatabase) return bundled.documents(kind);
  const rows = await withPending(
    db
      .select()
      .from(s.companyDocument)
      .where(and(await visible(s.companyDocument), eq(s.companyDocument.kind, kind)))
      .orderBy(asc(s.companyDocument.sortOrder)),
  );
  return rows.map((d) => ({
    code: d.code,
    title: d.title,
    file: d.fileUrl,
    ...(d.year ? { year: d.year } : {}),
    ...(d.thumbnail ? { thumbnail: d.thumbnail } : {}),
  }));
}

export type SeoOverride = { title: L10n | null; description: L10n | null };

/** Search-result title and description set in the admin for service and method pages, by slug. */
export async function getSeoOverrides(): Promise<{ services: Record<string, SeoOverride>; methods: Record<string, SeoOverride> }> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.services, tags.methods);
  if (!hasDatabase) {
    const none = (items: { slug: string }[]) => Object.fromEntries(items.map((x) => [x.slug, { title: null, description: null }]));
    return { services: none(bundled.services()), methods: none(bundled.methods()) };
  }
  const pick ={ slug: s.service.slug, title: s.service.seoTitle, description: s.service.seoDescription };
  const [services, methods] = await Promise.all([
    db.select(pick).from(s.service),
    db.select({ slug: s.method.slug, title: s.method.seoTitle, description: s.method.seoDescription }).from(s.method),
  ]);
  const bySlug = (rows: { slug: string; title: L10n | null; description: L10n | null }[]) => Object.fromEntries(rows.map(({ slug, ...seo }) => [slug, seo]));
  return { services: bySlug(services), methods: bySlug(methods) };
}

export async function getBlock<K extends PageBlockKey>(key: K): Promise<PageBlocks[K]> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.block(key));
  if (!hasDatabase) return bundled.block(key);
  const [row] = await db
    .select({ data: s.pageBlock.data, pending: s.pageBlock.pending })
    .from(s.pageBlock)
    .where(and(eq(s.pageBlock.key, key), await visible(s.pageBlock)));
  if (!row) throw new Error(`page_block "${key}" is missing: run \`npm run db:seed\``);
  // In preview, a draft saved on the section shows instead of the published version.
  const draft = row.pending?.data !== undefined && (await draftMode()).isEnabled;
  return (draft ? row.pending!.data : row.data) as PageBlocks[K];
}

// --- FAQs, industries and case studies ------------------------------------------------------

export type FaqItem = { category: FaqCategory; question: L10n; answer: L10n; methods: string[]; services: string[]; home: boolean };
export type IndustryItem = {
  slug: string;
  name: L10n;
  intro: L10n;
  components: L10nList;
  image: string | null;
  services: string[];
  methods: string[];
  seo: SeoOverride;
};
export type CaseItem = {
  slug: string;
  title: L10n;
  clientName: string | null;
  sector: L10n | null;
  challenge: L10n;
  solution: L10n;
  outcomes: L10nList | null;
  images: string[];
  industries: string[];
  services: string[];
  methods: string[];
};

/** Published questions, in the editors' order. */
export async function getFaqs(): Promise<FaqItem[]> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.faqs);
  if (!hasDatabase) return bundled.faqs();
  const rows = await withPending(db.select().from(s.faq).where(await visible(s.faq)).orderBy(asc(s.faq.sortOrder)));
  return rows.map((r) => ({ category: r.category as FaqCategory, question: r.question, answer: r.answer, methods: r.methodKeys, services: r.serviceSlugs, home: r.showOnHome }));
}

export async function getIndustries(): Promise<IndustryItem[]> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.industries);
  if (!hasDatabase) return bundled.industries();
  const rows = await withPending(db.select().from(s.industry).where(await visible(s.industry)).orderBy(asc(s.industry.sortOrder)));
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    intro: r.intro,
    components: r.components,
    image: r.image,
    services: r.serviceSlugs,
    methods: r.methodKeys,
    seo: { title: r.seoTitle, description: r.seoDescription },
  }));
}

/** Case studies the client has cleared for publication. */
export async function getCases(): Promise<CaseItem[]> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.cases);
  if (!hasDatabase) return [];
  const rows = await withPending(
    db
      .select()
      .from(s.caseStudy)
      .where(and(await visible(s.caseStudy), eq(s.caseStudy.publishPermission, true)))
      .orderBy(asc(s.caseStudy.sortOrder)),
  );
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    clientName: r.clientName,
    sector: r.sector,
    challenge: r.challenge,
    solution: r.solution,
    outcomes: r.outcomes,
    images: r.images,
    industries: r.industrySlugs,
    services: r.serviceSlugs,
    methods: r.methodKeys,
  }));
}

/**
 * Spanish descriptions written in Medios, by file path ({"/media/uploads/2026/foto-....webp": "Inspector midiendo..."}).
 * Pages use them as the alt text of uploaded photos (see describe() in lib/media.ts).
 */
export async function getMediaAlts(): Promise<Record<string, string>> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.media);
  if (!hasDatabase) return {};
  const rows = await db.select({ url: s.media.url, alt: s.media.alt }).from(s.media).where(sql`${s.media.alt} is not null`);
  return Object.fromEntries(rows.filter((r) => r.alt).map((r) => [r.url, r.alt as string]));
}

