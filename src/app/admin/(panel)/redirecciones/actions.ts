"use server";

// Redirects (design document §14.2, Redirecciones). The proxy reloads the list within a minute.
import { refresh } from "next/cache";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { audit, requestIp } from "@/lib/audit";
import { authorize } from "@/lib/auth/session";
import { normalisePath } from "@/lib/redirects";

export type ActionState = { ok?: string; error?: string };

const r = schema.redirect;
// Paths that must keep reaching the app: the language homes, the admin, the API and Next's own files.
const reserved = /^\/(es|pt|en)?$|^\/(admin|api|_next)(\/|$)/;

const redirectInput = z
  .object({
    from: z
      .string()
      .trim()
      .regex(/^\/[^\s?#]*$/, "La ruta de origen empieza con / y no lleva ? ni #")
      .max(300)
      .transform((v) => (v.length > 1 ? v.replace(/\/+$/, "") : v))
      .refine((v) => !reserved.test(v.toLowerCase()), "Esa ruta no se puede redirigir"),
    to: z
      .string()
      .trim()
      .max(500)
      .refine((v) => /^\/[^\s]*$/.test(v) || /^https:\/\/[^\s]+$/.test(v), "El destino es una ruta del sitio (/es/...) o una dirección https://"),
    statusCode: z.coerce.number().refine((n) => n === 301 || n === 308 || n === 302 || n === 307),
  })
  .refine((v) => normalisePath(v.from) !== normalisePath(v.to.split(/[?#]/)[0]), { message: "El origen y el destino son iguales" });

export async function createRedirect(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await authorize("settings:manage");
  const parsed = redirectInput.safeParse({ from: form.get("from"), to: form.get("to"), statusCode: form.get("statusCode") ?? 308 });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { from, to, statusCode } = parsed.data;
  const [existing] = await db.select({ id: r.id }).from(r).where(eq(r.fromPath, from));
  if (existing) return { error: "Ya hay una redirección para esa ruta." };
  const [row] = await db.insert(r).values({ fromPath: from, toPath: to, statusCode, updatedBy: user.id }).returning({ id: r.id });
  await audit({ userId: user.id, action: "redirect_created", entity: "redirect", entityId: row.id, diff: { from, to }, ip: requestIp(await headers()) });
  // The address is handled now: take it off the list of pages not found.
  await db.delete(schema.notFoundHit).where(sql`lower(${schema.notFoundHit.path}) = ${from.toLowerCase()}`);
  refresh();
  return { ok: "Redirección creada. Se aplica en menos de un minuto." };
}

const idInput = z.uuid();

export async function toggleRedirect(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await authorize("settings:manage");
  const id = idInput.safeParse(form.get("id"));
  if (!id.success) return { error: "Redirección no válida." };
  const [row] = await db.select().from(r).where(eq(r.id, id.data));
  if (!row) return { error: "La redirección ya no existe." };
  await db.update(r).set({ active: !row.active, updatedBy: user.id }).where(eq(r.id, row.id));
  await audit({ userId: user.id, action: row.active ? "redirect_disabled" : "redirect_enabled", entity: "redirect", entityId: row.id, diff: { from: row.fromPath }, ip: requestIp(await headers()) });
  refresh();
  return { ok: row.active ? "Desactivada." : "Activada." };
}

export async function deleteRedirect(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await authorize("settings:manage");
  const id = idInput.safeParse(form.get("id"));
  if (!id.success) return { error: "Redirección no válida." };
  const [row] = await db.delete(r).where(eq(r.id, id.data)).returning();
  if (!row) return { error: "La redirección ya no existe." };
  await audit({ userId: user.id, action: "redirect_deleted", entity: "redirect", entityId: row.id, diff: { from: row.fromPath, to: row.toPath }, ip: requestIp(await headers()) });
  refresh();
  return { ok: "Eliminada." };
}

/** Takes an address off the list of pages not found (it will reappear if it is asked for again). */
export async function dismissNotFound(_: ActionState, form: FormData): Promise<ActionState> {
  await authorize("settings:manage");
  const path = z.string().min(1).max(300).safeParse(form.get("path"));
  if (!path.success) return { error: "Dirección no válida." };
  await db.delete(schema.notFoundHit).where(eq(schema.notFoundHit.path, path.data));
  refresh();
  return { ok: "Descartada." };
}
