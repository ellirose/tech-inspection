// Tools the chatbot can call (design document §12.3). get_service_info runs on the server and its answer
// goes back to the model. create_lead and show_contact end the turn: they show a card in the widget, and
// a lead is stored only when the visitor confirms that card, through /api/leads with the same checks as
// the quote form (consent, Turnstile, rate limits). The model can never store a lead by itself.
import "server-only";
import type { ChatCompletionFunctionTool } from "openai/resources/chat/completions";
import { z } from "zod";
import { EMAIL, isPhone, locationKeys, methodKeys, quantityKeys, urgencyKeys } from "@/lib/leads/options";
import type { LeadDraft } from "./protocol";

const optionalText = (max: number) => z.string().trim().max(max).optional().transform((v) => v || undefined);

/** Validates create_lead input; the same limits as the lead form's schema (lib/leads/input.ts). */
export const leadDraftInput = z
  .object({
    services: z.array(z.string().regex(/^[a-z0-9-]{1,60}$/)).max(12).default([]),
    methods: z.array(z.enum([...methodKeys, "unsure"])).max(5).default([]),
    industry: optionalText(120),
    component: optionalText(160),
    quantity: z.enum(quantityKeys).optional(),
    location: z.enum(locationKeys).optional(),
    city: optionalText(120),
    urgency: z.enum(urgencyKeys).optional(),
    description: optionalText(2000),
    name: z.string().trim().min(2).max(120),
    company: optionalText(160),
    role: optionalText(120),
    email: optionalText(160).refine((v) => !v || EMAIL.test(v), "not a valid email address"),
    phone: optionalText(40).refine((v) => !v || isPhone(v), "not a valid phone number (7 to 15 digits)"),
    preferredChannel: z.enum(["email", "phone", "whatsapp"]).optional(),
  })
  .refine((l) => l.email || l.phone, { path: ["email"], message: "ask for an email or a phone number" })
  .refine((l) => l.services.length > 0 || l.methods.length > 0 || l.description, { path: ["services"], message: "say what needs inspecting" });

export const getServiceInfoInput = z.object({ topic: z.string().trim().min(1).max(60) });

const text = (description: string) => ({ type: "string", description });

/** In a fixed order and unchanged between requests, so the prompt cache holds. */
const tools = [
  {
    name: "get_service_info",
    description:
      "Returns the full description of one service or inspection method from the website: what it covers, scope, methods, what it detects and its steps. Use it before answering detailed questions about a service or method.",
    parameters: {
      type: "object",
      properties: { topic: text("A service slug or a method key (ut, mt, pt, vt) from the knowledge base.") },
      required: ["topic"],
      additionalProperties: false,
    },
  },
  {
    name: "create_lead",
    description:
      "Shows the visitor a summary card of their quote request with a data-processing consent checkbox and a confirm button. The request is stored only if the visitor confirms on the card. Call it once you have collected what to inspect, the quantity, the place, the priority and the contact details; call it again with corrected data if the visitor asks for a change.",
    parameters: {
      type: "object",
      properties: {
        services: { type: "array", items: { type: "string" }, description: "Service slugs from the knowledge base." },
        methods: { type: "array", items: { type: "string", enum: [...methodKeys, "unsure"] }, description: "Method keys, if the visitor named any; \"unsure\" if they don't know." },
        industry: text("The visitor's industry, e.g. oil drilling, construction."),
        component: text("Component or equipment to inspect, e.g. drill pipe 5\", PDC bits, slings."),
        quantity: { type: "string", enum: [...quantityKeys], description: "Approximate number of parts." },
        location: { type: "string", enum: [...locationKeys], description: "base: at the company's base; field: at the visitor's site or field." },
        city: text("City or field name."),
        urgency: { type: "string", enum: [...urgencyKeys] },
        description: text("Anything else useful for the advisor, in the visitor's language: sizes, standards, dates they mentioned."),
        name: text("Full name."),
        company: text("Company."),
        role: text("Job title."),
        email: text("Email address."),
        phone: text("Phone or WhatsApp number."),
        preferredChannel: { type: "string", enum: ["email", "phone", "whatsapp"] },
      },
      required: ["name"],
      additionalProperties: false,
    },
  },
  {
    name: "show_contact",
    description: "Shows the visitor buttons to continue on WhatsApp or call the sales line. Use it when they ask for a person or you cannot help.",
    parameters: { type: "object", properties: {}, additionalProperties: false },
  },
];

/** The tools in the OpenAI function-calling format. Inputs are validated with Zod before anything runs. */
export const chatTools: ChatCompletionFunctionTool[] = tools.map((t) => ({ type: "function", function: t }));

/** Keeps only services that exist on the site; the draft is what the widget shows and sends to /api/leads. */
export function toDraft(input: z.output<typeof leadDraftInput>, knownServices: Set<string>): LeadDraft {
  return { ...input, services: input.services.filter((s) => knownServices.has(s)) };
}
