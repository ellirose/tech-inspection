// /llms.txt (design document §16.5): a short, factual summary of the company, its services and key URLs
// for AI assistants, written from the published content in Spanish, so it follows admin edits.
import { cacheLife, cacheTag } from "next/cache";
import { getCertifications, getFaqs, getIndustries, getMethods, getServices, getSite, tags } from "@/lib/data/content";
import { SITE_URL } from "@/lib/site";

async function build() {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.all);
  const [site, methods, services, industries, certs, faqs] = await Promise.all([getSite(), getMethods(), getServices(), getIndustries(), getCertifications(), getFaqs()]);
  const { company } = site;
  const url = (p: string) => `${SITE_URL}/es${p}`;
  const lines = [
    `# ${company.name}`,
    "",
    `> Empresa colombiana de ensayos no destructivos (END/NDT), inspección y aseguramiento de calidad QA/QC para herramientas y equipos de la industria de petróleo y gas. Fundada en ${site.founded}. Base de operaciones: ${company.address}, Colombia; también inspecciona en campo.`,
    "",
    `- Teléfono: ${company.phone} · WhatsApp: +${company.whatsapp} · Correo: ${company.email}`,
    `- Horario: ${company.hours.es}`,
    `- Plataforma de clientes TI-QMS (informes y trazabilidad): ${site.platformUrl}`,
    `- Idiomas del sitio: español (${SITE_URL}/es), portugués (${SITE_URL}/pt), inglés (${SITE_URL}/en)`,
    "",
    "## Métodos de ensayo",
    ...methods.map((m) => `- [${m.code} · ${m.name.es}](${url(`/metodos/${m.slug}`)}): ${m.tagline.es}`),
    "",
    "## Servicios",
    ...services.map((s) => `- [${s.name.es}](${url(`/servicios/${s.slug}`)}): ${s.short.es}`),
    "",
    "## Industrias",
    ...industries.map((i) => `- [${i.name.es}](${url(`/industrias/${i.slug}`)})`),
    "",
    "## Certificaciones",
    ...certs.system.map((c) => `- ${c.code}: ${c.title.es}${c.certifier ? ` (${c.certifier})` : ""}. ${c.body.es}`),
    ...certs.personnel.map((c) => `- ${c.code}: ${c.title.es}. ${c.body.es}`),
    "",
    "## Preguntas frecuentes",
    ...faqs.map((f) => `- ${f.question.es} ${f.answer.es}`),
    "",
    "## Páginas clave",
    `- [Solicitar cotización](${url("/cotizar")})`,
    `- [Contacto](${url("/contacto")})`,
    `- [Nosotros](${url("/nosotros")})`,
    `- [HSEQ y políticas](${url("/hseq")})`,
    `- [Certificaciones](${url("/certificaciones")})`,
    `- [Preguntas frecuentes](${url("/preguntas-frecuentes")})`,
    `- [Política de privacidad](${url("/politica-de-privacidad")})`,
    "",
    "Las cotizaciones, precios y plazos los confirma un asesor; el sitio no publica precios.",
    "",
  ];
  return lines.join("\n");
}

export async function GET() {
  return new Response(await build(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
