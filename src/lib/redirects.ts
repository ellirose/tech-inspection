// Redirect lookup for src/proxy.ts. Active rows of the `redirect` table are kept in memory and
// reloaded at most once a minute, so admin edits apply within a minute without a query per request.
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

type Target = { to: string; status: number };
const TTL = 60_000;
let cache: { at: number; map: Map<string, Target> } | undefined;
let loading: Promise<Map<string, Target>> | undefined;

async function load() {
  const rows = await db
    .select({ from: schema.redirect.fromPath, to: schema.redirect.toPath, status: schema.redirect.statusCode })
    .from(schema.redirect)
    .where(eq(schema.redirect.active, true));
  return new Map(rows.map((r) => [normalisePath(r.from), { to: r.to, status: r.status }]));
}

/** Decoded, lower-case, without a trailing slash: how paths are compared. */
export function normalisePath(path: string) {
  let p = path;
  try {
    p = decodeURIComponent(path);
  } catch {}
  p = p.toLowerCase();
  return p.length > 1 ? p.replace(/\/+$/, "") : p;
}

export async function findRedirect(pathname: string): Promise<Target | undefined> {
  if (!cache || Date.now() - cache.at > TTL) {
    loading ??= load()
      .then((map) => {
        cache = { at: Date.now(), map };
        return map;
      })
      .catch((error) => {
        // Keep serving the last good list rather than failing every page.
        console.error("[redirects] could not load:", (error as Error).message);
        return cache?.map ?? new Map<string, Target>();
      })
      .finally(() => {
        loading = undefined;
      });
    await loading;
  }
  return cache?.map.get(normalisePath(pathname));
}
