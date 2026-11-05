// Options for "refs" fields (links to services, methods or industries, stored as slugs or keys on the
// row itself): the editor shows them as checkboxes and the save action accepts only these values.
import "server-only";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import type { RefSource } from "./fields";

export type RefOption = { id: string; label: string };

export async function refOptions(source: RefSource): Promise<RefOption[]> {
  if (source === "services") {
    const rows = await db.select({ slug: schema.service.slug, name: schema.service.name }).from(schema.service).orderBy(asc(schema.service.sortOrder));
    return rows.map((r) => ({ id: r.slug, label: r.name.es }));
  }
  if (source === "methods") {
    const rows = await db.select({ key: schema.method.key, code: schema.method.code, name: schema.method.name }).from(schema.method).orderBy(asc(schema.method.sortOrder));
    return rows.map((r) => ({ id: r.key, label: `${r.code} · ${r.name.es}` }));
  }
  const rows = await db.select({ slug: schema.industry.slug, name: schema.industry.name }).from(schema.industry).orderBy(asc(schema.industry.sortOrder));
  return rows.map((r) => ({ id: r.slug, label: r.name.es }));
}
