"use server";

// Saving content from the generic editor. Each save checks the role, validates every field from its
// definition, refuses to overwrite a newer version (someone else saved meanwhile), records the changed
// fields in the audit log and refreshes only the cached data of that content type.
import { refresh, updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, asc, eq, max, sql } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { db, schema } from "@/db";
import type { PendingChanges } from "@/db/schema";
import { audit, requestIp } from "@/lib/audit";
import { authorize } from "@/lib/auth/session";
import { findCollection, type Collection } from "@/lib/admin/collections";
import { readField } from "@/lib/admin/fields";
import { fileChecker } from "@/lib/admin/files";
import { refreshPublicPages } from "@/lib/admin/refresh";
import { refOptions } from "@/lib/admin/refs";

export type SaveState = { ok?: string; error?: string; fieldErrors?: Record<string, string> };

type ContentTable = PgTable & { id: PgColumn; status: PgColumn; pending: PgColumn; sortOrder: PgColumn; updatedAt: PgColumn };
const tableOf = (c: Collection) => c.table as unknown as ContentTable;

// PostgreSQL returns JSONB objects with their keys reordered; compare with sorted keys.
const canonical = (v: unknown): unknown =>
  Array.isArray(v) ? v.map(canonical) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, canonical(x)])) : v;
const same = (a: unknown, b: unknown) => JSON.stringify(canonical(a ?? null)) === JSON.stringify(canonical(b ?? null));

const pgCode = (e: unknown) => (e as { cause?: { code?: string } }).cause?.code ?? (e as { code?: string }).code;

async function serviceMethodIds(serviceId: string) {
  const rows = await db.select({ id: schema.serviceMethod.methodId }).from(schema.serviceMethod).where(eq(schema.serviceMethod.serviceId, serviceId)).orderBy(asc(schema.serviceMethod.sortOrder));
  return rows.map((r) => r.id);
}

