"use server";

import { refresh, updateTag } from "next/cache";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { PageBlockKey } from "@/db/seed/blocks";
import { audit, requestIp } from "@/lib/audit";
import { authorize } from "@/lib/auth/session";
import { tags } from "@/lib/data/content";
import { blockInfo, rebuildBlock } from "@/lib/admin/blocks";
import { fileChecker } from "@/lib/admin/files";
import { refreshPublicPages } from "@/lib/admin/refresh";

export type BlockState = { ok?: string; error?: string; errors?: Record<string, string> };

// PostgreSQL returns JSONB objects with their keys reordered; compare with sorted keys.
const canonical = (v: unknown): unknown =>
  Array.isArray(v) ? v.map(canonical) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, canonical(x)])) : v;

export async function saveBlock(_: BlockState, form: FormData): Promise<BlockState> {
  const user = await authorize("content:write");
  const key = String(form.get("key"));
  if (!blockInfo[key]) return { error: "Sección desconocida." };
  const [row] = await db.select().from(schema.pageBlock).where(eq(schema.pageBlock.key, key));
  if (!row) return { error: "La sección no existe." };
  if (row.updatedAt.toISOString() !== String(form.get("updatedAt"))) {
    return { error: "Otra persona guardó cambios en esta sección mientras usted editaba. Copie sus cambios, recargue la página y vuelva a aplicarlos." };
  }

  const { value, errors } = rebuildBlock(row.data, form, await fileChecker());
  if (errors.length) return { error: `Hay ${errors.length} ${errors.length === 1 ? "campo" : "campos"} por revisar.`, errors: Object.fromEntries(errors.map((e) => [e.path, e.message])) };
  const unchanged = JSON.stringify(canonical(value)) === JSON.stringify(canonical(row.data));
  const ip = requestIp(await headers());

  // Saved as a draft: the site keeps the published section; the preview shows the draft.
  if (form.get("mode") === "draft") {
    if (unchanged) {
      if (!row.pending) return { ok: "Sin cambios." };
      await db.update(schema.pageBlock).set({ pending: null, updatedBy: user.id, updatedAt: new Date() }).where(eq(schema.pageBlock.key, key));
      refresh();
      return { ok: "Igual a lo publicado: no queda ningún borrador." };
    }
    await db
      .update(schema.pageBlock)
      .set({ pending: { data: value, by: user.id, at: new Date().toISOString() }, updatedBy: user.id, updatedAt: new Date() })
      .where(eq(schema.pageBlock.key, key));
    await audit({ userId: user.id, action: "content_draft_saved", entity: "page_block", entityId: key, diff: { seccion: blockInfo[key].label }, ip });
    refresh();
    return { ok: "Borrador guardado. El sitio sigue mostrando la versión publicada; revise el borrador en la vista previa." };
  }

  if (unchanged && !row.pending) return { ok: "Sin cambios." };
  await db.update(schema.pageBlock).set({ data: value, pending: null, updatedBy: user.id, updatedAt: new Date() }).where(eq(schema.pageBlock.key, key));
  await audit({ userId: user.id, action: "content_updated", entity: "page_block", entityId: key, diff: { seccion: blockInfo[key].label }, ip });
  updateTag(tags.block(key as PageBlockKey));
  await refreshPublicPages(blockInfo[key].pages);
  refresh();
  return { ok: "Publicado. El sitio se actualiza en unos segundos." };
}

/** Throws away the draft of a page section; the published version stays as it is. */
export async function discardBlockPending(_: BlockState, form: FormData): Promise<BlockState> {
  const user = await authorize("content:write");
  const key = String(form.get("key"));
  if (!blockInfo[key]) return { error: "Sección desconocida." };
  const [row] = await db.select().from(schema.pageBlock).where(eq(schema.pageBlock.key, key));
  if (!row?.pending) return { ok: "No había borrador." };
  await db.update(schema.pageBlock).set({ pending: null, updatedBy: user.id, updatedAt: new Date() }).where(eq(schema.pageBlock.key, key));
  await audit({ userId: user.id, action: "content_draft_discarded", entity: "page_block", entityId: key, diff: { seccion: blockInfo[key].label }, ip: requestIp(await headers()) });
  refresh();
  return { ok: "Borrador descartado." };
}
