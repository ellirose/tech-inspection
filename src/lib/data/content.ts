// Public-site content reads. Every function is cached and tagged; admin mutations call updateTag()
// with the same tags so the site refreshes in seconds without a rebuild. Only published rows are returned,
// in the editors' order, shaped exactly like the types the components already use.
import "server-only";
import { and, asc, eq, gte, isNull, or, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { cacheLife, cacheTag } from "next/cache";
import { db, schema as s } from "@/db";
import type { PageBlockKey, PageBlocks } from "@/db/seed/blocks";
import type { L10n } from "@/i18n/config";
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
  block: (key: PageBlockKey) => `content:block:${key}`,
} as const;

const published = (t: { status: PgColumn }) => eq(t.status, "published");

export async function getSite() {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.site);
  const [row] = await db.select().from(s.siteSettings).limit(1);
  if (!row) throw new Error("site_settings is empty: run `npm run db:seed`");
  return row.data;
}

export async function getMethods(): Promise<Method[]> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.methods);
  const rows = await db.select().from(s.method).where(published(s.method)).orderBy(asc(s.method.sortOrder));
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
  const [rows, links] = await Promise.all([
    db.select().from(s.service).where(published(s.service)).orderBy(asc(s.service.sortOrder)),
    db
      .select({ serviceId: s.serviceMethod.serviceId, key: s.method.key })
      .from(s.serviceMethod)
      .innerJoin(s.method, and(eq(s.method.id, s.serviceMethod.methodId), eq(s.method.status, "published")))
      .orderBy(asc(s.serviceMethod.sortOrder)),
  ]);
  return rows.map((r) => ({
    slug: r.slug,
    icon: r.icon as ServiceIcon,
    image: r.image,
    gallery: r.gallery,
    name: r.name,
    short: r.short,
    body: r.body,
    scope: r.scope,
    methods: links.filter((l) => l.serviceId === r.id).map((l) => l.key as MethodKey),
    ...(r.needsReview ? { draft: true } : {}),
  }));
}

/** One published service by slug, with its search-result overrides; null when missing or a draft.
 * Detail pages use this rather than getServices(): a slug that was not prerendered is rendered from a
 * fallback page built with the data of that time, and only a lookup keyed by the slug is fetched fresh.
 */
export async function getService(slug: string): Promise<(Service & { seo: SeoOverride }) | null> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.services, tags.methods);
  const [row] = await db
    .select()
    .from(s.service)
    .where(and(published(s.service), eq(s.service.slug, slug)));
  if (!row) return null;
  const links = await db
    .select({ key: s.method.key })
    .from(s.serviceMethod)
    .innerJoin(s.method, and(eq(s.method.id, s.serviceMethod.methodId), eq(s.method.status, "published")))
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
    methods: links.map((l) => l.key as MethodKey),
    ...(row.needsReview ? { draft: true } : {}),
    seo: { title: row.seoTitle, description: row.seoDescription },
  };
}

/** Published certifications that have not expired. Refreshed daily so an expiry takes effect on its own. */
export async function getCertifications() {
  "use cache";
  cacheLife("days");
  cacheTag(tags.all, tags.certifications);
  const rows = await db
    .select()
    .from(s.certification)
    .where(and(published(s.certification), or(isNull(s.certification.expiryDate), gte(s.certification.expiryDate, sql`current_date`))))
    .orderBy(asc(s.certification.sortOrder));
  const system: Certification[] = rows
    .filter((r) => r.kind === "system")
    .map((r) => ({ id: r.key, code: r.code, ring: r.ring ?? "", title: r.title, body: r.body }));
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
  const rows = await db
    .select()
    .from(s.client)
    .where(and(published(s.client), eq(s.client.showLogo, true)))
    .orderBy(asc(s.client.sortOrder));
  return rows.map((c) => ({ name: c.name, logo: c.logo, ...(c.square ? { square: true } : {}) }));
}

export async function getStats(): Promise<{ value: number; prefix?: string; label: L10n }[]> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.stats);
  const rows = await db.select().from(s.stat).where(published(s.stat)).orderBy(asc(s.stat.sortOrder));
  return rows.map((r) => ({ value: r.value, ...(r.prefix ? { prefix: r.prefix } : {}), label: r.label }));
}

export async function getLeadership() {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.team);
  const rows = await db
    .select()
    .from(s.teamMember)
    .where(and(published(s.teamMember), eq(s.teamMember.isLeadership, true)))
    .orderBy(asc(s.teamMember.sortOrder));
  return rows.map((p) => ({ name: p.name, photo: p.photo ?? "", email: p.email ?? "", role: p.role, bio: p.bio ?? p.role }));
}

export async function getChannels() {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.channels);
  const rows = await db
    .select()
    .from(s.contactChannel)
    .where(published(s.contactChannel))
    .orderBy(asc(s.contactChannel.sortOrder));
  return rows.map((c) => ({ role: c.role, scope: c.scope, phone: c.phone, email: c.email }));
}

export type CompanyDocument = DocItem & { thumbnail?: string };

export async function getDocuments(kind: "policy" | "accountability"): Promise<CompanyDocument[]> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.all, tags.documents);
  const rows = await db
    .select()
    .from(s.companyDocument)
    .where(and(published(s.companyDocument), eq(s.companyDocument.kind, kind)))
    .orderBy(asc(s.companyDocument.sortOrder));
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
  const pick = { slug: s.service.slug, title: s.service.seoTitle, description: s.service.seoDescription };
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
  const [row] = await db
    .select({ data: s.pageBlock.data })
    .from(s.pageBlock)
    .where(and(eq(s.pageBlock.key, key), eq(s.pageBlock.status, "published")));
  if (!row) throw new Error(`page_block "${key}" is missing: run \`npm run db:seed\``);
  return row.data as PageBlocks[K];
}
