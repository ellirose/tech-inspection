// The two emails sent for every lead: a notification to the sales team (always in Spanish) and a
// confirmation to the requester in the language they used. Plain table HTML with inline styles,
// which is what mail clients render reliably, plus a text version.
import type { L10n, Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { escapeHtml as esc, type Email } from "@/lib/email";
import { whatsappLink } from "@/lib/site";
import { labelFor, locationKeys, quantityKeys, urgencyKeys } from "./options";
import type { Lead } from "./service";

export type EmailContext = {
  serviceNames: Record<string, L10n>;
  methodNames: Record<string, L10n>;
  company: { name: string; address: string; phone: string; email: string; whatsapp: string; hours: L10n };
};

const copy = {
  greeting: { es: "Hola", pt: "Olá", en: "Hello" },
  subject: { es: "Recibimos su solicitud", pt: "Recebemos sua solicitação", en: "We received your request" },
  intro: {
    es: "Gracias por escribirnos. Un asesor técnico revisará su solicitud y le contactará en horario hábil",
    pt: "Obrigado pelo contato. Um consultor técnico vai analisar sua solicitação e entrará em contato em horário comercial",
    en: "Thank you for contacting us. A technical advisor will review your request and get back to you during business hours",
  },
  reference: { es: "Referencia", pt: "Referência", en: "Reference" },
  methods: { es: "Métodos", pt: "Métodos", en: "Methods" },
  place: { es: "Lugar", pt: "Local", en: "Location" },
  summary: { es: "Resumen de su solicitud", pt: "Resumo da sua solicitação", en: "Summary of your request" },
  urgent: {
    es: "¿Es urgente? Escríbanos por WhatsApp citando su referencia.",
    pt: "É urgente? Fale conosco pelo WhatsApp informando sua referência.",
    en: "Is it urgent? Message us on WhatsApp quoting your reference.",
  },
  why: {
    es: "Recibe este correo porque solicitó una cotización en tech-inspection.com.",
    pt: "Você recebeu este e-mail porque solicitou um orçamento em tech-inspection.com.",
    en: "You are receiving this email because you requested a quote on tech-inspection.com.",
  },
} satisfies Record<string, L10n>;

const sourceLabel: Record<Lead["source"], string> = {
  form_quote: "Formulario de cotización",
  form_contact: "Formulario de contacto",
  chatbot: "Asistente del sitio",
};

type Row = [label: string, value: string | undefined, href?: string];

/** The request itself, labelled in `lang`. */
function requestRows(lead: Lead, ctx: EmailContext, lang: Locale): Row[] {
  const q = getDictionary(lang).quote;
  const methods = lead.methods.map((m) => (m === "unsure" ? q.unsure : (ctx.methodNames[m]?.[lang] ?? m)));
  return [
    [q.steps[0], lead.services.map((s) => ctx.serviceNames[s]?.[lang] ?? s).join(", ")],
    [copy.methods[lang], methods.join(", ")],
    [q.quantity, labelFor(quantityKeys, q.quantities, lead.quantity as (typeof quantityKeys)[number])],
    [copy.place[lang], labelFor(locationKeys, q.locations, lead.location as (typeof locationKeys)[number])],
    [q.city, lead.city ?? undefined],
    [q.urgency, labelFor(urgencyKeys, q.urgencies, lead.urgency)],
    [q.notes, lead.description ?? undefined],
  ];
}

const table = (rows: Row[]) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:15px">${rows
    .filter(([, v]) => v)
    .map(
      ([label, value, href]) =>
        `<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid #e3eaf0;color:#5b6b7a;vertical-align:top;width:38%">${esc(label)}</td><td style="padding:8px 0;border-bottom:1px solid #e3eaf0;color:#0a1d30;white-space:pre-line">${
          href ? `<a href="${esc(href)}" style="color:#1f37d6">${esc(value!)}</a>` : esc(value!)
        }</td></tr>`,
    )
    .join("")}</table>`;

const textTable = (rows: Row[]) =>
  rows
    .filter(([, v]) => v)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

const layout = (title: string, body: string, footer: string) =>
  `<!doctype html><html><body style="margin:0;background:#f2f7fa;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0a1d30">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#1f37d6;padding:20px 28px;color:#ffffff;font-size:20px;font-weight:700">Tech-Inspection</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3">${esc(title)}</h1>
