// The media library: uploaded images and PDFs, and where each one is used.
import "server-only";
import { desc, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db, schema } from "@/db";
import { collections } from "./collections";
import { blockInfo } from "./blocks";

export const listMedia = () => db.select().from(schema.media).orderBy(desc(schema.media.createdAt));

export type Usage = { label: string; href: string };

const contains = (table: PgTable, url: string) => sql`position(${url} in ${table}::text) > 0`;

/**
 * Every content item, page section or setting whose stored data mentions `url`. Reads whole rows as
 * text, so a file in any field (a gallery line, a block's image, a document link) is found.
 */
export async function findUsage(url: string): Promise<Usage[]> {
  const found: Usage[] = [];
  for (const c of collections) {
    const t = c.table as unknown as PgTable & { id: unknown };
    const rows = (await db.select().from(t).where(contains(t, url))) as (Record<string, unknown> & { id: string })[];
    for (const r of rows) found.push({ label: `${c.label}: ${c.title(r)}`, href: `/admin/contenido/${c.key}/${r.id}` });
  }
  const blocks = await db.select({ key: schema.pageBlock.key }).from(schema.pageBlock).where(contains(schema.pageBlock, url));
  for (const b of blocks) found.push({ label: `Sección: ${blockInfo[b.key]?.label ?? b.key}`, href: `/admin/contenido/paginas/${b.key}` });
  const settings = await db.select({ id: schema.siteSettings.id }).from(schema.siteSettings).where(contains(schema.siteSettings, url));
  if (settings.length) found.push({ label: "Configuración de la empresa", href: "/admin/configuracion" });
  return found;
}
