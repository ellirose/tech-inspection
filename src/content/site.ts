import type { L10n } from "@/i18n/config";

/**
 * Absolute base for canonical URLs, sitemap and OG images. Set NEXT_PUBLIC_SITE_URL in Vercel;
 * until the domain moves off Wix, Vercel's own production URL is used so share previews work.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://www.tech-inspection.com");
export const FOUNDED = 2017;
/** Years of experience rendered on the server; the browser recomputes from FOUNDED. */
export const YEARS_FALLBACK = 9;
export const PLATFORM_URL = "https://plataforma.tech-inspection.com/";

export const company = {
  name: "TECH-INSPECTION S.A.S.",
  short: "Tech-Inspection",
  address: "Autopista Medellín Km 3.4, Lc. A-11, Vía Siberia",
  country: { es: "Colombia", pt: "Colômbia", en: "Colombia" } satisfies L10n,
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Autopista+Medell%C3%ADn+Km+3.4+V%C3%ADa+Siberia+Colombia",
  // Main commercial line (published in the current site footer)
  phone: "+57 321 828 4129",
  phoneHref: "tel:+573218284129",
  whatsapp: "573218284129",
  email: "gerencia-operaciones@tech-inspection.com",
  emailHseq: "gestion.integral@tech-inspection.com",
  hours: {
    es: "Lun–Vie 8:00–18:00 · Sáb 8:00–12:00",
    pt: "Seg–Sex 8h–18h · Sáb 8h–12h",
    en: "Mon–Fri 8:00–18:00 · Sat 8:00–12:00",
  } satisfies L10n,
};

export const whatsappLink = (text: string) =>
  `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(text)}`;

export type Certification = {
  id: string;
  code: string;
  ring: string;
  title: L10n;
  body: L10n;
};

// Text badges only: official seals stay off the site until the client shares each brand-usage manual.
export const certifications: Certification[] = [
  {
    id: "iso9001",
    code: "ISO 9001",
    ring: "ISO 9001:2015 · QUALITY · ",
    title: { es: "Gestión de calidad", pt: "Gestão da qualidade", en: "Quality management" },
    body: {
      es: "Procesos controlados y mejora continua en cada inspección e informe.",
      pt: "Processos controlados e melhoria contínua em cada inspeção e relatório.",
      en: "Controlled processes and continual improvement in every inspection and report.",
    },
  },
  {
    id: "iso45001",
    code: "ISO 45001",
    ring: "ISO 45001:2018 · OH&S · ",
    title: { es: "Seguridad y salud en el trabajo", pt: "Saúde e segurança ocupacional", en: "Occupational health & safety" },
    body: {
      es: "Personal protegido en base y en campo, con riesgos identificados y controlados.",
      pt: "Equipe protegida na base e em campo, com riscos identificados e controlados.",
      en: "People protected at base and in the field, with risks identified and controlled.",
    },
  },
  {
    id: "d1072",
    code: "1072",
    ring: "DECRETO 1072 DE 2015 · SG-SST · ",
    title: { es: "Decreto 1072 de 2015", pt: "Decreto 1072 de 2015", en: "Decree 1072 of 2015" },
    body: {
      es: "Cumplimiento del Sistema de Gestión de Seguridad y Salud en el Trabajo de Colombia.",
      pt: "Conformidade com o Sistema de Gestão de Saúde e Segurança no Trabalho da Colômbia.",
      en: "Compliance with Colombia's occupational health and safety management system.",
    },
  },
  {
    id: "ruc",
    code: "RUC",
    ring: "RUC · CONSEJO COLOMBIANO DE SEGURIDAD · ",
    title: { es: "Calificación RUC", pt: "Qualificação RUC", en: "RUC rating" },
    body: {
      es: "Evaluados por el Consejo Colombiano de Seguridad para contratistas del sector.",
      pt: "Avaliados pelo Conselho Colombiano de Segurança para contratadas do setor.",
      en: "Rated by the Colombian Safety Council for industry contractors.",
    },
  },
];

export const personnelCredentials = [
  {
    code: "ASNT-TC-1A",
    title: { es: "Personal certificado", pt: "Equipe certificada", en: "Certified personnel" },
    body: {
      es: "Inspectores calificados según la práctica recomendada ASNT SNT-TC-1A.",
      pt: "Inspetores qualificados conforme a prática recomendada ASNT SNT-TC-1A.",
      en: "Inspectors qualified under ASNT recommended practice SNT-TC-1A.",
    },
  },
  {
    code: "DS-1",
    title: { es: "Lineamientos DS-1", pt: "Diretrizes DS-1", en: "DS-1 guidelines" },
    body: {
      es: "Formación en inspección de sarta de perforación bajo lineamientos DS-1.",
      pt: "Formação em inspeção de coluna de perfuração conforme diretrizes DS-1.",
      en: "Trained in drill-stem inspection under DS-1 guidelines.",
    },
  },
];

export const clients = [
  { name: "SmartStar Oil & Gas Service Company", logo: "/media/clients/smartstar.png" },
  { name: "Petroexpress Supply", logo: "/media/clients/petroexpress.png" },
  { name: "Universal Machining & Engineering", logo: "/media/clients/universal.png" },
  { name: "Amertuval", logo: "/media/clients/amertuval.png", square: true },
  { name: "CT&B Colombian Tools & Bits", logo: "/media/clients/ctb.png", square: true },
];

