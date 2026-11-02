"use server";

// Account management for super-admins. Guards: nobody changes their own account here (that is what
// Seguridad is for), and the last active super-admin cannot be demoted or deactivated.
import { refresh } from "next/cache";
import { headers } from "next/headers";
import { and, count, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { audit, requestIp } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { roleLabels, roles } from "@/lib/auth/roles";
import { authorize } from "@/lib/auth/session";

export type ActionState = { ok?: string; error?: string };

const u = schema.user;
const ip = async () => requestIp(await headers());

async function target(id: unknown, actorId: string) {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { error: "Usuario no válido." } as const;
  if (parsed.data === actorId) return { error: "Para su propia cuenta use la página Seguridad." } as const;
  const [row] = await db.select().from(u).where(eq(u.id, parsed.data));
  return row ? ({ user: row } as const) : ({ error: "El usuario ya no existe." } as const);
}

/** True when `id` is the only active super-admin left. */
async function isLastSuperAdmin(id: string) {
  const [{ n }] = await db
    .select({ n: count() })
    .from(u)
    .where(and(eq(u.role, "super_admin"), eq(u.active, true), ne(u.id, id)));
  return n === 0;
}

const sendAccessLink = (email: string) => auth.api.requestPasswordReset({ body: { email } });

const inviteInput = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase().max(160),
  role: z.enum(roles),
});

export async function inviteUser(_: ActionState, form: FormData): Promise<ActionState> {
  const actor = await authorize("users:manage");
  const parsed = inviteInput.safeParse({ name: form.get("name"), email: form.get("email"), role: form.get("role") });
  if (!parsed.success) return { error: "Revise el nombre, el correo y el rol." };
  const { name, email, role } = parsed.data;
  const [existing] = await db.select({ id: u.id }).from(u).where(eq(u.email, email));
  if (existing) return { error: "Ya existe una cuenta con ese correo. Ábrala para reenviar el enlace." };

  const [created] = await db.insert(u).values({ name, email, role }).returning({ id: u.id });
  await audit({ userId: actor.id, action: "user_invited", entity: "user", entityId: created.id, diff: { email, role }, ip: await ip() });
  await sendAccessLink(email);
  refresh();
  return { ok: `Invitación enviada a ${email}. El enlace vence en 24 horas.` };
}

const updateInput = z.object({ name: z.string().trim().min(2).max(120), role: z.enum(roles) });

export async function updateUser(_: ActionState, form: FormData): Promise<ActionState> {
  const actor = await authorize("users:manage");
  const found = await target(form.get("id"), actor.id);
  if ("error" in found) return { error: found.error };
  const parsed = updateInput.safeParse({ name: form.get("name"), role: form.get("role") });
  if (!parsed.success) return { error: "Revise el nombre y el rol." };
  const { user } = found;
  const { name, role } = parsed.data;
  if (user.role === "super_admin" && role !== "super_admin" && (await isLastSuperAdmin(user.id))) {
    return { error: "Es el único superadministrador activo: asigne ese rol a otra persona antes de cambiarlo." };
  }
  if (name === user.name && role === user.role) return { ok: "Sin cambios." };

  await db.update(u).set({ name, role, updatedAt: new Date() }).where(eq(u.id, user.id));
  await audit({ userId: actor.id, action: "user_updated", entity: "user", entityId: user.id, diff: { email: user.email, ...(role !== user.role && { role: `${user.role} → ${role}` }), ...(name !== user.name && { name }) }, ip: await ip() });
  refresh();
  return { ok: role !== user.role ? `Rol cambiado a ${roleLabels[role]}. Aplica de inmediato.` : "Datos guardados." };
}

export async function setUserActive(_: ActionState, form: FormData): Promise<ActionState> {
  const actor = await authorize("users:manage");
  const found = await target(form.get("id"), actor.id);
  if ("error" in found) return { error: found.error };
  const { user } = found;
  const active = form.get("active") === "true";
  if (!active && user.role === "super_admin" && (await isLastSuperAdmin(user.id))) return { error: "No se puede desactivar al único superadministrador activo." };

  await db.transaction(async (tx) => {
    await tx.update(u).set({ active, updatedAt: new Date() }).where(eq(u.id, user.id));
    // Deactivation also ends every open session at once.
    if (!active) await tx.delete(schema.session).where(eq(schema.session.userId, user.id));
  });
  await audit({ userId: actor.id, action: active ? "user_activated" : "user_deactivated", entity: "user", entityId: user.id, diff: { email: user.email }, ip: await ip() });
  refresh();
  return { ok: active ? "Cuenta activada." : "Cuenta desactivada y sesiones cerradas." };
}

export async function unlockUser(_: ActionState, form: FormData): Promise<ActionState> {
  const actor = await authorize("users:manage");
  const found = await target(form.get("id"), actor.id);
  if ("error" in found) return { error: found.error };
  const { user } = found;
  await db.transaction(async (tx) => {
    await tx.update(u).set({ failedLoginCount: 0, lockedUntil: null }).where(eq(u.id, user.id));
    await tx.update(schema.twoFactor).set({ failedVerificationCount: 0, lockedUntil: null }).where(eq(schema.twoFactor.userId, user.id));
  });
  await audit({ userId: actor.id, action: "user_unlocked", entity: "user", entityId: user.id, diff: { email: user.email }, ip: await ip() });
  refresh();
  return { ok: "Cuenta desbloqueada." };
}

export async function resetTwoFactor(_: ActionState, form: FormData): Promise<ActionState> {
  const actor = await authorize("users:manage");
  const found = await target(form.get("id"), actor.id);
  if ("error" in found) return { error: found.error };
  const { user } = found;
  await db.transaction(async (tx) => {
    await tx.delete(schema.twoFactor).where(eq(schema.twoFactor.userId, user.id));
    await tx.update(u).set({ twoFactorEnabled: false }).where(eq(u.id, user.id));
    await tx.delete(schema.session).where(eq(schema.session.userId, user.id));
  });
  await audit({ userId: actor.id, action: "two_factor_reset", entity: "user", entityId: user.id, diff: { email: user.email }, ip: await ip() });
  refresh();
  return { ok: "Verificación en dos pasos restablecida. La persona la configurará de nuevo al ingresar." };
}

export async function resendAccessLink(_: ActionState, form: FormData): Promise<ActionState> {
  const actor = await authorize("users:manage");
  const found = await target(form.get("id"), actor.id);
  if ("error" in found) return { error: found.error };
  const { user } = found;
  if (!user.active) return { error: "Active la cuenta antes de enviar un enlace." };
  await sendAccessLink(user.email);
  await audit({ userId: actor.id, action: "access_link_sent", entity: "user", entityId: user.id, diff: { email: user.email }, ip: await ip() });
  return { ok: `Enlace enviado a ${user.email}. Vence en 24 horas.` };
}
