import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, DownloadSimple } from "@phosphor-icons/react/ssr";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { getMethods, getServices } from "@/lib/data/content";
import { getLead, leadAssignees, sourceLabels, statusLabels, urgencyLabel } from "@/lib/leads/admin";
import { formatBytes, labelFor, locationKeys, quantityKeys } from "@/lib/leads/options";
import { getDictionary } from "@/i18n/dictionaries";
import { Card } from "@/components/admin/ui";
import { formatBogota } from "@/components/admin/format";
import { StatusBadge } from "@/components/admin/leads/StatusBadge";
import { LeadActions } from "@/components/admin/leads/LeadActions";

export const metadata = { title: "Lead" };

const emailResult: Record<string, string> = { sent: "enviado", outbox: "guardado en la carpeta de prueba", disabled: "no enviado (correo sin configurar)" };

function describeEvent(e: { type: string; from: string | null; to: string | null; note: string | null }) {
  const status = (s: string | null) => (s ? (statusLabels[s as keyof typeof statusLabels] ?? s) : "");
  switch (e.type) {
    case "created":
      return "Solicitud recibida";
    case "status":
      return `Estado: ${status(e.from)} → ${status(e.to)}`;
    case "note":
      return "Nota";
    case "assigned":
      return `Asignado: ${e.note}`;
    case "email_team":
      return `Notificación al equipo: ${emailResult[e.note ?? ""] ?? e.note}`;
    case "email_confirmation":
      return `Confirmación al solicitante: ${emailResult[e.note ?? ""] ?? e.note}`;
    case "email_team_failed":
      return "Falló la notificación al equipo";
    case "email_confirmation_failed":
      return "Falló la confirmación al solicitante";
    default:
      return e.type;
  }
}

function Rows({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="divide-y divide-line">
      {rows
        .filter(([, v]) => v !== null && v !== undefined && v !== "")
        .map(([k, v]) => (
          <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-3">
            <dt className="text-sm font-bold text-mute">{k}</dt>
            <dd className="whitespace-pre-line break-words text-ink sm:col-span-2">{v}</dd>
          </div>
        ))}
    </dl>
  );
}

export default async function LeadPage({ params }: PageProps<"/admin/leads/[reference]">) {
  const user = await requireUser("leads:read");
  const { reference } = await params;
  const found = await getLead(reference);
  if (!found) notFound();
  const { lead, events } = found;
  const [services, methods, assignees] = await Promise.all([getServices(), getMethods(), leadAssignees()]);
  const q = getDictionary("es").quote;
  const a = lead.attribution;
  const digits = lead.phone?.replace(/\D/g, "");
  const waNumber = digits && (digits.length === 10 ? `57${digits}` : digits);

  return (
    <div className="max-w-6xl">
      <Link href="/admin/leads" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-accent">
        <ArrowLeft weight="bold" className="size-4" /> Todos los leads
      </Link>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-3xl font-extrabold tracking-tight text-ink">{lead.reference}</h1>
        <StatusBadge status={lead.status} />
        <span className="text-ink-soft">
          {formatBogota(lead.createdAt)} · {sourceLabels[lead.source]} · {lead.lang.toUpperCase()}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card title="Contacto">
            <Rows
              rows={[
                ["Nombre", lead.name],
                ["Empresa", lead.company],
                ["Cargo", lead.role],
                [
                  "Correo",
                  lead.email && (
                    <a href={`mailto:${lead.email}?subject=${encodeURIComponent(`Su solicitud ${lead.reference}`)}`} className="font-bold text-accent">
                      {lead.email}
                    </a>
                  ),
                ],
                [
                  "Teléfono",
                  lead.phone && (
                    <span className="flex flex-wrap gap-3">
                      <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="font-bold text-accent">
                        {lead.phone}
                      </a>
                      <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener" className="font-bold text-lime-deep dark:text-lime">
                        WhatsApp
                      </a>
                    </span>
                  ),
                ],
                ["Consentimiento", lead.consentAt ? `Aceptado el ${formatBogota(lead.consentAt)}` : "No registrado"],
              ]}
            />
          </Card>

          <Card title="Solicitud">
            <Rows
              rows={[
                ["Servicios", lead.services.map((s) => services.find((x) => x.slug === s)?.name.es ?? s).join(", ")],
                ["Métodos", lead.methods.map((m) => (m === "unsure" ? q.unsure : (methods.find((x) => x.key === m)?.name.es ?? m))).join(", ")],
                ["Cantidad", labelFor(quantityKeys, q.quantities, lead.quantity as (typeof quantityKeys)[number])],
                ["Lugar", labelFor(locationKeys, q.locations, lead.location as (typeof locationKeys)[number])],
                ["Ciudad o campo", lead.city],
                ["Prioridad", urgencyLabel(lead.urgency)],
                ["Comentarios", lead.description],
              ]}
            />
          </Card>

          {lead.attachments.length > 0 && (
            <Card title="Adjuntos">
              {/* Plain links, not <Link>: prefetching would download (and log) every file. */}
              <ul className="divide-y divide-line">
                {lead.attachments.map((f, i) => (
                  <li key={f.key} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0 break-words text-ink">
                      {f.name} <span className="text-sm text-mute">· {f.mime === "application/pdf" ? "PDF" : "Imagen"} · {formatBytes(f.size)}</span>
                    </span>
                    <a href={`/admin/leads/${lead.reference}/adjuntos/${i + 1}`} className="inline-flex items-center gap-2 font-bold text-accent">
                      <DownloadSimple weight="bold" className="size-4" /> Descargar
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-mute">Cada descarga queda en el historial de actividad. El enlace de descarga caduca a los pocos minutos.</p>
            </Card>
          )}

          <Card title="Origen">
            <Rows
              rows={[
                ["Campaña", [a.utmSource, a.utmMedium, a.utmCampaign, a.utmTerm, a.utmContent].filter(Boolean).join(" / ")],
                ["Referente", a.referrer],
                ["Página de entrada", a.landingPage],
                ["Enviada desde", a.submittedFrom],
                ["Dispositivo", a.device],
              ]}
            />
          </Card>

          <Card title="Historial">
            <ol className="space-y-4">
              {events.map((e) => (
                <li key={e.id} className="border-l-2 border-line pl-4">
                  <p className="font-bold text-ink">{describeEvent(e)}</p>
                  {e.note && e.type !== "assigned" && !e.type.startsWith("email_") && <p className="mt-1 whitespace-pre-line text-ink-soft">{e.note}</p>}
                  <p className="mt-1 text-xs text-mute">
                    {formatBogota(e.at)}
                    {e.by && ` · ${e.by}`}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <aside>
          {can(user.role, "leads:write") ? (
            <LeadActions
              id={lead.id}
              status={lead.status}
              assignedTo={lead.assignedTo}
              statuses={Object.entries(statusLabels)}
              assignees={assignees.map(({ id, name }) => ({ id, name }))}
            />
          ) : (
            <Card>
              <p className="text-ink-soft">Solo lectura para su rol.</p>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
