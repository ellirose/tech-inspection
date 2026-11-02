import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { isRole, roleLabels } from "@/lib/auth/roles";
import { PageHead, Upcoming } from "@/components/admin/PageHead";
import { formatBogota } from "@/components/admin/format";
import { cn } from "@/lib/cn";

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
      <div className="mb-6 overflow-x-auto rounded-3xl bg-surface shadow-soft ring-1 ring-line">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-line text-mute">
            <tr>
              {["Nombre", "Correo", "Rol", "Verificación en dos pasos", "Estado", "Último ingreso"].map((h) => (
                <th key={h} className="px-4 py-3 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => {
              const locked = u.lockedUntil && u.lockedUntil > now;
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-bold text-ink">{u.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{u.email}</td>
                  <td className="px-4 py-3">{isRole(u.role) ? roleLabels[u.role] : u.role}</td>
                  <td className="px-4 py-3">{u.twoFactor ? "Activa" : "No"}</td>
                  <td className={cn("px-4 py-3 font-bold", !u.active || locked ? "text-pt" : "text-lime-deep dark:text-lime")}>
                    {!u.active ? "Desactivada" : locked ? "Bloqueada" : "Activa"}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{formatBogota(u.lastLoginAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Upcoming>Invitar, cambiar roles, desactivar y restablecer la verificación en dos pasos llega en la etapa 4. Mientras tanto: npm run admin:invite.</Upcoming>
    </>
  );
}
