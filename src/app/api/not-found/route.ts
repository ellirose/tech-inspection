// Records an address that answered 404 (sent by the 404 page itself, so only real browsers count, not
// asset probes). Shown under Redirecciones for the weeks after the move from Wix. Keeps the path and the
// referring site's host only. Same-origin, size-checked and rate limited like the other public endpoints.
import { lt, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { db, hasDatabase, schema } from "@/db";
import { hit, visitorKey } from "@/lib/rate-limit";

const t = schema.notFoundHit;
const limits = [{ name: "404:10m", max: 30, windowSeconds: 600 }];
const input = z.object({ path: z.string().regex(/^\/[^\s]*$/).max(300), referrer: z.string().max(500).optional() });

const clientIp = (request: NextRequest) => request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

/** Host of the referring page, without the path (which can carry search terms or personal data). */
function referrerHost(referrer: string | undefined, ownHost: string | null) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).host;
    return host && host !== ownHost ? host.slice(0, 120) : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const none = new Response(null, { status: 204 });
  if (!hasDatabase) return none;
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.headers.get("host")) return new Response(null, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 2048) return new Response(null, { status: 413 });

  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 422 });
  if (!(await hit(visitorKey(clientIp(request)), limits)).ok) return none;

  let path = parsed.data.path.split(/[?#]/)[0];
  try {
    path = decodeURIComponent(path);
  } catch {}
  const referrer = referrerHost(parsed.data.referrer, request.headers.get("host"));
  await db
    .insert(t)
    .values({ path, referrer })
    .onConflictDoUpdate({ target: t.path, set: { hits: sql`${t.hits} + 1`, lastSeen: new Date(), ...(referrer ? { referrer } : {}) } });
  // Now and then, forget addresses nobody has asked for in 90 days.
  if (Math.random() < 0.02) await db.delete(t).where(lt(t.lastSeen, new Date(Date.now() - 90 * 86_400_000)));
  return none;
}
