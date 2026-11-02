import { requireUser } from "@/lib/auth/session";
import { getSite } from "@/lib/data/content";
import { PageHead } from "@/components/admin/PageHead";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, fieldClass, labelClass } from "@/components/admin/ui";
import { saveSettings } from "./actions";

export const metadata = { title: "Configuración" };

function Field({ name, label, value, type = "text", hint }: { name: string; label: string; value: string | number; type?: string; hint?: string }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input name={name} type={type} defaultValue={value} required className={fieldClass} />
      {hint && <span className="mt-1 block text-xs text-mute">{hint}</span>}
    </label>
  );
}

export default async function SettingsPage() {
  await requireUser("settings:manage");
  const site = await getSite();
  const c = site.company;
  const envRecipients = process.env.LEAD_NOTIFY_TO;

  return (
    <div className="max-w-4xl">
      <PageHead title="Configuración" lead="Datos de la empresa que usa todo el sitio: pie de página, contacto, cotizador, asistente y correos." />
      <ActionForm action={saveSettings} submit="Guardar configuración" className="space-y-6">
        <Card title="Empresa">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="name" label="Razón social" value={c.name} />
            <Field name="short" label="Nombre corto" value={c.short} />
            <div className="sm:col-span-2">
              <Field name="address" label="Dirección" value={c.address} />
            </div>
            <Field name="countryEs" label="País (español)" value={c.country.es} />
            <Field name="countryPt" label="País (portugués)" value={c.country.pt} />
            <Field name="countryEn" label="País (inglés)" value={c.country.en} />
            <Field name="founded" label="Año de fundación" value={site.founded} type="number" />
            <div className="sm:col-span-2">
              <Field name="mapsUrl" label="Enlace al mapa" value={c.mapsUrl} type="url" />
            </div>
          </div>
        </Card>

        <Card title="Contacto">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="phone" label="Teléfono principal" value={c.phone} hint="Con indicativo, p. ej. +57 314 452 4817" />
            <Field name="whatsapp" label="WhatsApp" value={c.whatsappDisplay} hint="Con indicativo; lo usan todos los botones de WhatsApp" />
            <Field name="email" label="Correo comercial" value={c.email} type="email" />
            <Field name="emailHseq" label="Correo HSEQ" value={c.emailHseq} type="email" />
            <Field name="hoursEs" label="Horario (español)" value={c.hours.es} />
            <Field name="hoursPt" label="Horario (portugués)" value={c.hours.pt} />
            <Field name="hoursEn" label="Horario (inglés)" value={c.hours.en} />
            <Field name="platformUrl" label="URL de TI-QMS" value={site.platformUrl} type="url" />
          </div>
        </Card>

        <Card title="Notificaciones de leads">
          <label className="block">
            <span className={labelClass}>Correos que reciben cada solicitud nueva</span>
            <textarea name="notifyTo" defaultValue={(site.notifyTo ?? []).join(", ")} className={`${fieldClass} min-h-20`} />
            <span className="mt-1 block text-xs text-mute">
              Separe varios con comas.
              {!site.notifyTo?.length && (envRecipients ? ` Mientras esté vacío se usa la configuración del servidor (${envRecipients}).` : " Mientras esté vacío no se envía ninguna notificación.")}
            </span>
          </label>
        </Card>
      </ActionForm>
    </div>
  );
}
