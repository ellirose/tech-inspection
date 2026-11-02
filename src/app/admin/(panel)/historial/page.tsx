import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { PageHead } from "@/components/admin/PageHead";
import { formatBogota } from "@/components/admin/format";

export const metadata = { title: "Historial" };

const actions: Record<string, string> = {
  login: "Ingresó",
  login_failed: "Intento de ingreso fallido",
  account_locked: "Cuenta bloqueada por intentos fallidos",
  logout: "Salió",
  password_set: "Definió su contraseña",
  password_changed: "Cambió su contraseña",
  two_factor_enabled: "Activó la verificación en dos pasos",
  two_factor_disabled: "Desactivó la verificación en dos pasos",
  backup_codes_regenerated: "Generó nuevos códigos de respaldo",
  user_invited: "Cuenta creada e invitación enviada",
};

export default async function HistoryPage() {
  await requireUser("audit:read");
  const rows = await db
    .select({
      id: schema.auditLog.id,
      at: schema.auditLog.createdAt,
      action: schema.auditLog.action,
      entity: schema.auditLog.entity,
      diff: schema.auditLog.diff,
      ip: schema.auditLog.ip,
      who: schema.user.email,
    })
    .from(schema.auditLog)
    .leftJoin(schema.user, eq(sql`${schema.user.id}::text`, schema.auditLog.userId))
    .orderBy(desc(schema.auditLog.createdAt))
    .limit(200);

  return (
    <>
      <PageHead title="Historial" lead="Las últimas 200 acciones en el panel." />
      <div className="overflow-x-auto rounded-3xl bg-surface shadow-soft ring-1 ring-line">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-line text-mute">
            <tr>
              {["Fecha", "Usuario", "Acción", "Detalle", "IP"].map((h) => (
                <th key={h} className="px-4 py-3 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{formatBogota(r.at)}</td>
                <td className="px-4 py-3 text-ink">{r.who ?? "—"}</td>
                <td className="px-4 py-3 font-bold text-ink">{actions[r.action] ?? r.action}</td>
                <td className="px-4 py-3 text-ink-soft">{r.diff ? Object.entries(r.diff as Record<string, unknown>).map(([k, v]) => `${k}: ${String(v)}`).join(" · ") : "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-mute">{r.ip ?? "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-mute">
                  Sin actividad registrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