export async function saveContent(_: SaveState, form: FormData): Promise<SaveState> {
  const user = await authorize("content:write");
  const c = findCollection(String(form.get("collection")));
  if (!c) return { error: "Tipo de contenido desconocido." };
  const t = tableOf(c);
  const id = String(form.get("id") ?? "");
  const creating = !id;
  if (creating && !c.canCreate) return { error: "Este contenido no admite elementos nuevos." };

  const values: Record<string, unknown> = {};
  const fieldErrors: Record<string, string> = {};
  let methodIds: string[] | undefined;
  const fileExists = await fileChecker();
  for (const field of c.fields) {
    if (field.type === "text" && field.createOnly && !creating) continue;
    const { value, error } = readField(field, form, fileExists);
    if (error) fieldErrors[field.name] = error;
    else if (field.type === "methods") methodIds = value as string[];
    else values[field.name] = value;
  }
  if (Object.keys(fieldErrors).length) {
    const labels = c.fields.filter((f) => fieldErrors[f.name]).map((f) => f.label);
    return { error: `Revise: ${labels.join(", ")}.`, fieldErrors };
  }
  for (const field of c.fields) {
    if (field.type !== "refs") continue;
    const known = new Set((await refOptions(field.source)).map((o) => o.id));
    if ((values[field.name] as string[]).some((v) => !known.has(v))) return { error: `Revise: ${field.label}.`, fieldErrors: { [field.name]: "Opción no válida" } };
  }
  if (methodIds) {
    const known = new Set((await db.select({ id: schema.method.id }).from(schema.method)).map((m) => m.id));
    if (methodIds.some((m) => !known.has(m))) return { error: "Método no válido." };
  }

  const ip = requestIp(await headers());
  try {
    if (creating) {
      const [{ top }] = await db.select({ top: max(t.sortOrder) }).from(t);
      const newId = await db.transaction(async (tx) => {
        const [row] = (await tx
          .insert(t)
          .values({ ...values, ...c.onCreate?.(values), status: "draft", sortOrder: (Number(top) || 0) + 1, updatedBy: user.id })
          .returning({ id: t.id })) as { id: string }[];
        if (methodIds?.length) await tx.insert(schema.serviceMethod).values(methodIds.map((methodId, i) => ({ serviceId: row.id, methodId, sortOrder: i })));
        return row.id;
      });
      await audit({ userId: user.id, action: "content_created", entity: c.key, entityId: newId, ip });
      updateTag(c.tag);
      await refreshPublicPages(c.pages({ ...values, id: newId }));
      redirect(`/admin/contenido/${c.key}/${newId}?creado=1`);
    }

    const [before] = (await db.select().from(t).where(eq(t.id, id))) as Record<string, unknown>[];
    if (!before) return { error: "Este elemento ya no existe." };
    if ((before.updatedAt as Date).toISOString() !== String(form.get("updatedAt"))) {
      return { error: "Otra persona guardó cambios en este elemento mientras usted editaba. Copie sus cambios, recargue la página y vuelva a aplicarlos." };
    }
    // Compared with the published version (the row), not with a draft saved earlier.
    const changed = Object.keys(values).filter((k) => !same(values[k], before[k]));
    const methodsBefore = methodIds && (await serviceMethodIds(id));
    const methodsChanged = Boolean(methodIds && !same(methodIds, methodsBefore));
    const hadPending = Boolean(before.pending);

    // A published item saved as a draft: the site keeps the published version until "Publicar cambios".
    if (before.status === "published" && form.get("mode") === "draft") {
      if (!changed.length && !methodsChanged) {
        if (!hadPending) return { ok: "Sin cambios." };
        await db.update(t).set({ pending: null, updatedBy: user.id, updatedAt: new Date() }).where(eq(t.id, id));
        refresh();
        return { ok: "Igual a lo publicado: no queda ningún borrador." };
      }
      const pending: PendingChanges = {
        values: Object.fromEntries(changed.map((k) => [k, values[k]])),
        ...(methodsChanged ? { methodIds } : {}),
        by: user.id,
        at: new Date().toISOString(),
      };
      await db.update(t).set({ pending, updatedBy: user.id, updatedAt: new Date() }).where(eq(t.id, id));
      const draftLabels = [...c.fields.filter((f) => changed.includes(f.name)).map((f) => f.label), ...(methodsChanged ? ["Métodos"] : [])];
      await audit({ userId: user.id, action: "content_draft_saved", entity: c.key, entityId: id, diff: { campos: draftLabels.join(", ") }, ip });
      refresh();
      return { ok: "Borrador guardado. El sitio sigue mostrando la versión publicada; revise el borrador en la vista previa." };
    }

    if (!changed.length && !methodsChanged && !hadPending) return { ok: "Sin cambios." };

    await db.transaction(async (tx) => {
      // Saving directly (or publishing) also clears any draft: the form already held its changes.
      if (changed.length) await tx.update(t).set({ ...Object.fromEntries(changed.map((k) => [k, values[k]])), pending: null, updatedBy: user.id, updatedAt: new Date() }).where(eq(t.id, id));
      else await tx.update(t).set({ pending: null, updatedBy: user.id, updatedAt: new Date() }).where(eq(t.id, id));
      if (methodsChanged) {
        await tx.delete(schema.serviceMethod).where(eq(schema.serviceMethod.serviceId, id));
        if (methodIds!.length) await tx.insert(schema.serviceMethod).values(methodIds!.map((methodId, i) => ({ serviceId: id, methodId, sortOrder: i })));
      }
    });
    const labels = [...c.fields.filter((f) => changed.includes(f.name)).map((f) => f.label), ...(methodsChanged ? ["Métodos"] : [])];
    await audit({ userId: user.id, action: "content_updated", entity: c.key, entityId: id, diff: { campos: labels.join(", ") }, ip });
    updateTag(c.tag);
    await refreshPublicPages(c.pages({ ...before, ...values, id }));
    refresh();
    return { ok: before.status === "published" ? "Publicado. El sitio se actualiza en unos segundos." : "Guardado como borrador." };
  } catch (error) {
    if (pgCode(error) === "23505") return { error: "Ya existe un elemento con esa dirección o código." };
    throw error;
  }
}

export type SimpleState = { ok?: string; error?: string };

async function loadRow(form: FormData) {
  const c = findCollection(String(form.get("collection")));
  const id = String(form.get("id") ?? "");
  if (!c || !/^[0-9a-f-]{36}$/.test(id)) return null;
  const t = tableOf(c);
  const [row] = (await db.select().from(t).where(eq(t.id, id))) as Record<string, unknown>[];
  return row ? { c, t, id, row } : null;
}

