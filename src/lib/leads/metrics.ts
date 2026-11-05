// Lead metrics for the admin dashboard (design document §18.2): by source, status (and the share won),
// service and urgency over a window, a monthly count, and how many chatbot conversations end in a lead.
// Read straight from the database; callers check the role first.
import "server-only";
import { count, gte, sql } from "drizzle-orm";
import { db, schema } from "@/db";

const l = schema.lead;
export type Bar = { key: string; n: number };

export async function leadMetrics(days = 90) {
  const since = sql`now() - make_interval(days => ${days})`;
  const [bySource, byStatus, byUrgency, byService, monthly, [chats]] = await Promise.all([
    db.select({ key: l.source, n: count() }).from(l).where(gte(l.createdAt, since)).groupBy(l.source),
    db.select({ key: l.status, n: count() }).from(l).where(gte(l.createdAt, since)).groupBy(l.status),
    db.select({ key: sql<string>`coalesce(${l.urgency}::text, 'none')`, n: count() }).from(l).where(gte(l.createdAt, since)).groupBy(sql`1`),
    db.execute<{ key: string; n: number }>(
      sql`select s.slug as key, count(*)::int as n from ${l}, jsonb_array_elements_text(${l.services}) as s(slug) where ${l.createdAt} >= ${since} group by 1 order by 2 desc limit 8`,
    ),
    db.execute<{ key: string; n: number }>(
      sql`select to_char(m, 'YYYY-MM') as key, count(${l.id})::int as n
          from generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') as m
          left join ${l} on date_trunc('month', ${l.createdAt}) = m
          group by m order by m`,
    ),
    db
      .select({ total: count(), withLead: sql<number>`count(${schema.chatConversation.leadReference})::int` })
      .from(schema.chatConversation)
      .where(gte(schema.chatConversation.createdAt, since)),
  ]);
  const total = bySource.reduce((s, r) => s + r.n, 0);
  const won = byStatus.find((r) => r.key === "won")?.n ?? 0;
  const desc = (rows: Bar[]) => [...rows].sort((a, b) => b.n - a.n);
  return {
    days,
    total,
    won,
    bySource: desc(bySource),
    byStatus: byStatus as Bar[],
    byUrgency: desc(byUrgency),
    byService: byService.rows as Bar[],
    monthly: monthly.rows as Bar[],
    chats: { total: chats.total, withLead: chats.withLead },
  };
}
