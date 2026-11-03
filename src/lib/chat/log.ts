// Conversation log for quality review (design document §12.3). Each request stores the conversation as
// the visitor sees it, plus the tokens it used; conversations untouched for CHAT_RETENTION_DAYS (90 by
// default) are deleted.
import "server-only";
import { eq, lt, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import type { ChatLogEntry } from "@/db/schema";

const retentionDays = () => Math.max(1, Number(process.env.CHAT_RETENTION_DAYS) || 90);

export type ChatUsage = { input: number; cached: number; output: number };

/** Stores the conversation as sent; messages already logged keep the time they were first seen. */
export async function saveConversation(entry: { id: string; lang: string; page?: string; model: string; messages: Omit<ChatLogEntry, "at">[]; usage: ChatUsage }) {
  const t = schema.chatConversation;
  const { usage } = entry;
  const [existing] = await db.select({ messages: t.messages }).from(t).where(eq(t.id, entry.id));
  const now = new Date().toISOString();
  const messages: ChatLogEntry[] = entry.messages.map((m, i) => {
    const logged = existing?.messages[i];
    return { ...m, at: logged?.role === m.role && logged.text === m.text ? logged.at : now };
  });
  await db
    .insert(t)
    .values({ id: entry.id, lang: entry.lang, page: entry.page, model: entry.model, messages, inputTokens: usage.input, cachedTokens: usage.cached, outputTokens: usage.output })
    .onConflictDoUpdate({
      target: t.id,
      set: {
        messages,
        model: entry.model,
        inputTokens: sql`${t.inputTokens} + ${usage.input}`,
        cachedTokens: sql`${t.cachedTokens} + ${usage.cached}`,
        outputTokens: sql`${t.outputTokens} + ${usage.output}`,
        updatedAt: sql`now()`,
      },
    });
}

/** Called by /api/leads when a chat lead is stored. */
export async function linkLead(conversationId: string, reference: string) {
  await db.update(schema.chatConversation).set({ leadReference: reference }).where(eq(schema.chatConversation.id, conversationId));
}

export async function pruneConversations() {
  await db.delete(schema.chatConversation).where(lt(schema.chatConversation.updatedAt, sql`now() - make_interval(days => ${retentionDays()})`));
}