export const leadership = [
  {
    name: "Julio César Contreras",
    photo: "/media/team/julio.jpg",
    email: "gerencia-operaciones@tech-inspection.com",
    role: { es: "Gerente general", pt: "Gerente geral", en: "General manager" },
    bio: {
      es: "Lidera la compañía desde mayo de 2017 con estrategias de crecimiento en los mercados metalmecánico y de hidrocarburos.",
      pt: "Lidera a empresa desde maio de 2017 com estratégias de crescimento nos mercados metalmecânico e de hidrocarbonetos.",
      en: "Has led the company since May 2017, driving growth in the metalworking and oil & gas markets.",
    },
  },
  {
    name: "Mariela Bustos",
    photo: "/media/team/mariela.jpg",
    email: "administracion@tech-inspection.com",
    role: {
      es: "Jefe administrativa y financiera",
      pt: "Gerente administrativa e financeira",
      en: "Head of administration & finance",
    },
    bio: {
      es: "Administra los recursos de la compañía desde 2017 y representa el Sistema de Gestión Integral, impulsando la mejora continua.",
      pt: "Administra os recursos da empresa desde 2017 e representa o Sistema de Gestão Integrada, impulsionando a melhoria contínua.",
      en: "Has managed company resources since 2017 and represents the Integrated Management System, driving continual improvement.",
    },
  },
];

// Customer-service directory as published on the current Contact page.
export const channels = [
  {
    role: { es: "Gerencia", pt: "Gerência", en: "Management" },
    scope: {
      es: "Procesos comerciales, requisiciones de alto valor, PQRS mayores",
      pt: "Processos comerciais, requisições de alto valor, reclamações maiores",
      en: "Commercial processes, high-value requisitions, major claims",
    },
    phone: "321 828 4129",
    email: "gerencia-operaciones@tech-inspection.com",
  },
  {
    role: { es: "Coordinación operacional", pt: "Coordenação operacional", en: "Operations coordination" },
    scope: {
      es: "Programación de servicios, informes, soporte técnico",
      pt: "Programação de serviços, relatórios, suporte técnico",
      en: "Service scheduling, reports, technical support",
    },
    phone: "301 426 9701",
    email: "operaciones@tech-inspection.com",
  },
  {
    role: { es: "Cotizaciones y facturación", pt: "Orçamentos e faturamento", en: "Quotes & invoicing" },
    scope: {
      es: "Cotizaciones, facturación, cuentas de cobro y estados de cuenta",
      pt: "Orçamentos, faturamento, cobranças e extratos",
      en: "Quotes, invoicing, collections and statements",
    },
    phone: "315 692 6572",
    email: "auxiliar.contable@tech-inspection.com",
  },
  {
    role: { es: "Gestión integral (HSEQ)", pt: "Gestão integrada (HSEQ)", en: "Integrated management (HSEQ)" },
    scope: {
      es: "Auditorías, documentación, PQRS de SST y HSEQ",
      pt: "Auditorias, documentação, reclamações de SST e HSEQ",
      en: "Audits, documentation, OHS & HSEQ claims",
    },
    phone: "313 403 2592",
    email: "gestion.integral@tech-inspection.com",
  },
  {
    role: { es: "Administrativa y financiera", pt: "Administrativa e financeira", en: "Administration & finance" },
    scope: {
      es: "Cartera, documentación y procedimientos",
      pt: "Carteira, documentação e procedimentos",
      en: "Accounts receivable, documentation and procedures",
    },
    phone: "310 602 2075",
    email: "gerencia-operaciones@tech-inspection.com",
  },
  {
    role: { es: "Contabilidad", pt: "Contabilidade", en: "Accounting" },
    scope: {
      es: "Certificados de retenciones",
      pt: "Certificados de retenções",
      en: "Withholding certificates",
    },
    phone: "312 434 3444",
    email: "dadministracion@tech-inspection.com",
  },
];

export type DocItem = { code: string; title: L10n; file: string; year?: number };

export const policyDocs: DocItem[] = [
  {
    code: "PL-01-5",
    title: { es: "Política de Gestión Integral", pt: "Política de Gestão Integrada", en: "Integrated Management Policy" },
    file: "/docs/PL-01-5-Politica-de-Gestion-Integral.pdf",
  },
  {
    code: "FE-02-53-3",
    title: { es: "Alcance del SGI V4", pt: "Escopo do SGI V4", en: "IMS Scope V4" },
    file: "/docs/FE-02-53-3-Alcance-del-SGI-V4.pdf",
  },
  {
    code: "PL-09-1",
    title: { es: "Política de Protección de Datos", pt: "Política de Proteção de Dados", en: "Data Protection Policy" },
    file: "/docs/PL-09-1-Politica-Proteccion-de-Datos.pdf",
  },
];

export const accountabilityDocs: DocItem[] = [2017, 2018, 2019, 2020, 2021].map((year) => ({
  code: "FE-02-22-1",
  year,
  title: { es: `Rendición de cuentas ${year}`, pt: `Prestação de contas ${year}`, en: `Accountability report ${year}` },
  file: `/docs/Rendicion-de-Cuentas-${year}.pdf`,
}));
