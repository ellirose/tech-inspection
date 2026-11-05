import type { L10n } from "@/i18n/config";

/**
 * The client's service portfolio and two sales decks, shown as one continuous scroll on /portafolio.
 * Pages are WebP renders (`p-NN`, 1920×1080 for the decks, 1414×2000 for the portfolio) plus small
 * thumbnails (`t-NN`) in /media/brochure/<key>/; each download is a compact image PDF built from the
 * same renders (the decks' originals weigh 25–39 MB).
 * Sources: doc/02-client-materials/presentacion cliente ulterra.pdf, doc/New file/Presentación Jaime.pdf
 * and doc/New file/Copia de PORTAFOLIO.
 */
export type BrochurePage = { title: L10n; summary: L10n };

export type Brochure = {
  key: "portafolio" | "ndt" | "qaqc";
  name: L10n;
  tagline: L10n;
  pdf: string;
  /** Download size shown on the button, in MB. */
  pdfMb: number;
  /** Page size of the renders in pixels; the decks are 1920×1080. */
  size?: [number, number];
  pages: BrochurePage[];
};

const page = (es: string, pt: string, en: string, summary: L10n): BrochurePage => ({ title: { es, pt, en }, summary });

export const brochures: Brochure[] = [
  // The company's service portfolio (doc/New file/Copia de PORTAFOLIO, Nov 2026): 22 portrait pages at
  // 1414×2000, shown as they are; the PDF is built from the same pages.
  {
    key: "portafolio",
    name: { es: "Portafolio de servicios", pt: "Portfólio de serviços", en: "Service portfolio" },
    tagline: {
      es: "La empresa, sus métodos de inspección, sus servicios por tipo de equipo y su equipo humano.",
      pt: "A empresa, seus métodos de inspeção, seus serviços por tipo de equipamento e sua equipe.",
      en: "The company, its inspection methods, its services by equipment type, and its people.",
    },
    pdf: "/docs/portafolio-tech-inspection.pdf",
    pdfMb: 3.7,
    size: [1414, 2000],
    pages: [
      page("Portafolio Tech-Inspection", "Portfólio Tech-Inspection", "Tech-Inspection portfolio", {
        es: "Portafolio de servicios de inspección y ensayos no destructivos.",
        pt: "Portfólio de serviços de inspeção e ensaios não destrutivos.",
        en: "Non-destructive testing and inspection service portfolio.",
      }),
      page("Nosotros, misión y visión", "Quem somos, missão e visão", "About us, mission and vision", {
        es: "Empresa colombiana de soluciones integrales en NDT y mantenimiento, certificada ISO 9001 e ISO 45001 y con calificación RUC.",
        pt: "Empresa colombiana de soluções integrais em END e manutenção, certificada ISO 9001 e ISO 45001 e com qualificação RUC.",
        en: "A Colombian company offering complete NDT and maintenance solutions, ISO 9001 and ISO 45001 certified and RUC qualified.",
      }),
      page("Nuestro equipo y valores", "Nossa equipe e valores", "Our team and values", {
        es: "Un equipo comprometido y experto en inspección y mantenimiento; valores de excelencia, innovación e integridad.",
        pt: "Uma equipe comprometida e especialista em inspeção e manutenção; valores de excelência, inovação e integridade.",
        en: "A committed team of inspection and maintenance experts; values of excellence, innovation and integrity.",
      }),
      page("Métodos", "Métodos", "Methods", {
        es: "Personal calificado y certificado bajo estándares internacionales como ASNT.",
        pt: "Pessoal qualificado e certificado sob padrões internacionais como ASNT.",
        en: "Qualified staff certified to international standards such as ASNT.",
      }),
      page("Inspección visual (VT)", "Inspeção visual (VT)", "Visual inspection (VT)", {
        es: "El método de base: detecta defectos superficiales, desgaste y daños, y sus beneficios.",
        pt: "O método de base: detecta defeitos superficiais, desgaste e danos, e seus benefícios.",
        en: "The foundation method: finds surface defects, wear and damage, and its benefits.",
      }),
      page("Líquidos penetrantes (PT)", "Líquidos penetrantes (PT)", "Penetrant testing (PT)", {
        es: "Revela discontinuidades abiertas a la superficie en materiales no porosos.",
        pt: "Revela descontinuidades abertas à superfície em materiais não porosos.",
        en: "Reveals surface-breaking discontinuities in non-porous materials.",
      }),
      page("Partículas magnéticas (MT)", "Partículas magnéticas (MT)", "Magnetic particle testing (MT)", {
        es: "Detecta discontinuidades superficiales y subsuperficiales en materiales ferromagnéticos.",
        pt: "Detecta descontinuidades superficiais e subsuperficiais em materiais ferromagnéticos.",
        en: "Finds surface and near-surface discontinuities in ferromagnetic materials.",
      }),
      page("Ultrasonido convencional (UT)", "Ultrassom convencional (UT)", "Conventional ultrasonic testing (UT)", {
        es: "Mide espesores y detecta defectos internos con ondas sonoras de alta frecuencia.",
        pt: "Mede espessuras e detecta defeitos internos com ondas sonoras de alta frequência.",
        en: "Measures thickness and finds internal flaws with high-frequency sound.",
      }),
      page("Ultrasonido phased array (PAUT)", "Ultrassom phased array (PAUT)", "Phased array ultrasonics (PAUT)", {
        es: "Imágenes de la estructura interna para evaluar soldaduras y componentes con mayor detalle.",
        pt: "Imagens da estrutura interna para avaliar soldas e componentes com mais detalhe.",
        en: "Images of the internal structure to assess welds and components in more detail.",
      }),
      page("Inspección electromagnética (EMI)", "Inspeção eletromagnética (EMI)", "Electromagnetic inspection (EMI)", {
        es: "Evaluación rápida de tubería: corrosión, picaduras, grietas y pérdida de espesor.",
        pt: "Avaliação rápida de tubulação: corrosão, pites, trincas e perda de espessura.",
        en: "Fast tubular assessment: corrosion, pitting, cracks and wall loss.",
      }),
      page("Servicios", "Serviços", "Services", {
        es: "Inspección según el tipo de equipo, bajo las normativas que aplican a cada uno.",
        pt: "Inspeção segundo o tipo de equipamento, sob as normas aplicáveis a cada um.",
        en: "Inspection by equipment type, to the codes that apply to each.",
      }),
      page("Inspección de tubería", "Inspeção de tubulação", "Tubular inspection", {
        es: "Drill pipe, casing, tubing y tubería de perforación, con sus normativas aplicables.",
        pt: "Drill pipe, casing, tubing e tubulação de perfuração, com suas normas aplicáveis.",
        en: "Drill pipe, casing, tubing and drilling tubulars, with the applicable codes.",
      }),
      page("Componentes de BHA", "Componentes de BHA", "BHA components", {
        es: "Inspección de los componentes del ensamblaje de fondo (bottom hole assembly).",
        pt: "Inspeção dos componentes da composição de fundo (bottom hole assembly).",
        en: "Inspection of bottom hole assembly components.",
      }),
      page("Líneas de presión", "Linhas de pressão", "Pressure lines", {
        es: "Inspección de líneas y conexiones que trabajan a alta presión.",
        pt: "Inspeção de linhas e conexões que trabalham em alta pressão.",
        en: "Inspection of high-pressure lines and connections.",
      }),
      page("Herramientas de fishing y wireline", "Ferramentas de fishing e wireline", "Fishing and wireline tools", {
        es: "Inspección de herramientas de pesca y de wireline.",
        pt: "Inspeção de ferramentas de pescaria e de wireline.",
        en: "Inspection of fishing and wireline tools.",
      }),
      page("Equipos de cementación y herramientas de levante", "Equipamentos de cimentação e ferramentas de elevação", "Cementing equipment and lifting tools", {
        es: "Inspección de equipos de cementación y de herramientas de levante.",
        pt: "Inspeção de equipamentos de cimentação e de ferramentas de elevação.",
        en: "Inspection of cementing equipment and lifting tools.",
      }),
      page("Inspección de tanques", "Inspeção de tanques", "Tank inspection", {
        es: "Espesores, soldaduras y estado general de tanques.",
        pt: "Espessuras, soldas e estado geral de tanques.",
        en: "Thickness, welds and overall condition of tanks.",
      }),
      page("Inspección estructural", "Inspeção estrutural", "Structural inspection", {
        es: "Estructuras metálicas y sus uniones soldadas.",
        pt: "Estruturas metálicas e suas uniões soldadas.",
        en: "Steel structures and their welded joints.",
      }),
      page("Herramientas de levante e izaje", "Ferramentas de elevação e içamento", "Lifting and hoisting tools", {
        es: "Inspección de elementos de levante e izaje.",
        pt: "Inspeção de elementos de elevação e içamento.",
        en: "Inspection of lifting and hoisting gear.",
      }),
      page("Personal", "Equipe", "Our people", {
        es: "El equipo de Tech-Inspection.",
        pt: "A equipe da Tech-Inspection.",
        en: "The Tech-Inspection team.",
      }),
      page("Personal operativo y administrativo", "Equipe operacional e administrativa", "Field and office staff", {
        es: "Los equipos operativo y administrativo.",
        pt: "As equipes operacional e administrativa.",
        en: "The field and office teams.",
      }),
      page("Contacto", "Contato", "Contact", {
        es: "gestion.integral@tech-inspection.com · gerencia-operaciones@tech-inspection.com · www.tech-inspection.com",
        pt: "gestion.integral@tech-inspection.com · gerencia-operaciones@tech-inspection.com · www.tech-inspection.com",
        en: "gestion.integral@tech-inspection.com · gerencia-operaciones@tech-inspection.com · www.tech-inspection.com",
      }),
    ],
  },
  {
    key: "ndt",
    name: { es: "Inspección NDT", pt: "Inspeção END", en: "NDT inspection" },
    tagline: {
      es: "Especialistas en inspección de brocas y estructuras de corte de acuerdo al estándar DS-1.",
      pt: "Especialistas em inspeção de brocas e estruturas de corte de acordo com o padrão DS-1.",
      en: "Specialists in drill bit and cutting structure inspection to the DS-1 standard.",
    },
    pdf: "/docs/portafolio-tech-inspection-ndt.pdf",
    pdfMb: 3.4,
    pages: [
      {
        title: { es: "Aliado estratégico en inspección NDT", pt: "Aliado estratégico em inspeção END", en: "Strategic partner in NDT inspection" },
        summary: {
          es: "Especialistas en inspección de brocas y estructuras de corte de acuerdo al estándar DS-1.",
          pt: "Especialistas em inspeção de brocas e estruturas de corte de acordo com o padrão DS-1.",
          en: "Specialists in drill bit and cutting structure inspection to the DS-1 standard.",
        },
      },
      {
        title: { es: "Nuestra trayectoria", pt: "Nossa trajetória", en: "Our track record" },
        summary: {
          es: "De Tecninspection NDT en 2014 a la transformación digital con TI-QMS en 2026, pasando por ISO 9001, ISO 45001 y la guía RUC.",
          pt: "Da Tecninspection NDT em 2014 à transformação digital com o TI-QMS em 2026, passando pela ISO 9001, ISO 45001 e o guia RUC.",
          en: "From Tecninspection NDT in 2014 to digital transformation with TI-QMS in 2026, by way of ISO 9001, ISO 45001 and the RUC guide.",
        },
      },
      {
        title: { es: "¿Quiénes somos?", pt: "Quem somos", en: "Who we are" },
        summary: {
          es: "Inspectores Nivel II ASNT, equipos calibrados, más de 10 años en Oil & Gas y sistema certificado en calidad y seguridad.",
          pt: "Inspetores Nível II ASNT, equipamentos calibrados, mais de 10 anos em Oil & Gas e sistema certificado em qualidade e segurança.",
          en: "ASNT Level II inspectors, calibrated equipment, over 10 years in oil & gas and a certified quality and safety system.",
        },
      },
      {
        title: { es: "¿Qué significa una inspección NDT Nivel II?", pt: "O que significa uma inspeção END Nível II?", en: "What does a Level II NDT inspection mean?" },
        summary: {
          es: "El inspector Nivel II ejecuta la inspección, interpreta indicaciones, evalúa criterios de aceptación, emite resultados y elabora el reporte técnico.",
          pt: "O inspetor Nível II executa a inspeção, interpreta indicações, avalia critérios de aceitação, emite resultados e elabora o relatório técnico.",
          en: "A Level II inspector performs the inspection, interprets indications, applies acceptance criteria, issues results and writes the technical report.",
        },
      },
      {
        title: { es: "¿Por qué inspeccionar una broca?", pt: "Por que inspecionar uma broca?", en: "Why inspect a drill bit?" },
        summary: {
          es: "Una broca defectuosa genera paradas, fallas en el pozo y costos altos; la inspección permite decidir con confianza y extender su vida útil.",
          pt: "Uma broca defeituosa gera paradas, falhas no poço e custos altos; a inspeção permite decidir com confiança e prolongar sua vida útil.",
          en: "A defective bit means downtime, downhole failures and high costs; inspection lets you decide with confidence and extend its life.",
        },
      },
      {
        title: { es: "Métodos NDT aplicados", pt: "Métodos END aplicados", en: "NDT methods applied" },
        summary: {
          es: "VT, MT, PT y UT: qué detecta cada método y cómo se combinan en una evaluación integral según DS-1.",
          pt: "VT, MT, PT e UT: o que cada método detecta e como se combinam em uma avaliação integral segundo o DS-1.",
          en: "VT, MT, PT and UT: what each method finds and how they combine into one assessment under DS-1.",
        },
      },
      {
        title: { es: "Nuestro proceso, tu confianza", pt: "Nosso processo, sua confiança", en: "Our process, your confidence" },
        summary: {
          es: "Procedimiento general de la solicitud a la declaración de conformidad, con calibración y trazabilidad en cada etapa.",
          pt: "Procedimento geral da solicitação à declaração de conformidade, com calibração e rastreabilidade em cada etapa.",
          en: "The general procedure from request to declaration of conformity, with calibration and traceability at every step.",
        },
      },
      {
        title: { es: "Marco normativo internacional", pt: "Marco normativo internacional", en: "International standards" },
        summary: {
          es: "DS-1, ASTM y API: los estándares que respaldan cada criterio de inspección y aceptación.",
          pt: "DS-1, ASTM e API: as normas que respaldam cada critério de inspeção e aceitação.",
          en: "DS-1, ASTM and API: the standards behind every inspection and acceptance criterion.",
        },
      },
      {
        title: { es: "Más que un proveedor, un aliado estratégico", pt: "Mais que um fornecedor, um aliado estratégico", en: "More than a supplier, a strategic partner" },
        summary: {
          es: "Soporte técnico permanente, transferencia de conocimiento y mejora continua.",
          pt: "Suporte técnico permanente, transferência de conhecimento e melhoria contínua.",
          en: "Ongoing technical support, knowledge transfer and continual improvement.",
        },
      },
      {
        title: { es: "TI-QMS: trazabilidad digital", pt: "TI-QMS: rastreabilidade digital", en: "TI-QMS: digital traceability" },
        summary: {
          es: "Seguimiento de solicitudes, certificados, registros fotográficos y reportes de inspección en línea.",
          pt: "Acompanhamento de solicitações, certificados, registros fotográficos e relatórios de inspeção on-line.",
          en: "Request tracking, certificates, photo records and inspection reports online.",
        },
      },
      {
        title: { es: "Por qué elegirnos", pt: "Por que nos escolher", en: "Why choose us" },
        summary: {
          es: "Confiabilidad técnica, cercanía y soporte especializado, y calidad con trazabilidad digital.",
          pt: "Confiabilidade técnica, proximidade e suporte especializado, e qualidade com rastreabilidade digital.",
          en: "Technical reliability, close specialist support, and quality with digital traceability.",
        },
      },
    ],
  },
  {
    key: "qaqc",
    name: { es: "Aseguramiento de calidad QA/QC", pt: "Garantia da qualidade QA/QC", en: "QA/QC quality assurance" },
    tagline: {
      es: "Aseguramiento, asesoría y control de calidad de procesos de mantenimiento e inspección de herramientas de Oil & Gas.",
      pt: "Garantia, assessoria e controle de qualidade de processos de manutenção e inspeção de ferramentas de Oil & Gas.",
      en: "Quality assurance, advisory and control for maintenance and inspection of oil & gas tools.",
    },
    pdf: "/docs/portafolio-tech-inspection-qaqc.pdf",
    pdfMb: 2,
    pages: [
      {
        title: { es: "Aliado estratégico en aseguramiento y control de calidad", pt: "Aliado estratégico em garantia e controle da qualidade", en: "Strategic partner in quality assurance and control" },
        summary: {
          es: "Expertos en aseguramiento, asesoría y control de calidad de procesos internos de mantenimiento e inspección.",
          pt: "Especialistas em garantia, assessoria e controle da qualidade de processos internos de manutenção e inspeção.",
          en: "Experts in quality assurance, advisory and control of in-house maintenance and inspection processes.",
        },
      },
      {
        title: { es: "Nuestra trayectoria", pt: "Nossa trajetória", en: "Our track record" },
        summary: {
          es: "Más de 10 años en inspección NDT y más de 2 años en QA/QC junto a compañías prestadoras de servicios.",
          pt: "Mais de 10 anos em inspeção END e mais de 2 anos em QA/QC junto a empresas prestadoras de serviços.",
          en: "Over 10 years in NDT inspection and over 2 years in QA/QC alongside service companies.",
        },
      },
      {
        title: { es: "¿Quiénes somos?", pt: "Quem somos", en: "Who we are" },
        summary: {
          es: "Especialistas con hasta 25 años de experiencia en herramientas de la industria Oil & Gas.",
          pt: "Especialistas com até 25 anos de experiência em ferramentas da indústria de Oil & Gas.",
          en: "Specialists with up to 25 years of experience in oil & gas tools.",
        },
      },
      {
        title: { es: "Casos de éxito", pt: "Casos de sucesso", en: "Success stories" },
        summary: {
          es: "Alianzas con compañías del sector Oil & Gas que confían en nuestro aseguramiento de calidad.",
          pt: "Parcerias com empresas do setor de Oil & Gas que confiam na nossa garantia da qualidade.",
          en: "Partnerships with oil & gas companies that rely on our quality assurance.",
        },
      },
      {
        title: { es: "Más que aseguramiento", pt: "Mais que garantia da qualidade", en: "More than quality assurance" },
        summary: {
          es: "Reportes en tiempo real, especialista por tipo de herramienta, disponibilidad completa y procesos alineados con cada prestadora.",
          pt: "Relatórios em tempo real, especialista por tipo de ferramenta, disponibilidade total e processos alinhados com cada prestadora.",
          en: "Real-time reports, a specialist for each tool type, full availability and processes aligned with each service company.",
        },
      },
      {
        title: { es: "Inteligencia artificial al servicio de la calidad", pt: "Inteligência artificial a serviço da qualidade", en: "Artificial intelligence for quality" },
        summary: {
          es: "Análisis predictivo, medición precisa y control inteligente en los procesos de aseguramiento y control de calidad.",
          pt: "Análise preditiva, medição precisa e controle inteligente nos processos de garantia e controle da qualidade.",
          en: "Predictive analysis, precise measurement and smart control across quality assurance and control.",
        },
      },
      {
        title: { es: "Contacto QA/QC", pt: "Contato QA/QC", en: "QA/QC contact" },
        summary: {
          es: "Hablemos de su proceso de aseguramiento y control de calidad.",
          pt: "Vamos conversar sobre o seu processo de garantia e controle da qualidade.",
          en: "Let's talk about your quality assurance and control process.",
        },
      },
    ],
  },
];
