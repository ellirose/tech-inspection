"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { audit, requestIp } from "@/lib/audit";
import { authorize } from "@/lib/auth/session";
import { findUsage } from "@/lib/admin/media";
import { storage } from "@/lib/storage";

export type MediaState = { ok?: string; error?: string };

const id = z.uuid();

export async function updateMedia(_: MediaState, form: FormData): Promise<MediaState> {
  const user = await authorize("media:write");
  const mediaId = id.safeParse(form.get("id"));
  if (!mediaId.success) return { error: "Archivo no válido." };
  const [row] = await db.select().from(schema.media).where(eq(schema.media.id, mediaId.data));
  if (!row) return { error: "El archivo ya no existe." };
  const alt = String(form.get("alt") ?? "").trim();
  const caption = String(form.get("caption") ?? "").trim() || null;
  if (row.mime.startsWith("image/") && alt.length < 3) return { error: "Escriba el texto alternativo: qué muestra la imagen, en español." };
  if (alt.length > 200 || (caption?.length ?? 0) > 300) return { error: "La descripción es demasiado larga." };
  if (alt === (row.alt ?? "") && caption === row.caption) return { ok: "Sin cambios." };
  await db.update(schema.media).set({ alt: alt || null, caption }).where(eq(schema.media.id, row.id));
  await audit({ userId: user.id, action: "media_updated", entity: "media", entityId: row.id, diff: { archivo: row.url }, ip: requestIp(await headers()) });
  refresh();
  return { ok: "Descripción guardada." };
}

/** Deletes an upload that nothing on the site uses; otherwise says where it is used. */
export async function deleteMedia(_: MediaState, form: FormData): Promise<MediaState> {
  const user = await authorize("media:write");
  const mediaId = id.safeParse(form.get("id"));
  if (!mediaId.success) return { error: "Archivo no válido." };
  const [row] = await db.select().from(schema.media).where(eq(schema.media.id, mediaId.data));
  if (!row) return { error: "El archivo ya no existe." };
  const usage = await findUsage(row.url);
  if (usage.length) return { error: `No se puede eliminar: se usa en ${usage.map((u) => u.label).join("; ")}. Quítelo de ahí primero.` };
  await storage().remove(row.storageKey);
  await db.delete(schema.media).where(eq(schema.media.id, row.id));
  await audit({ userId: user.id, action: "media_deleted", entity: "media", entityId: row.id, diff: { archivo: row.url }, ip: requestIp(await headers()) });
  refresh();
  return { ok: "Archivo eliminado." };
}