${body}
</td></tr>
<tr><td style="padding:18px 28px;background:#f7fafc;color:#5b6b7a;font-size:12px;line-height:1.5">${footer}</td></tr>
</table></td></tr></table></body></html>`;

const bogota = (d: Date) => new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeStyle: "short", timeZone: "America/Bogota" }).format(d);

export function teamEmail(lead: Lead, ctx: EmailContext, to: string[]): Email {
  const a = lead.attribution;
  const phoneDigits = lead.phone?.replace(/\D/g, "");
  const firstService = lead.services[0] ? ctx.serviceNames[lead.services[0]]?.es : undefined;
  const urgency = labelFor(urgencyKeys, getDictionary("es").quote.urgencies, lead.urgency);
  const subject = [`Nueva solicitud ${lead.reference}`, firstService && `${firstService}${lead.services.length > 1 ? ` +${lead.services.length - 1}` : ""}`, urgency]
    .filter(Boolean)
    .join(" · ");

  const contact: Row[] = [
    ["Nombre", lead.name],
    ["Empresa", lead.company ?? undefined],
    ["Correo", lead.email ?? undefined, lead.email ? `mailto:${lead.email}` : undefined],
    ["Teléfono", lead.phone ?? undefined, phoneDigits ? `https://wa.me/${phoneDigits.length === 10 ? `57${phoneDigits}` : phoneDigits}` : undefined],
  ];
  const meta: Row[] = [
    ["Referencia", lead.reference],
    ["Recibida", bogota(lead.createdAt)],
    ["Canal", sourceLabel[lead.source]],
    ["Idioma", lead.lang.toUpperCase()],
    ["Campaña", [a.utmSource, a.utmMedium, a.utmCampaign].filter(Boolean).join(" / ") || undefined],
    ["Enviada desde", a.submittedFrom],
    ["Página de entrada", a.landingPage],
    ["Referente", a.referrer],
    ["Dispositivo", a.device],
  ];
  const request = requestRows(lead, ctx, "es");
  const h2 = (s: string) => `<h2 style="margin:24px 0 8px;font-size:16px;color:#1f37d6">${s}</h2>`;
  const replyHint = lead.email ? "Responda a este correo para escribir directamente al solicitante." : "El solicitante no dejó correo: contáctelo por teléfono o WhatsApp.";

  return {
    to,
    subject,
    replyTo: lead.email ?? undefined,
    idempotencyKey: `lead-${lead.reference}-team`,
    html: layout(
      "Nueva solicitud de cotización",
      `${h2("Contacto")}${table(contact)}${h2("Solicitud")}${table(request)}${h2("Registro")}${table(meta)}<p style="margin:20px 0 0;color:#5b6b7a;font-size:14px">${esc(replyHint)}</p>`,
      esc(`${ctx.company.name} · Notificación automática del sitio web`),
    ),
    text: `Nueva solicitud de cotización\n\n${textTable(contact)}\n\n${textTable(request)}\n\n${textTable(meta)}\n\n${replyHint}\n`,
  };
}

export function confirmationEmail(lead: Lead & { email: string }, ctx: EmailContext): Email {
  const lang = lead.lang as Locale;
  const c = ctx.company;
  const intro = `${copy.intro[lang]} (${c.hours[lang]}).`;
  const wa = whatsappLink(c.whatsapp, `${getDictionary(lang).quote.waIntro} ${lead.reference}`);
  const request = requestRows(lead, ctx, lang);
  const footer = `${c.name} · ${c.address} · ${c.phone}`;

  return {
    to: [lead.email],
    subject: `${copy.subject[lang]} ${lead.reference}`,
    replyTo: c.email,
    idempotencyKey: `lead-${lead.reference}-confirmation`,
    html: layout(
      `${copy.greeting[lang]} ${lead.name},`,
      `<p style="margin:0 0 16px;font-size:15px;line-height:1.6">${esc(intro)}</p>
<p style="margin:0 0 20px;font-size:15px">${esc(copy.reference[lang])}: <strong style="font-family:Consolas,monospace;font-size:17px">${esc(lead.reference)}</strong></p>
<h2 style="margin:0 0 8px;font-size:16px;color:#1f37d6">${esc(copy.summary[lang])}</h2>${table(request)}
<p style="margin:24px 0 0;font-size:15px"><a href="${esc(wa)}" style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px">WhatsApp</a></p>
<p style="margin:12px 0 0;font-size:14px;color:#5b6b7a">${esc(copy.urgent[lang])}</p>`,
      `${esc(footer)}<br>${esc(copy.why[lang])}`,
    ),
    text: `${copy.greeting[lang]} ${lead.name},\n\n${intro}\n\n${copy.reference[lang]}: ${lead.reference}\n\n${copy.summary[lang]}\n${textTable(request)}\n\n${copy.urgent[lang]} ${wa}\n\n${footer}\n${copy.why[lang]}\n`,
  };
}
