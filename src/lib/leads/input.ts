// Validation of a submitted lead (design document §11.3). The same schema serves the quote wizard,
// the rule-based assistant and, from stage 6, the chatbot's create-lead tool.
import { z } from "zod";
import { locales } from "@/i18n/config";
import { EMAIL, isPhone, locationKeys, methodKeys, quantityKeys, splitContact, urgencyKeys } from "./options";

// Blank optional fields arrive as "" from the forms; treat them as absent.
const text = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().max(max).optional());

const attribution = z
  .object({
    utmSource: text(200),
    utmMedium: text(200),
    utmCampaign: text(200),
    utmTerm: text(200),
    utmContent: text(200),
    referrer: text(500),
    landingPage: text(500),
    submittedFrom: text(500),
  })
  .partial()
  .default({});

export const leadInput = z
  .object({
    source: z.enum(["form_quote", "chatbot"]),
    lang: z.enum(locales),
    services: z.array(z.string().regex(/^[a-z0-9-]{1,60}$/)).max(12).default([]),
    methods: z.array(z.enum([...methodKeys, "unsure"])).max(5).default([]),
    quantity: z.enum(quantityKeys).optional(),
    location: z.enum(locationKeys).optional(),
    city: text(120),
    urgency: z.enum(urgencyKeys).optional(),
    description: text(2000),
    name: z.string().trim().min(2).max(120),
    company: text(160),
    email: text(160).pipe(z.string().regex(EMAIL).optional()),
    phone: text(40).pipe(z.string().refine(isPhone).optional()),
    /** The assistant asks for "phone or email" in one answer; split into email or phone below. */
    contact: text(160),
    consent: z.literal(true),
    turnstileToken: text(2048),
    /** Honeypot: hidden from people, so anything here came from a bot. */
    website: z.string().max(500).optional(),
    attribution,
  })
  .transform(({ contact, ...lead }) => (contact ? { ...lead, ...splitContact(contact, lead) } : lead))
  .refine((l) => l.email || l.phone, { path: ["email"], message: "email_or_phone" })
  .refine((l) => l.services.length > 0 || l.methods.length > 0 || l.description, { path: ["services"], message: "what_to_inspect" });

export type LeadInput = z.output<typeof leadInput>;
