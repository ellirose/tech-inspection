// Queries behind the admin leads inbox. Callers check the role first (requireUser / authorize).
import "server-only";
import { and, asc, count, desc, eq, gte, ilike, inArray, lt, or, SQL, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { getDictionary } from "@/i18n/dictionaries";
import { can } from "@/lib/auth/roles";
import { labelFor, urgencyKeys } from "./options";

const l = schema.lead;

export const statusLabels: Record<(typeof l.status.enumValues)[number], string> = {
  new: "Nuevo",
  contacted: "Contactado",
  quoted: "Cotizado",
  won: "Ganado",
  lost: "Perdido",
};
export const sourceLabels: Record<(typeof l.source.enumValues)[number], string> = {
  form_quote: "Formulario de cotización",
  form_contact: "Formulario de contacto",
  chatbot: "Asistente",
};
export const urgencyLabel = (key: string | null) => labelFor(urgencyKeys, getDictionary("es").quote.urgencies, key as (typeof urgencyKeys)[number]) ?? "—";

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) => z.enum(values).optional().catch(undefined);
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);

/** Inbox filters as they appear in the URL (?estado=new&fuente=chatbot…). Invalid values are ignored. */
export const leadFilters = z.object({
  estado: optionalEnum(l.status.enumValues),
  fuente: optionalEnum(l.source.enumValues),
  urgencia: optionalEnum(l.urgency.enumValues),
  servicio: z.string().regex(/^[a-z0-9-]{1,60}$/).optional().catch(undefined),
  asignado: z.string().max(40).optional().catch(undefined),
  desde: day,
  hasta: day,
  q: z.string().trim().max(100).optional().catch(undefined),
  pagina: z.coerce.number().int().min(1).max(1000).optional().catch(undefined),
});
export type LeadFilters = z.infer<typeof leadFilters>;

/** Reads filters from Next's searchParams object, taking the first value of repeated keys. */
export const parseLeadFilters = (params: Record<string, string | string[] | undefined>) =>
  leadFilters.parse(Object.fromEntries(Object.entries(params).map(([k, v]) => [k, (Array.isArray(v) ? v[0] : v) || undefined])));

// Dates are entered as Colombian calendar days.
const bogotaDay = (d: string, plusDays = 0) => new Date(new Date(`${d}T00:00:00-05:00`).getTime() + plusDays * 86_400_000);

export function leadWhere(f: LeadFilters): SQL | undefined {
  const conditions = [
    f.estado && eq(l.status, f.estado),
    f.fuente && eq(l.source, f.fuente),
    f.urgencia && eq(l.urgency, f.urgencia),
    f.servicio && sql`${l.services} @> ${JSON.stringify([f.servicio])}::jsonb`,
    f.asignado === "ninguno" ? sql`${l.assignedTo} is null` : f.asignado ? eq(l.assignedTo, f.asignado) : undefined,
    f.desde && gte(l.createdAt, bogotaDay(f.desde)),
    f.hasta && lt(l.createdAt, bogotaDay(f.hasta, 1)),
    f.q &&
      or(
        ilike(l.name, `%${escapeLike(f.q)}%`),
        ilike(l.company, `%${escapeLike(f.q)}%`),
        ilike(l.email, `%${escapeLike(f.q)}%`),
        ilike(l.phone, `%${escapeLike(f.q)}%`),
        ilike(l.reference, `%${escapeLike(f.q)}%`),
        ilike(l.description, `%${escapeLike(f.q)}%`),
      ),
  ];
  const active = conditions.filter((c) => c instanceof SQL);
  return active.length ? and(...active) : undefined;
}

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export const PAGE_SIZE = 50;

export async function listLeads(f: LeadFilters) {
  const where = leadWhere(f);
  const page = f.pagina ?? 1;
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: l.id,
        reference: l.reference,
        createdAt: l.createdAt,
        source: l.source,
        status: l.status,
        urgency: l.urgency,
        services: l.services,
        description: l.description,
        files: sql<number>`jsonb_array_length(${l.attachments})`.mapWith(Number),
        name: l.name,
        company: l.company,
        assignee: schema.user.name,
      })
      .from(l)
      .leftJoin(schema.user, eq(sql`${schema.user.id}::text`, l.assignedTo))
      .where(where)
      .orderBy(desc(l.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(l).where(where),
  ]);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** All leads matching the filters, for CSV export. */
export const exportLeads = (f: LeadFilters) => db.select().from(l).where(leadWhere(f)).orderBy(asc(l.createdAt));

export async function getLead(reference: string) {
  const [lead] = await db.select().from(l).where(eq(l.reference, reference));
  if (!lead) return null;
  const events = await db
    .select({ id: schema.leadEvent.id, type: schema.leadEvent.type, from: schema.leadEvent.fromStatus, to: schema.leadEvent.toStatus, note: schema.leadEvent.note, at: schema.leadEvent.createdAt, by: schema.user.name })
    .from(schema.leadEvent)
    .leftJoin(schema.user, eq(sql`${schema.user.id}::text`, schema.leadEvent.createdBy))
    .where(eq(schema.leadEvent.leadId, lead.id))
    .orderBy(desc(schema.leadEvent.createdAt));
  return { lead, events };
}

/** Active accounts that can work leads, for the assignment list. */
export async function leadAssignees() {
  const users = await db
    .select({ id: schema.user.id, name: schema.user.name, role: schema.user.role })
    .from(schema.user)
    .where(and(eq(schema.user.active, true), inArray(schema.user.role, ["super_admin", "sales"])))
    .orderBy(asc(schema.user.name));
  return users.filter((u) => can(u.role, "leads:write"));
}
