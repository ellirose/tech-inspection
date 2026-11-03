"use server";

// Company settings (design document §14.2, Configuración). Saving refreshes every public page that
// shows these values through the content:site cache tag.
import { refresh, updateTag } from "next/cache";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { audit, requestIp } from "@/lib/audit";
import { authorize } from "@/lib/auth/session";
import { tags } from "@/lib/data/content";
import { refreshPublicPages } from "@/lib/admin/refresh";

export type ActionState = { ok?: string; error?: string };

const line = (max = 200) => z.string().trim().min(1).max(max);
const phone = line(40).refine((v) => /^\+?[\d\s().-]{7,}$/.test(v), "Teléfono no válido");
const settingsInput = z.object({
  name: line(160),
  short: line(60),
  address: line(200),
  countryEs: line(60),
  countryPt: line(60),
  countryEn: line(60),
  mapsUrl: z.url({ protocol: /^https$/ }),
  phone,
  whatsapp: phone,
  email: z.email(),
  emailHseq: z.email(),
  hoursEs: line(120),
  hoursPt: line(120),
  hoursEn: line(120),
  platformUrl: z.url({ protocol: /^https$/ }),
  founded: z.coerce.number().int().min(1950).max(2100),
  notifyTo: z
    .string()
    .transform((v) => v.split(/[,;\s]+/).map((s) => s.trim().toLowerCase()).filter(Boolean))
    .pipe(z.array(z.email()).max(10)),
});

// PostgreSQL returns JSONB objects with their keys reordered, so compare values with sorted keys.
const canonical = (v: unknown): unknown =>
  v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, canonical(x)])) : v;
const same = (a: unknown, b: unknown) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

const fieldNames: Record<string, string> = {
  name: "Razón social",
  short: "Nombre corto",
  address: "Dirección",
  mapsUrl: "Enlace del mapa",
  phone: "Teléfono",
  whatsapp: "WhatsApp",
  email: "Correo comercial",
  emailHseq: "Correo HSEQ",
  platformUrl: "URL de TI-QMS",
  founded: "Año de fundación",
  notifyTo: "Destinatarios de leads",
  country: "País",
  hours: "Horario",
};

export async function saveSettings(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await authorize("settings:manage");
  const parsed = settingsInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => fieldNames[String(i.path[0])] ?? String(i.path[0])))];
    return { error: `Revise: ${fields.join(", ")}.` };
  }
  const v = parsed.data;
  const [row] = await db.select().from(schema.siteSettings).limit(1);
  const before = row.data;
  const digits = (s: string) => s.replace(/\D/g, "");

  const data = {
    ...before,
    company: {
      ...before.company,
      name: v.name,
      short: v.short,
      address: v.address,
      country: { es: v.countryEs, pt: v.countryPt, en: v.countryEn },
      mapsUrl: v.mapsUrl,
      phone: v.phone,
      phoneHref: `tel:+${digits(v.phone)}`,
      // wa.me needs the full international number as digits only.
      whatsapp: digits(v.whatsapp),
      whatsappDisplay: v.whatsapp,
      email: v.email,
      emailHseq: v.emailHseq,
      hours: { es: v.hoursEs, pt: v.hoursPt, en: v.hoursEn },
    },
    platformUrl: v.platformUrl,
    founded: v.founded,
    notifyTo: v.notifyTo,
  };

  const changed = [
    ...Object.keys(data.company).filter((k) => !same(data.company[k as keyof typeof data.company], before.company[k as keyof typeof before.company])),
    ...(["platformUrl", "founded", "notifyTo"] as const).filter((k) => !same(data[k], before[k])),
  ];
  if (!changed.length) return { ok: "Sin cambios." };

  await db.update(schema.siteSettings).set({ data, updatedBy: user.id }).where(eq(schema.siteSettings.id, row.id));
  await audit({ userId: user.id, action: "settings_updated", entity: "site_settings", diff: { campos: changed.filter((k) => k !== "phoneHref" && k !== "whatsappDisplay").map((k) => fieldNames[k] ?? k).join(", ") }, ip: requestIp(await headers()) });
  updateTag(tags.site);
  await refreshPublicPages(["", "/contacto", "/nosotros", "/hseq", "/plataforma"]);
  refresh();
  return { ok: "Configuración guardada. El sitio se actualiza en unos segundos." };
}
