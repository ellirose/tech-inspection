import Link from "next/link";
import { count, eq, gte, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { can, roleLabels, isRole } from "@/lib/auth/roles";
import { panelSections } from "@/components/admin/nav";
import { Card } from "@/components/admin/ui";
import { ExpiryWarnings } from "@/components/admin/content/ExpiryWarnings";
import { LeadMetrics } from "@/components/admin/leads/LeadMetrics";

export const metadata = { title: "Inicio" };

const blurbs: Record<string, string> = {
  "/admin/leads": "Solicitudes de cotización del formulario y del asistente.",
  "/admin/contenido": "Servicios, métodos, industrias, preguntas frecuentes, casos, clientes, cifras, certificaciones y políticas.",
  "/admin/usuarios": "Cuentas del panel, roles y accesos.",
  "/admin/configuracion": "Datos de la empresa, canales y destinatarios de notificaciones.",
  "/admin/redirecciones": "Direcciones antiguas que llevan a las páginas nuevas, y direcciones no encontradas.",
  "/admin/historial": "Quién hizo qué y cuándo.",
  "/admin/seguridad": "Su contraseña y la verificación en dos pasos.",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const leads = can(user.role, "leads:read")
    ? await Promise.all([
        db.select({ n: count() }).from(schema.lead).where(eq(schema.lead.status, "new")),
        db.select({ n: count() }).from(schema.lead).where(gte(schema.lead.createdAt, sql`now() - interval '7 days'`)),
      ]).then(([[open], [week]]) => ({ open: open.n, week: week.n }))
    : null;

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Hola, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-ink-soft">
          Rol: <strong>{isRole(user.role) ? roleLabels[user.role] : user.role}</strong>
        </p>
      </div>

      {can(user.role, "content:write") && <ExpiryWarnings />}

      {leads && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <p className="text-sm font-bold text-mute">Leads sin atender</p>
            <p className="mt-1 text-4xl font-extrabold text-ink">{leads.open}</p>
          </Card>
          <Card>
            <p className="text-sm font-bold text-mute">Leads de los últimos 7 días</p>
            <p className="mt-1 text-4xl font-extrabold text-ink">{leads.week}</p>
          </Card>
        </div>
      )}
      {leads && <LeadMetrics />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {panelSections
          .filter((s) => s.href !== "/admin" && (!s.permission || can(user.role, s.permission)))
          .map((s) => (
            <Link key={s.href} href={s.href} className="rounded-3xl bg-surface p-6 shadow-soft ring-1 ring-line transition hover:ring-accent/50">
              <p className="text-lg font-extrabold text-ink">{s.label}</p>
              <p className="mt-1 text-sm text-ink-soft">{blurbs[s.href]}</p>
            </Link>
          ))}
      </div>
    </div>
  );
}
