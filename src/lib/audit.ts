// Activity log (design document §14.4): sign-ins, account changes and, from stage 4, every admin edit.
// Writing never breaks the action being logged; a failure is reported on the server log instead.
import { db as defaultDb, schema, type Db } from "@/db";

export type AuditEntry = {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  /** Short summary of what changed. Never passwords, tokens or codes. */
  diff?: Record<string, unknown>;
  ip?: string | null;
};

export async function audit(entry: AuditEntry, db: Db = defaultDb) {
  try {
    await db.insert(schema.auditLog).values({ ...entry, userId: entry.userId ?? null, entityId: entry.entityId ?? null, ip: entry.ip ?? null });
  } catch (error) {
    console.error("[audit] could not record", entry.action, (error as { cause?: Error }).cause?.message ?? (error as Error).name);
  }
}

/** Client address as Nginx passes it (X-Real-IP), else the first X-Forwarded-For hop. */
export const requestIp = (headers: Headers | null | undefined) =>
  headers?.get("x-real-ip") ?? headers?.get("x-forwarded-for")?.split(",")[0].trim() ?? null;
