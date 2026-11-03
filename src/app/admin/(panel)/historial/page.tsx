import Link from "next/link";
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
  user_updated: "Modificó una cuenta",
  user_activated: "Activó una cuenta",
  user_deactivated: "Desactivó una cuenta",
  user_unlocked: "Desbloqueó una cuenta",
  two_factor_reset: "Restableció la verificación en dos pasos de una cuenta",
  access_link_sent: "Envió un enlace de acceso",
  lead_status: "Cambió el estado de un lead",
  lead_note: "Agregó una nota a un lead",
  lead_assigned: "Asignó un lead",
  leads_exported: "Exportó leads a CSV",
  lead_attachment_downloaded: "Descargó un adjunto de un lead",
  settings_updated: "Cambió la configuración",
  redirect_created: "Creó una redirección",
  redirect_enabled: "Activó una redirección",
  redirect_disabled: "Desactivó una redirección",
  redirect_deleted: "Eliminó una redirección",
  content_created: "Creó contenido",
  content_updated: "Editó contenido",
  content_published: "Publicó contenido",
  content_unpublished: "Retiró contenido del sitio",
  content_reordered: "Reordenó contenido",
  content_deleted: "Eliminó contenido",
  media_uploaded: "Subió un archivo",
  media_updated: "Editó la descripción de un archivo",
  media_deleted: "Eliminó un archivo",
};

export default async function HistoryPage() {
  await requireUser("audit:read");
  const rows = await db
    .select({
      id: schema.auditLog.id,
      at: schema.auditLog.createdAt,
      action: schema.auditLog.action,
      entity: schema.auditLog.entity,
      entityId: schema.auditLog.entityId,
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
                <td className="px-4 py-3 text-ink-soft">
                  {r.entity === "lead" && r.entityId && (
                    <Link href={`/admin/leads/${r.entityId}`} className="mr-2 font-mono font-bold text-accent">
                      {r.entityId}
                    </Link>
                  )}
                  {r.diff ? Object.entries(r.diff as Record<string, unknown>).map(([k, v]) => `${k}: ${String(v)}`).join(" · ") : r.entity === "lead" ? "" : "—"}
                </td>
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
