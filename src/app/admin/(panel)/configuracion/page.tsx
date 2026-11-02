import { requireUser } from "@/lib/auth/session";
import { getSite } from "@/lib/data/content";
import { PageHead, Upcoming } from "@/components/admin/PageHead";
import { Card } from "@/components/admin/ui";

export const metadata = { title: "Configuración" };

export default async function SettingsPage() {
  await requireUser("settings:manage");
  const { company, platformUrl } = await getSite();
  const rows: [string, string][] = [
    ["Razón social", company.name],
    ["Dirección", company.address],
    ["Teléfono", company.phone],
    ["WhatsApp", company.whatsappDisplay],
    ["Correo", company.email],
    ["Horario", company.hours.es],
    ["TI-QMS", platformUrl],
    ["Notificaciones de leads", process.env.LEAD_NOTIFY_TO || "(sin configurar)"],
  ];
  return (
    <>
      <PageHead title="Configuración" lead="Datos de la empresa que usa todo el sitio." />
      <Card className="mb-6 max-w-3xl">
        <dl className="divide-y divide-line">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-3">
              <dt className="text-sm font-bold text-mute">{k}</dt>
              <dd className="break-words text-ink sm:col-span-2">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <Upcoming>La edición de estos datos, redirecciones y SEO llega en la etapa 4.</Upcoming>
    </>
  );
}
