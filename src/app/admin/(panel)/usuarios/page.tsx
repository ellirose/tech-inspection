import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { isRole, roleLabels, roles } from "@/lib/auth/roles";
import { PageHead } from "@/components/admin/PageHead";
import { accountState, formatBogota } from "@/components/admin/format";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, fieldClass, labelClass } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { inviteUser } from "./actions";

export const metadata = { title: "Usuarios" };

export default async function UsersPage() {
  await requireUser("users:manage");
  const users = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      role: schema.user.role,
      active: schema.user.active,
      twoFactor: schema.user.twoFactorEnabled,
      lockedUntil: schema.user.lockedUntil,
      lastLoginAt: schema.user.lastLoginAt,
    })
    .from(schema.user)
    .orderBy(asc(schema.user.name));
  const now = new Date();

  return (
    <>
      <PageHead title="Usuarios" lead={`${users.length} cuentas en el panel.`} />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="overflow-x-auto rounded-3xl bg-surface shadow-soft ring-1 ring-line">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-line text-mute">
              <tr>
                {["Nombre", "Correo", "Rol", "Dos pasos", "Estado", "Último ingreso"].map((h) => (
                  <th key={h} className="px-4 py-3 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => {
                const state = accountState(u, now);
                return (
                  <tr key={u.id} className="hover:bg-surface-2">
                    <td className="px-4 py-3">
                      <Link href={`/admin/usuarios/${u.id}`} className="font-bold text-accent">
                        {u.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{u.email}</td>
                    <td className="px-4 py-3">{isRole(u.role) ? roleLabels[u.role] : u.role}</td>
                    <td className="px-4 py-3">{u.twoFactor ? "Activa" : "No"}</td>
                    <td className={cn("px-4 py-3 font-bold", state === "Activa" ? "text-lime-deep dark:text-lime" : "text-pt")}>{state}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{u.lastLoginAt ? formatBogota(u.lastLoginAt) : "Nunca"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Card title="Invitar">
          <ActionForm action={inviteUser} submit="Enviar invitación">
            <p className="text-sm text-ink-soft">La persona recibe un enlace de un solo uso (24 horas) para definir su contraseña.</p>
            <label className="block">
              <span className={labelClass}>Nombre</span>
              <input name="name" required minLength={2} maxLength={120} className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Correo</span>
              <input name="email" type="email" required className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Rol</span>
              <select name="role" defaultValue="editor" className={fieldClass}>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {roleLabels[r]}
                  </option>
                ))}
              </select>
            </label>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
