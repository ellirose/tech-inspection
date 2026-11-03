// Certifications that expire within 60 days or already expired, for warnings in the panel.
import "server-only";
import { and, asc, isNotNull, lte, sql } from "drizzle-orm";
import { db, schema } from "@/db";

export const EXPIRY_WARNING_DAYS = 60;

export async function expiringCertifications() {
  const c = schema.certification;
  return db
    .select({ id: c.id, code: c.code, title: c.title, expiryDate: c.expiryDate, expired: sql<boolean>`${c.expiryDate} < current_date` })
    .from(c)
    .where(and(isNotNull(c.expiryDate), lte(c.expiryDate, sql`current_date + ${EXPIRY_WARNING_DAYS}::int`)))
    .orderBy(asc(c.expiryDate));
}
