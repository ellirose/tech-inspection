// The chatbot's knowledge base (design document §12.3), written from the published site content in the
// visitor's language. It is read through the same cached functions as the pages, so a change published in
// the admin reaches the bot as soon as it reaches the site. A short overview goes into the system prompt;
// the full text of a service or method comes from the get_service_info tool.
import "server-only";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getBlock, getCertifications, getMethods, getServices, getSite } from "@/lib/data/content";
import { SITE_URL } from "@/lib/site";

const list = (items: string[]) => items.map((i) => `  - ${i}`).join("\n");

export async function knowledgeBase(lang: Locale): Promise<string> {
  const [site, services, methods, certifications, standards, process, tiqms] = await Promise.all([
    getSite(),
    getServices(),
    getMethods(),
    getCertifications(),
    getBlock("standards"),
    getBlock("process"),
    getBlock("tiqms"),
  ]);
  const c = site.company;
  const contact = getDictionary(lang).contact;
  const methodName = Object.fromEntries(methods.map((m) => [m.key, `${m.name[lang]} (${m.code})`]));

  return [
    "## Company",
    `${c.name}. Address: ${c.address}, ${c.country[lang]}. Phone: ${c.phone}. WhatsApp: ${c.whatsappDisplay}. Email: ${c.email}. Hours: ${c.hours[lang]}.`,
    `Founded ${site.founded}; ${site.years}+ years of experience. Key partner: ${site.keyPartner.name} (since ${site.keyPartner.since}).`,
    `Inspections are done at the company's base (Vía Siberia, near Bogotá) or at the client's site or field.`,
    `Website: ${SITE_URL}/${lang}`,
    "",
    "## Services (slug: name. summary. scope. methods)",
    ...services.map((s) =>
      [`- ${s.slug}: ${s.name[lang]}. ${s.short[lang]}`, list(s.scope[lang]), `  Methods: ${s.methods.map((k) => methodName[k] ?? k).join(", ") || "—"}`].join("\n"),
    ),
    "",
    "## Inspection methods (key: name. what it is. what it detects)",
    ...methods.map((m) => [`- ${m.key}: ${m.name[lang]} (${m.code}). ${m.tagline[lang]}`, list(m.detects[lang])].join("\n")),
    "",
    "## Certifications held (only these; never claim others)",
    ...certifications.system.map((x) => `- ${x.code}: ${x.title[lang]}. ${x.body[lang]}`),
    ...certifications.personnel.map((x) => `- Personnel: ${x.code}: ${x.title[lang]}. ${x.body[lang]}`),
    "",
    "## Standards applied",
    ...standards.items.map((s) => `- ${s.code}: ${s.t[lang]} ${s.points[lang].join(", ")}. ${s.note[lang]}`),
    "",
    "## How an inspection runs",
    `${process.procedure[lang].join(" → ")}. ${process.lockText[lang]}`,
    "",
    "## From request to service (commercial procedure)",
    ...contact.flow.map((s, i) => `${i + 1}. ${s.t}: ${s.d}`),
    contact.flowRecurring,
    `${contact.flowImpartialTitle}: ${contact.flowImpartial}`,
    "",
    "## TI-QMS (client platform)",
    `${tiqms.title[lang]}. Sign in at ${site.platformUrl}.`,
    ...tiqms.features.map((f) => `- ${f.t[lang]}: ${f.d[lang]}`),
  ].join("\n");
}

/** Full text of one service (by slug) or method (by key or slug), for get_service_info; null when unknown. */
export async function topicInfo(topic: string, lang: Locale): Promise<string | null> {
  const key = topic.trim().toLowerCase();
  const [services, methods] = await Promise.all([getServices(), getMethods()]);
  const service = services.find((s) => s.slug === key);
  if (service) {
    const names = service.methods.map((k) => methods.find((m) => m.key === k)?.name[lang] ?? k);
    return [
      `${service.name[lang]} (${SITE_URL}/${lang}/servicios/${service.slug})`,
      service.short[lang],
      ...service.body.map((p) => p[lang]),
      `Scope:\n${list(service.scope[lang])}`,
      `Methods: ${names.join(", ")}`,
      service.draft ? "Note: this description is still being confirmed by the company; keep answers general." : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }
  const method = methods.find((m) => m.key === key || m.slug === key);
  if (method) {
    return [
      `${method.name[lang]} (${method.code}) (${SITE_URL}/${lang}/metodos/${method.slug})`,
      method.intro[lang],
      method.body[lang],
      `Detects:\n${list(method.detects[lang])}`,
      `Advantages:\n${list(method.advantages[lang])}`,
      `Steps:\n${list(method.steps.map((s) => `${s.title[lang]}: ${s.text[lang]}`))}`,
    ].join("\n\n");
  }
  return null;
}
