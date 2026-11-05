import { db, schema } from "@/db";
import { leadMetrics, type Bar } from "@/lib/leads/metrics";
import { sourceLabels, statusLabels, urgencyLabel } from "@/lib/leads/admin";
import { Card } from "@/components/admin/ui";

const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0);
const month = new Intl.DateTimeFormat("es-CO", { month: "short", timeZone: "UTC" });

/** One measure per chart, in one colour; each bar carries its number, so nothing depends on the colour. */
function Bars({ title, rows, label, empty }: { title: string; rows: Bar[]; label: (key: string) => string; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <Card title={title}>
      {rows.length === 0 ? (
        <p className="text-sm text-mute">{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((r) => (
            <li key={r.key} title={`${label(r.key)}: ${r.n}`} className="grid grid-cols-[minmax(0,9rem)_1fr_2.5rem] items-center gap-3 text-sm">
              <span className="truncate font-semibold text-ink-soft">{label(r.key)}</span>
              <span className="h-2.5 rounded-r-[4px] bg-neon/80" style={{ width: `${Math.max(2, (r.n / max) * 100)}%` }} />
              <span className="text-right font-mono font-bold text-ink">{r.n}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/** Lead metrics on the dashboard (design document §18.2), from the database: last 90 days and 6 months. */
export async function LeadMetrics() {
  const [m, services] = await Promise.all([leadMetrics(90), db.select({ slug: schema.service.slug, name: schema.service.name }).from(schema.service)]);
  const serviceName = (slug: string) => services.find((s) => s.slug === slug)?.name.es ?? slug;
  const empty = "Sin solicitudes en este periodo.";
  const funnel = (["new", "contacted", "quoted", "won", "lost"] as const).map((key) => ({ key, n: m.byStatus.find((r) => r.key === key)?.n ?? 0 }));
  const peak = Math.max(1, ...m.monthly.map((r) => r.n));

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-extrabold text-ink">Solicitudes de los últimos {m.days} días</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-bold text-mute">Solicitudes</p>
          <p className="mt-1 text-4xl font-extrabold text-ink">{m.total}</p>
        </Card>
        <Card>
          <p className="text-sm font-bold text-mute">Ganadas</p>
          <p className="mt-1 text-4xl font-extrabold text-ink">
            {pct(m.won, m.total)}
            <span className="text-2xl">%</span>
          </p>
          <p className="mt-1 text-sm text-mute">
            {m.won} de {m.total}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-bold text-mute">Conversaciones del asistente con solicitud</p>
          <p className="mt-1 text-4xl font-extrabold text-ink">
            {pct(m.chats.withLead, m.chats.total)}
            <span className="text-2xl">%</span>
          </p>
          <p className="mt-1 text-sm text-mute">
            {m.chats.withLead} de {m.chats.total} conversaciones
          </p>
        </Card>
      </div>

      <Card title="Solicitudes por mes">
        <div className="flex h-36 items-end gap-3" role="list">
          {m.monthly.map((r) => (
            <div key={r.key} role="listitem" title={`${r.key}: ${r.n}`} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="font-mono text-xs font-bold text-ink">{r.n}</span>
              <span className="w-full max-w-12 rounded-t-[4px] bg-neon/80" style={{ height: `${Math.max(2, (r.n / peak) * 100)}%` }} />
              <span className="text-xs font-semibold capitalize text-mute">{month.format(new Date(`${r.key}-01T00:00:00Z`))}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bars title="Por estado" rows={funnel} label={(k) => statusLabels[k as keyof typeof statusLabels] ?? k} empty={empty} />
        <Bars title="Por origen" rows={m.bySource} label={(k) => sourceLabels[k as keyof typeof sourceLabels] ?? k} empty={empty} />
        <Bars title="Por servicio" rows={m.byService} label={serviceName} empty={empty} />
        <Bars title="Por urgencia" rows={m.byUrgency} label={(k) => (k === "none" ? "Sin indicar" : urgencyLabel(k))} empty={empty} />
      </div>
    </section>
  );
}
