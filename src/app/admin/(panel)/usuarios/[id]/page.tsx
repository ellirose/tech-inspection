import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { roleLabels, roles, isRole } from "@/lib/auth/roles";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, fieldClass, labelClass } from "@/components/admin/ui";
import { accountState, formatBogota } from "@/components/admin/format";
import { resendAccessLink, resetTwoFactor, setUserActive, unlockUser, updateUser } from "../actions";

export const metadata = { title: "Usuario" };

export default async function UserPage({ params }: PageProps<"/admin/usuarios/[id]">) {
  const actor = await requireUser("users:manage");
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [user] = await db.select().from(schema.user).where(eq(schema.user.id, id));
  if (!user) notFound();
  const [credential] = await db.select({ id: schema.account.id }).from(schema.account).where(eq(schema.account.userId, id));
  const sessions = await db.select({ createdAt: schema.session.createdAt, ip: schema.session.ipAddress, agent: schema.session.userAgent }).from(schema.session).where(eq(schema.session.userId, id)).orderBy(desc(schema.session.createdAt));
  const now = new Date();
  const self = actor.id === user.id;
  const state = accountState(user, now);

  return (
    <div className="max-w-5xl">
      <Link href="/admin/usuarios" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-accent">
        <ArrowLeft weight="bold" className="size-4" /> Todos los usuarios
      </Link>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">{user.name}</h1>
      <p className="mb-8 mt-1 text-ink-soft">
        {user.email} · {isRole(user.role) ? roleLabels[user.role] : user.role} · {state}
      </p>

      {self ? (
        <Card>
          <p className="text-ink-soft">
            Es su propia cuenta: cambie su contraseña y la verificación en dos pasos en{" "}
            <Link href="/admin/seguridad" className="font-bold text-accent">
              Seguridad
            </Link>
            . Otro superadministrador puede cambiar su rol o desactivarla.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Datos y rol">
            <ActionForm action={updateUser} hidden={{ id: user.id }} submit="Guardar">
              <label className="block">
                <span className={labelClass}>Nombre</span>
                <input name="name" defaultValue={user.name} required minLength={2} maxLength={120} className={fieldClass} />
              </label>
              <label className="block">
                <span className={labelClass}>Rol</span>
                <select name="role" defaultValue={user.role} className={fieldClass}>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {roleLabels[r]}
                    </option>
                  ))}
                </select>
              </label>
            </ActionForm>
          </Card>

          <Card title="Acceso">
            <div className="space-y-5">
              {/* Current state, so the result of an action stays visible after its button goes away. */}
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm" aria-live="polite">
                <dt className="font-bold text-mute">Cuenta</dt>
                <dd className="font-bold text-ink">
                  {state}
                  {state === "Bloqueada" && user.lockedUntil && ` hasta ${formatBogota(user.lockedUntil)}`}
                </dd>
                <dt className="font-bold text-mute">Dos pasos</dt>
                <dd className="font-bold text-ink">{user.twoFactorEnabled ? "Activa" : "No configurada"}</dd>
              </dl>
              <ActionForm
                action={setUserActive}
                hidden={{ id: user.id, active: String(!user.active) }}
                submit={user.active ? "Desactivar cuenta" : "Activar cuenta"}
                confirm={user.active ? `¿Desactivar la cuenta de ${user.name}? Se cerrarán sus sesiones.` : undefined}
                quiet
              />
              {state === "Bloqueada" && <ActionForm action={unlockUser} hidden={{ id: user.id }} submit="Desbloquear" quiet />}
              {user.twoFactorEnabled && (
                <ActionForm
                  action={resetTwoFactor}
                  hidden={{ id: user.id }}
                  submit="Restablecer verificación en dos pasos"
                  confirm={`¿Restablecer la verificación en dos pasos de ${user.name}? Deberá configurarla de nuevo.`}
                  quiet
                />
              )}
              {user.active && <ActionForm action={resendAccessLink} hidden={{ id: user.id }} submit={credential ? "Enviar enlace para nueva contraseña" : "Reenviar invitación"} quiet />}
            </div>
          </Card>
        </div>
      )}

      <Card title="Sesiones abiertas" className="mt-6">
        {sessions.length ? (
          <ul className="divide-y divide-line text-sm">
            {sessions.map((s, i) => (
              <li key={i} className="py-2.5">
                <span className="font-bold text-ink">{formatBogota(s.createdAt)}</span> · <span className="font-mono text-mute">{s.ip ?? "—"}</span>
                <span className="block truncate text-mute">{s.agent}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-mute">Ninguna.</p>
        )}
        <p className="mt-3 text-sm text-mute">
          Creada el {formatBogota(user.createdAt)} · último ingreso {user.lastLoginAt ? formatBogota(user.lastLoginAt) : "nunca"}
          {!credential && " · todavía no ha definido su contraseña"}
        </p>
      </Card>
    </div>
  );
}