export async function setContentStatus(_: SimpleState, form: FormData): Promise<SimpleState> {
  const user = await authorize("content:write");
  const found = await loadRow(form);
  if (!found) return { error: "Este elemento ya no existe." };
  const { c, t, id, row } = found;
  const status = row.status === "published" ? "draft" : "published";
  // Publishing also applies a draft saved on top of the item, if there is one.
  const pending = status === "published" ? (row.pending as PendingChanges | null) : null;
  await db.transaction(async (tx) => {
    await tx.update(t).set({ ...(pending?.values ?? {}), ...(pending ? { pending: null } : {}), status, updatedBy: user.id, updatedAt: new Date() }).where(eq(t.id, id));
    if (pending?.methodIds) {
      await tx.delete(schema.serviceMethod).where(eq(schema.serviceMethod.serviceId, id));
      if (pending.methodIds.length) await tx.insert(schema.serviceMethod).values(pending.methodIds.map((methodId, i) => ({ serviceId: id, methodId, sortOrder: i })));
    }
  });
  await audit({ userId: user.id, action: status === "published" ? "content_published" : "content_unpublished", entity: c.key, entityId: id, diff: { titulo: c.title(row as never) }, ip: requestIp(await headers()) });
  updateTag(c.tag);
  await refreshPublicPages(c.pages({ ...row, ...(pending?.values ?? {}) } as never));
  refresh();
  return { ok: status === "published" ? "Publicado: aparece en el sitio en unos segundos." : "Retirado del sitio (queda como borrador)." };
}

/** Throws away the draft saved on a published item; the published version stays as it is. */
export async function discardPending(_: SimpleState, form: FormData): Promise<SimpleState> {
  const user = await authorize("content:write");
  const found = await loadRow(form);
  if (!found) return { error: "Este elemento ya no existe." };
  const { c, t, id, row } = found;
  if (!row.pending) return { ok: "No había borrador." };
  await db.update(t).set({ pending: null, updatedBy: user.id, updatedAt: new Date() }).where(eq(t.id, id));
  await audit({ userId: user.id, action: "content_draft_discarded", entity: c.key, entityId: id, diff: { titulo: c.title(row as never) }, ip: requestIp(await headers()) });
  refresh();
  return { ok: "Borrador descartado." };
}

export async function moveContent(_: SimpleState, form: FormData): Promise<SimpleState> {
  const user = await authorize("content:write");
  const found = await loadRow(form);
  if (!found) return { error: "Este elemento ya no existe." };
  const { c, t, id } = found;
  const up = form.get("direction") === "up";
  // Renumber in the current order, then swap with the neighbour.
  const ordered = (await db.select({ id: t.id }).from(t).orderBy(asc(t.sortOrder), asc(t.id))) as { id: string }[];
  const i = ordered.findIndex((r) => r.id === id);
  const j = up ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ordered.length) return {};
  [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
  await db.transaction(async (tx) => {
    for (const [index, r] of ordered.entries()) await tx.update(t).set({ sortOrder: index }).where(and(eq(t.id, r.id), sql`${t.sortOrder} is distinct from ${index}`));
  });
  await audit({ userId: user.id, action: "content_reordered", entity: c.key, entityId: id, ip: requestIp(await headers()) });
  updateTag(c.tag);
  await refreshPublicPages(c.pages(found.row as never));
  refresh();
  return {};
}

export async function deleteContent(_: SimpleState, form: FormData): Promise<SimpleState> {
  const user = await authorize("content:delete");
  const found = await loadRow(form);
  if (!found) return { error: "Este elemento ya no existe." };
  const { c, t, id, row } = found;
  if (!c.canDelete) return { error: "Este contenido no se puede eliminar; puede retirarlo del sitio." };
  await db.delete(t).where(eq(t.id, id));
  await audit({ userId: user.id, action: "content_deleted", entity: c.key, entityId: id, diff: { titulo: c.title(row as never) }, ip: requestIp(await headers()) });
  updateTag(c.tag);
  await refreshPublicPages(c.pages(row as never));
  redirect(`/admin/contenido/${c.key}?eliminado=1`);
}
