// Which detail pages exist, for src/proxy.ts. A detail address with a slug nobody published
// (/es/clientes/no-existe) would otherwise render the page's "not found" view with status 200, because
// those pages stream; the proxy sends such addresses to the 404 page instead. The published slugs are
// kept in memory and reloaded at most once a minute, or sooner when an unknown slug is asked for, so a
// newly published item answers within seconds.
import { and, eq } from "drizzle-orm";
import { db, hasDatabase, schema } from "@/db";
import { industries } from "@/content/industries";
import { methods } from "@/content/methods";
import { services } from "@/content/services";

type Section = "servicios" | "metodos" | "industrias" | "clientes";
type Known = Record<Section, Set<string>>;

const TTL = 60_000;
const RETRY = 5_000;
let cache: { at: number; known: Known } | undefined;
let loading: Promise<void> | undefined;

async function load(): Promise<Known> {
  // Frontend-only deployment: the bundled content (no case studies).
  if (!hasDatabase) {
    return { servicios: new Set(services.map((s) => s.slug)), metodos: new Set(methods.map((m) => m.slug)), industrias: new Set(industries.map((i) => i.slug)), clientes: new Set() };
  }
  const published = "published" as const;
  const [svc, mth, ind, cases] = await Promise.all([
    db.select({ slug: schema.service.slug }).from(schema.service).where(eq(schema.service.status, published)),
    db.select({ slug: schema.method.slug }).from(schema.method).where(eq(schema.method.status, published)),
    db.select({ slug: schema.industry.slug }).from(schema.industry).where(eq(schema.industry.status, published)),
    db
      .select({ slug: schema.caseStudy.slug })
      .from(schema.caseStudy)
      .where(and(eq(schema.caseStudy.status, published), eq(schema.caseStudy.publishPermission, true))),
  ]);
  const set = (rows: { slug: string }[]) => new Set(rows.map((r) => r.slug));
  return { servicios: set(svc), metodos: set(mth), industrias: set(ind), clientes: set(cases) };
}

async function reload() {
  loading ??= load()
    .then((known) => {
      cache = { at: Date.now(), known };
    })
    .catch((error) => {
      // Keep the last good list; with none, let every page through rather than answer 404 by mistake.
      console.error("[known-pages] could not load:", (error as Error).message);
    })
    .finally(() => {
      loading = undefined;
    });
  await loading;
}

const DETAIL = /^\/(?:es|pt|en)\/(servicios|metodos|industrias|clientes)\/([^/]+)\/?$/;

/** True for a detail address whose slug is not published; false for anything else (or when unsure). */
export async function isMissingDetailPage(pathname: string): Promise<boolean> {
  const m = pathname.match(DETAIL);
  if (!m) return false;
  const section = m[1] as Section;
  let slug = m[2];
  try {
    slug = decodeURIComponent(slug);
  } catch {
    return true;
  }
  if (!cache || Date.now() - cache.at > TTL) await reload();
  if (!cache) return false;
  if (cache.known[section].has(slug)) return false;
  // Maybe published a moment ago: look again, at most every few seconds.
  if (Date.now() - cache.at > RETRY) await reload();
  return !cache.known[section].has(slug);
}
