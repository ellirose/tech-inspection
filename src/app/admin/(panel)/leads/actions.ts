"use server";

// Lead changes from the inbox. Each one checks the role, writes the change to the lead's history
// (lead_event) and to the audit log, then refreshes the page.
import { refresh } from "next/cache";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { audit, requestIp } from "@/lib/audit";
import { authorize } from "@/lib/auth/session";
import { leadAssignees, statusLabels } from "@/lib/leads/admin";

export type ActionState = { ok?: string; error?: string };

const leadId = z.uuid();

async function loadLead(id: string) {
  const [lead] = await db.select({ id: schema.lead.id, status: schema.lead.status, assignedTo: schema.lead.assignedTo, reference: schema.lead.reference }).from(schema.lead).where(eq(schema.lead.id, id));
  return lead;
}

const statusInput = z.object({ id: leadId, status: z.enum(schema.lead.status.enumValues), note: z.string().trim().max(2000).optional() });

export async function changeLeadStatus(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await authorize("leads:write");
  const parsed = statusInput.safeParse({ id: form.get("id"), status: form.get("status"), note: form.get("note") || undefined });
  if (!parsed.success) return { error: "Datos no válidos." };
  const { id, status, note } = parsed.data;
  const lead = await loadLead(id);
  if (!lead) return { error: "El lead ya no existe." };
  if (lead.status === status && !note) return { ok: "Sin cambios." };

  await db.transaction(async (tx) => {
    if (lead.status !== status) await tx.update(schema.lead).set({ status }).where(eq(schema.lead.id, id));
    await tx.insert(schema.leadEvent).values({
      leadId: id,
      type: lead.status !== status ? "status" : "note",
      fromStatus: lead.status !== status ? lead.status : null,
      toStatus: lead.status !== status ? status : null,
      note,
      createdBy: user.id,
    });
  });
  await audit({ userId: user.id, action: "lead_status", entity: "lead", entityId: lead.reference, diff: { from: lead.status, to: status }, ip: requestIp(await headers()) });
  refresh();
  return { ok: lead.status !== status ? `Estado: ${statusLabels[status]}.` : "Nota agregada." };
}

const noteInput = z.object({ id: leadId, note: z.string().trim().min(1).max(2000) });

export async function addLeadNote(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await authorize("leads:write");
  const parsed = noteInput.safeParse({ id: form.get("id"), note: form.get("note") });
  if (!parsed.success) return { error: "Escriba la nota (hasta 2.000 caracteres)." };
  const lead = await loadLead(parsed.data.id);
  if (!lead) return { error: "El lead ya no existe." };
  await db.insert(schema.leadEvent).values({ leadId: lead.id, type: "note", note: parsed.data.note, createdBy: user.id });
  await audit({ userId: user.id, action: "lead_note", entity: "lead", entityId: lead.reference, ip: requestIp(await headers()) });
  refresh();
  return { ok: "Nota agregada." };
}

const assignInput = z.object({ id: leadId, assignee: z.union([z.uuid(), z.literal("")]) });

export async function assignLead(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await authorize("leads:write");
  const parsed = assignInput.safeParse({ id: form.get("id"), assignee: form.get("assignee") ?? "" });
  if (!parsed.success) return { error: "Datos no válidos." };
  const lead = await loadLead(parsed.data.id);
  if (!lead) return { error: "El lead ya no existe." };
  const assignee = parsed.data.assignee || null;
  const person = assignee ? (await leadAssignees()).find((u) => u.id === assignee) : null;
  if (assignee && !person) return { error: "Esa persona no puede recibir leads." };
  if (assignee === lead.assignedTo) return { ok: "Sin cambios." };

  await db.transaction(async (tx) => {
    await tx.update(schema.lead).set({ assignedTo: assignee }).where(eq(schema.lead.id, lead.id));
    await tx.insert(schema.leadEvent).values({ leadId: lead.id, type: "assigned", note: person ? person.name : "Sin asignar", createdBy: user.id });
  });
  await audit({ userId: user.id, action: "lead_assigned", entity: "lead", entityId: lead.reference, diff: { to: person?.name ?? null }, ip: requestIp(await headers()) });
  refresh();
  return { ok: person ? `Asignado a ${person.name}.` : "Sin asignar." };
}
