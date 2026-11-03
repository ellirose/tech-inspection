// The one place leads are created, whatever the channel (design document §11.3): the database write
// comes first, so a lead is never lost to an email failure; notifications follow (see notify.ts).
import "server-only";
import { randomBytes } from "node:crypto";
import { db as defaultDb, schema, type Db } from "@/db";
import type { LeadInput } from "./input";

export type Lead = typeof schema.lead.$inferSelect;

// No 0/O or 1/I, so a reference read over the phone is unambiguous.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const newReference = () => `TI-${[...randomBytes(8)].map((b) => ALPHABET[b % ALPHABET.length]).join("")}`;

export async function createLead(input: LeadInput, context: { device?: string; attachments?: Lead["attachments"] } = {}, db: Db = defaultDb): Promise<Lead> {
  // Listed one by one so nothing else on the input (the Turnstile token, the honeypot) is stored.
  const { source, lang, services, methods, industry, component, quantity, location, city, urgency, description, name, company, role, preferredChannel, email, phone, attribution } = input;
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.transaction(async (tx) => {
        const [lead] = await tx
          .insert(schema.lead)
          .values({
            ...{ source, lang, services, methods, industry, component, quantity, location, city, urgency, description, name, company, role, preferredChannel, email, phone },
            reference: newReference(),
            attachments: context.attachments ?? [],
            consent: true,
            consentAt: new Date(),
            attribution: { ...attribution, device: context.device },
          })
          .returning();
        await tx.insert(schema.leadEvent).values({ leadId: lead.id, type: "created", toStatus: "new" });
        return lead;
      });
    } catch (error) {
      // A reference collision (32^8 combinations) is retried with a new one.
      const code = (error as { cause?: { code?: string } }).cause?.code ?? (error as { code?: string }).code;
      if (code === "23505" && attempt < 3) continue;
      throw error;
    }
  }
}

/** Records the outcome of a follow-up step on the lead's history. */
export async function addLeadEvent(leadId: string, type: string, note?: string, db: Db = defaultDb) {
  await db.insert(schema.leadEvent).values({ leadId, type, note });
}
