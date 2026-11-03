// Conversation log for the admin (Conversaciones): newest first, 30 per page.
import "server-only";
import { count, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";

const c = schema.chatConversation;
const PAGE_SIZE = 30;

export async function listConversations(page = 1) {
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: c.id,
        lang: c.lang,
        page: c.page,
        updatedAt: c.updatedAt,
        leadReference: c.leadReference,
        visitorTurns: sql<number>`(select count(*) from jsonb_array_elements(${c.messages}) m where m->>'role' = 'user')`.mapWith(Number),
        firstMessage: sql<string | null>`(select m->>'text' from jsonb_array_elements(${c.messages}) m where m->>'role' = 'user' limit 1)`,
        tokens: sql<number>`${c.inputTokens} + ${c.cachedTokens} + ${c.outputTokens}`.mapWith(Number),
      })
      .from(c)
      .orderBy(desc(c.updatedAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(c),
  ]);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getConversation(id: string) {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const [row] = await db.select().from(c).where(eq(c.id, id));
  return row ?? null;
}

/** Tokens used in the last 30 days, for the cost line on the list. */
export async function recentUsage() {
  const [row] = await db
    .select({
      conversations: count(),
      input: sql<number>`coalesce(sum(${c.inputTokens}), 0)`.mapWith(Number),
      cached: sql<number>`coalesce(sum(${c.cachedTokens}), 0)`.mapWith(Number),
      output: sql<number>`coalesce(sum(${c.outputTokens}), 0)`.mapWith(Number),
    })
    .from(c)
    .where(sql`${c.updatedAt} > now() - interval '30 days'`);
  return row;
}
