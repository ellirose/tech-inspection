// Fixed-window rate limiting stored in PostgreSQL, so every app instance shares the counters without
// another service to run. At this site's volume (tens of submissions a month) one upsert per request
// is negligible; move it to Redis only if public endpoints start taking real traffic.
import "server-only";
import { createHash } from "node:crypto";
import { lt, sql } from "drizzle-orm";
import { db as defaultDb, schema, type Db } from "@/db";

export type Limit = { name: string; max: number; windowSeconds: number };
export type LimitResult = { ok: true } | { ok: false; retryAfter: number };

/** Hashes the visitor's address so the table never holds an IP. */
export const visitorKey = (ip: string) => createHash("sha256").update(`ti:${ip}`).digest("hex").slice(0, 32);

/** Counts one hit against every limit; fails on the first limit that is exceeded. */
export async function hit(subject: string, limits: Limit[], db: Db = defaultDb): Promise<LimitResult> {
  const t = schema.rateLimit;
  for (const limit of limits) {
    const resetAt = new Date(Date.now() + limit.windowSeconds * 1000);
    const [row] = await db
      .insert(t)
      .values({ key: `${limit.name}:${subject}`, count: 1, resetAt })
      .onConflictDoUpdate({
        target: t.key,
        set: {
          // A finished window starts over at 1; otherwise count up within the same window.
          count: sql`case when ${t.resetAt} <= now() then 1 else ${t.count} + 1 end`,
          resetAt: sql`case when ${t.resetAt} <= now() then excluded.reset_at else ${t.resetAt} end`,
        },
      })
      .returning({ count: t.count, resetAt: t.resetAt });
    if (row.count > limit.max) return { ok: false, retryAfter: Math.max(1, Math.ceil((row.resetAt.getTime() - Date.now()) / 1000)) };
  }
  return { ok: true };
}

/** Drops windows that ended more than a day ago. */
export async function pruneRateLimits(db: Db = defaultDb) {
  await db.delete(schema.rateLimit).where(lt(schema.rateLimit.resetAt, sql`now() - interval '1 day'`));
}
