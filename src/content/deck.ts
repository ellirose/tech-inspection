import type { L10n, L10nList } from "@/i18n/config";

/**
 * Content taken from the client presentation "presentacion cliente ulterra.pdf".
 * Wording follows the deck (spelling corrected); keep the two in step when either changes.
 */

type Item = { t: L10n; d: L10n };

/* Slide 1 — cover */
export const cover = {
  kicker: { es: "Aliado estratégico", pt: "Aliado estratégico", en: "Strategic partner" } satisfies L10n,
  title: { es: "Aliado estratégico en inspección NDT", pt: "Aliado estratégico em inspeção END", en: "Your strategic partner in NDT inspection" } satisfies L10n,
  lead: {
    es: "Especialistas en inspección de brocas y estructuras de corte de acuerdo al estándar DS-1.",
    pt: "Especialistas em inspeção de brocas e estruturas de corte de acordo com o padrão DS-1.",
    en: "Specialists in drill bit and cutting structure inspection to the DS-1 standard.",
  } satisfies L10n,
  motto: {
    es: "Excelencia técnica, innovación y confianza en cada ensayo.",
    pt: "Excelência técnica, inovação e confiança em cada ensaio.",
    en: "Technical excellence, innovation and confidence in every test.",
  } satisfies L10n,
};

/* Slide 2 — timeline */
export const timelineIntro: L10n = {
  es: "Nuestra evolución ha estado impulsada por el fortalecimiento de nuestras capacidades técnicas y la estandarización de procesos. Durante más de 10 años hemos acompañado a Ulterra Latin America en inspecciones NDT, consolidando una relación basada en la confianza, el conocimiento técnico y la mejora continua.",
  pt: "Nossa evolução foi impulsionada pelo fortalecimento das nossas capacidades técnicas e pela padronização de processos. Há mais de 10 anos acompanhamos a Ulterra Latin America em inspeções END, consolidando uma relação baseada na confiança, no conhecimento técnico e na melhoria contínua.",
  en: "Our growth has been driven by stronger technical capabilities and standardised processes. For more than 10 years we have supported Ulterra Latin America with NDT inspection, building a relationship founded on trust, technical knowledge and continual improvement.",
};

export type Milestone = { year: number; icon: "founding" | "alliance" | "rebrand" | "iso" | "ruc" | "direction" | "scope" | "digital"; t: L10n };

export const timeline: Milestone[] = [
  { year: 2014, icon: "founding", t: { es: "Fundación de Tecninspection NDT S.A.S.", pt: "Fundação da Tecninspection NDT S.A.S.", en: "Tecninspection NDT S.A.S. founded" } },
  { year: 2015, icon: "alliance", t: { es: "Inicio de la alianza comercial con Ulterra", pt: "Início da aliança comercial com a Ulterra", en: "Commercial alliance with Ulterra begins" } },
  { year: 2017, icon: "rebrand", t: { es: "Renovación de la marca: Tech-Inspection S.A.S.", pt: "Renovação da marca: Tech-Inspection S.A.S.", en: "Rebrand to Tech-Inspection S.A.S." } },
  { year: 2018, icon: "iso", t: { es: "Certificación ISO 9001 e ISO 45001", pt: "Certificação ISO 9001 e ISO 45001", en: "ISO 9001 and ISO 45001 certification" } },
  { year: 2020, icon: "ruc", t: { es: "Certificación guía RUC", pt: "Certificação guia RUC", en: "RUC guide certification" } },
  { year: 2022, icon: "direction", t: { es: "Creación de la Dirección Técnica", pt: "Criação da Direção Técnica", en: "Technical Directorate established" } },
  { year: 2025, icon: "scope", t: { es: "Ampliación de alcance QA/QC", pt: "Ampliação de escopo QA/QC", en: "Scope extended to QA/QC" } },
  { year: 2026, icon: "digital", t: { es: "Transformación digital: TI-QMS", pt: "Transformação digital: TI-QMS", en: "Digital transformation: TI-QMS" } },
];

/* Slide 3 — who we are */
export const whoWeAre: L10n = {
  es: "Somos una empresa de inspección especializada en la aplicación de ensayos por métodos no destructivos.",
  pt: "Somos uma empresa de inspeção especializada na aplicação de ensaios por métodos não destrutivos.",
  en: "We are an inspection company specialised in applying non-destructive testing methods.",
};

export type Credential = { key: "people" | "equipment" | "experience" | "quality" | "safety"; value: L10n; t: L10n; d: L10n };

export const credentials: Credential[] = [
  {
    key: "people",
    value: { es: "Nivel II", pt: "Nível II", en: "Level II" },
    t: { es: "Personal certificado", pt: "Pessoal certificado", en: "Certified personnel" },
    d: { es: "Inspectores Nivel II según la ASNT.", pt: "Inspetores Nível II conforme a ASNT.", en: "Level II inspectors per ASNT." },
  },
  {
    key: "equipment",
    value: { es: "ISO/IEC 17025", pt: "ISO/IEC 17025", en: "ISO/IEC 17025" },
    t: { es: "Equipos calibrados", pt: "Equipamentos calibrados", en: "Calibrated equipment" },
    d: { es: "Certificados bajo ISO/IEC 17025.", pt: "Certificados sob a ISO/IEC 17025.", en: "Certified under ISO/IEC 17025." },
  },
  {
    key: "experience",
    value: { es: "+10", pt: "+10", en: "+10" },
    t: { es: "Experiencia en el sector", pt: "Experiência no setor", en: "Industry experience" },
    d: { es: "Más de 10 años de experiencia en Oil & Gas.", pt: "Mais de 10 anos de experiência em Oil & Gas.", en: "More than 10 years in oil & gas." },
  },
  {
    key: "quality",
    value: { es: "2018", pt: "2018", en: "2018" },
    t: { es: "Certificados en calidad", pt: "Certificados em qualidade", en: "Quality certified" },
    d: { es: "ISO 9001:2015 e ISO 45001:2018 desde el año 2018.", pt: "ISO 9001:2015 e ISO 45001:2018 desde 2018.", en: "ISO 9001:2015 and ISO 45001:2018 since 2018." },
  },
  {
    key: "safety",
    value: { es: "RUC", pt: "RUC", en: "RUC" },
    t: { es: "Comprometidos con la seguridad", pt: "Comprometidos com a segurança", en: "Committed to safety" },
    d: {
      es: "Avalados por el Consejo Colombiano de Seguridad, guía RUC.",
      pt: "Avalizados pelo Conselho Colombiano de Segurança, guia RUC.",
      en: "Endorsed by the Colombian Safety Council under the RUC guide.",
    },
  },
];

/* Slide 4 — what a Level II inspection means */
export const levelTwo = {
  title: { es: "¿Qué significa una inspección NDT Nivel II?", pt: "O que significa uma inspeção END Nível II?", en: "What does a Level II NDT inspection mean?" } satisfies L10n,
  text: {
    es: "Es una evaluación técnica realizada por personal calificado para detectar discontinuidades, interpretar los resultados obtenidos, emitir un diagnóstico técnico y generar registros confiables que respalden la condición del activo.",
    pt: "É uma avaliação técnica realizada por pessoal qualificado para detectar descontinuidades, interpretar os resultados obtidos, emitir um diagnóstico técnico e gerar registros confiáveis que respaldem a condição do ativo.",
    en: "It is a technical evaluation carried out by qualified personnel to detect discontinuities, interpret the results, issue a technical diagnosis and produce reliable records that support the condition of the asset.",
  } satisfies L10n,
  canTitle: { es: "Un inspector Nivel II puede:", pt: "Um inspetor Nível II pode:", en: "A Level II inspector can:" } satisfies L10n,
  can: {
    es: ["Ejecutar inspecciones", "Interpretar indicaciones", "Evaluar criterios de aceptación", "Emitir resultados", "Elaborar reportes técnicos"],
    pt: ["Executar inspeções", "Interpretar indicações", "Avaliar critérios de aceitação", "Emitir resultados", "Elaborar relatórios técnicos"],
    en: ["Carry out inspections", "Interpret indications", "Evaluate acceptance criteria", "Issue results", "Prepare technical reports"],
  } satisfies L10nList,
  stages: {
    es: ["Inspección", "Interpretación", "Evaluación", "Resultados", "Reporte"],
    pt: ["Inspeção", "Interpretação", "Avaliação", "Resultados", "Relatório"],
    en: ["Inspection", "Interpretation", "Evaluation", "Results", "Report"],
  } satisfies L10nList,
};

/* Slide 5 — why inspect a bit */
export const whyBit = {
  title: { es: "¿Por qué inspeccionar una broca?", pt: "Por que inspecionar uma broca?", en: "Why inspect a drill bit?" } satisfies L10n,
  risksTitle: { es: "Una broca defectuosa puede generar:", pt: "Uma broca defeituosa pode gerar:", en: "A defective bit can lead to:" } satisfies L10n,
  risks: {
    es: ["Preparaciones no productivas", "Fallas en el pozo", "Daño a equipos y componentes", "Altos costos operacionales"],
    pt: ["Preparações não produtivas", "Falhas no poço", "Danos a equipamentos e componentes", "Altos custos operacionais"],
    en: ["Non-productive trips", "Downhole failures", "Damage to equipment and components", "High operating costs"],
  } satisfies L10nList,
  allowsTitle: { es: "La inspección permite:", pt: "A inspeção permite:", en: "Inspection lets you:" } satisfies L10n,
  allows: {
    es: [
      "Verificar el estado real de la broca.",
      "Detectar defectos antes de su uso.",
      "Prevenir fallas y paradas no planificadas.",
      "Cumplir con los criterios de aceptación de DS-1.",
      "Extender la vida útil de la herramienta.",
      "Tomar decisiones técnicas con confianza.",
    ],
    pt: [
      "Verificar o estado real da broca.",
      "Detectar defeitos antes do uso.",
      "Prevenir falhas e paradas não planejadas.",
      "Cumprir os critérios de aceitação da DS-1.",
      "Estender a vida útil da ferramenta.",
      "Tomar decisões técnicas com confiança.",
    ],
    en: [
      "Verify the bit's real condition.",
      "Detect defects before it is run.",
      "Prevent failures and unplanned downtime.",
      "Meet DS-1 acceptance criteria.",
      "Extend the tool's service life.",
      "Make technical decisions with confidence.",
    ],
  } satisfies L10nList,
  withTitle: { es: "Inspeccionamos con:", pt: "Inspecionamos com:", en: "We inspect with:" } satisfies L10n,
  with: [
    { t: { es: "Personal certificado", pt: "Pessoal certificado", en: "Certified personnel" }, d: { es: "Competencia y experiencia en NDT.", pt: "Competência e experiência em END.", en: "NDT competence and experience." } },
    { t: { es: "Métodos NDT aplicados", pt: "Métodos END aplicados", en: "Applied NDT methods" }, d: { es: "Evaluación integral y trazable según DS-1.", pt: "Avaliação integral e rastreável conforme a DS-1.", en: "Complete, traceable evaluation to DS-1." } },
    { t: { es: "Equipos calibrados", pt: "Equipamentos calibrados", en: "Calibrated equipment" }, d: { es: "Tecnología confiable y en óptimas condiciones.", pt: "Tecnologia confiável e em ótimas condições.", en: "Reliable technology in top condition." } },
    { t: { es: "Informes técnicos", pt: "Relatórios técnicos", en: "Technical reports" }, d: { es: "Trazabilidad total y soporte para la toma de decisiones.", pt: "Rastreabilidade total e suporte à tomada de decisões.", en: "Full traceability and support for decisions." } },
  ] satisfies Item[],
  motto: { es: "Inspeccionar hoy es garantizar resultados mañana.", pt: "Inspecionar hoje é garantir resultados amanhã.", en: "Inspecting today secures results tomorrow." } satisfies L10n,
  values: [
    { t: { es: "Confiabilidad", pt: "Confiabilidade", en: "Reliability" }, d: { es: "en cada evaluación", pt: "em cada avaliação", en: "in every evaluation" } },
    { t: { es: "Calidad", pt: "Qualidade", en: "Quality" }, d: { es: "en cada detalle", pt: "em cada detalhe", en: "in every detail" } },
    { t: { es: "Seguridad", pt: "Segurança", en: "Safety" }, d: { es: "en cada operación", pt: "em cada operação", en: "in every operation" } },
    { t: { es: "Rentabilidad", pt: "Rentabilidade", en: "Profitability" }, d: { es: "en cada decisión", pt: "em cada decisão", en: "in every decision" } },
  ] satisfies Item[],
};

/* Slide 6 — methods applied */
export const methodsApplied = {
  title: { es: "Métodos NDT aplicados", pt: "Métodos END aplicados", en: "NDT methods applied" } satisfies L10n,
  lead: {
    es: "Cada técnica aporta evidencia diferente. Juntas permiten una evaluación integral del componente.",
    pt: "Cada técnica fornece uma evidência diferente. Juntas, permitem uma avaliação integral do componente.",
    en: "Each technique provides different evidence. Together they allow a complete evaluation of the component.",
  } satisfies L10n,
  detects: { es: "Detecta", pt: "Detecta", en: "Detects" } satisfies L10n,
  integral: { es: "Evaluación integral", pt: "Avaliação integral", en: "Integrated evaluation" } satisfies L10n,
  decision: { es: "Decisión técnica", pt: "Decisão técnica", en: "Technical decision" } satisfies L10n,
  quoteA: { es: "Lo importante no es realizar un ensayo.", pt: "O importante não é realizar um ensaio.", en: "What matters is not running a test." } satisfies L10n,
  quoteB: {
    es: "Lo importante es seleccionar el método adecuado, interpretar los resultados y correlacionarlos con los criterios de aceptación establecidos por DS-1.",
    pt: "O importante é selecionar o método adequado, interpretar os resultados e correlacioná-los com os critérios de aceitação estabelecidos pela DS-1.",
    en: "What matters is choosing the right method, interpreting the results and correlating them with the acceptance criteria set by DS-1.",
  } satisfies L10n,
  values: [
    { t: { es: "Evidencia confiable", pt: "Evidência confiável", en: "Reliable evidence" }, d: { es: "para reducir incertidumbre", pt: "para reduzir a incerteza", en: "to reduce uncertainty" } },
    { t: { es: "Experiencia y criterio", pt: "Experiência e critério", en: "Experience and judgement" }, d: { es: "para cada aplicación", pt: "para cada aplicação", en: "for each application" } },
    { t: { es: "Tecnología calibrada", pt: "Tecnologia calibrada", en: "Calibrated technology" }, d: { es: "y personal certificado", pt: "e pessoal certificado", en: "and certified personnel" } },
    { t: { es: "Trazabilidad total", pt: "Rastreabilidade total", en: "Full traceability" }, d: { es: "de principio a fin", pt: "do início ao fim", en: "from start to finish" } },
    { t: { es: "Aliado técnico", pt: "Aliado técnico", en: "Technical partner" }, d: { es: "en cada decisión", pt: "em cada decisão", en: "in every decision" } },
  ] satisfies Item[],
};

/* Slide 7 — process */
export const process = {
  title: { es: "Nuestro proceso, tu confianza", pt: "Nosso processo, sua confiança", en: "Our process, your confidence" } satisfies L10n,
  lead: { es: "Procesos estandarizados y trazabilidad completa.", pt: "Processos padronizados e rastreabilidade completa.", en: "Standardised processes and complete traceability." } satisfies L10n,
  procedureTitle: { es: "Procedimiento general", pt: "Procedimento geral", en: "General procedure" } satisfies L10n,
  procedure: {
    es: ["Solicitud", "Recepción e identificación", "Puesta a punto", "Inspección visual", "Inspección NDT", "Evaluación", "Registros", "Reporte", "Declaración de conformidad"],
    pt: ["Solicitação", "Recebimento e identificação", "Preparação", "Inspeção visual", "Inspeção END", "Avaliação", "Registros", "Relatório", "Declaração de conformidade"],
    en: ["Request", "Receipt and identification", "Preparation", "Visual inspection", "NDT inspection", "Evaluation", "Records", "Report", "Declaration of conformity"],
  } satisfies L10nList,
  traceTitle: { es: "Calibración y trazabilidad", pt: "Calibração e rastreabilidade", en: "Calibration and traceability" } satisfies L10n,
  trace: {
    es: ["Inspector", "Equipos", "Certificados", "Vigencia", "Resultados", "Reporte", "Cliente"],
    pt: ["Inspetor", "Equipamentos", "Certificados", "Validade", "Resultados", "Relatório", "Cliente"],
    en: ["Inspector", "Equipment", "Certificates", "Validity", "Results", "Report", "Client"],
  } satisfies L10nList,
  lockTitle: { es: "Cada inspección puede rastrearse completamente", pt: "Cada inspeção pode ser rastreada por completo", en: "Every inspection can be fully traced" } satisfies L10n,
  lockText: {
    es: "Desde el inspector hasta el cliente final, asegurando transparencia, control y respaldo documental en cada etapa.",
    pt: "Do inspetor ao cliente final, garantindo transparência, controle e respaldo documental em cada etapa.",
    en: "From the inspector to the end client, ensuring transparency, control and documentary backing at every stage.",
  } satisfies L10n,
};

/* Slide 8 — standards */
export type Standard = { code: "DS-1" | "ASTM" | "API"; t: L10n; points: L10nList; note: L10n };

export const standards = {
  title: { es: "Marco normativo internacional", pt: "Marco normativo internacional", en: "International standards framework" } satisfies L10n,
  lead: { es: "El conocimiento técnico que respalda cada decisión.", pt: "O conhecimento técnico que respalda cada decisão.", en: "The technical knowledge behind every decision." } satisfies L10n,
  items: [
    {
      code: "DS-1",
      t: { es: "Establece criterios internacionales para:", pt: "Estabelece critérios internacionais para:", en: "Sets international criteria for:" },
      points: {
        es: ["Inspección", "Aceptación", "Reparación", "Clasificación", "Reutilización de componentes de perforación"],
        pt: ["Inspeção", "Aceitação", "Reparo", "Classificação", "Reutilização de componentes de perfuração"],
        en: ["Inspection", "Acceptance", "Repair", "Classification", "Re-use of drilling components"],
      },
      note: {
        es: "Su correcta aplicación permite decisiones objetivas sobre la condición del activo.",
        pt: "Sua correta aplicação permite decisões objetivas sobre a condição do ativo.",
        en: "Applied correctly, it allows objective decisions about the asset's condition.",
      },
    },
    {
      code: "ASTM",
      t: { es: "Métodos normalizados de inspección", pt: "Métodos normalizados de inspeção", en: "Standardised inspection methods" },
      points: {
        es: ["Procedimientos reproducibles", "Validación técnica", "Resultados comparables", "Confiabilidad metrológica"],
        pt: ["Procedimentos reprodutíveis", "Validação técnica", "Resultados comparáveis", "Confiabilidade metrológica"],
        en: ["Reproducible procedures", "Technical validation", "Comparable results", "Metrological reliability"],
      },
      note: { es: "Base técnica para los métodos NDT utilizados.", pt: "Base técnica para os métodos END utilizados.", en: "Technical basis for the NDT methods we use." },
    },
    {
      code: "API",
      t: { es: "Especificaciones de diseño y fabricación", pt: "Especificações de projeto e fabricação", en: "Design and manufacturing specifications" },
      points: {
        es: ["Geometría", "Roscas API", "Tolerancias", "Requisitos dimensionales"],
        pt: ["Geometria", "Roscas API", "Tolerâncias", "Requisitos dimensionais"],
        en: ["Geometry", "API threads", "Tolerances", "Dimensional requirements"],
      },
      note: { es: "Referencia para verificar la conformidad del componente.", pt: "Referência para verificar a conformidade do componente.", en: "Reference for verifying component conformity." },
    },
  ] satisfies Standard[],
  moreTitle: { es: "Más que cumplir una norma…", pt: "Mais do que cumprir uma norma…", en: "More than meeting a standard…" } satisfies L10n,
  more: [
    { t: { es: "Estandarización", pt: "Padronização", en: "Standardisation" }, d: { es: "Procesos consistentes y reproducibles.", pt: "Processos consistentes e reprodutíveis.", en: "Consistent, reproducible processes." } },
    { t: { es: "Transferencia de conocimiento", pt: "Transferência de conhecimento", en: "Knowledge transfer" }, d: { es: "Capacitación técnica basada en estándares internacionales.", pt: "Capacitação técnica baseada em padrões internacionais.", en: "Technical training based on international standards." } },
    { t: { es: "Soporte especializado", pt: "Suporte especializado", en: "Specialist support" }, d: { es: "Acompañamiento técnico en auditorías, investigaciones y procesos de controversia.", pt: "Acompanhamento técnico em auditorias, investigações e processos de controvérsia.", en: "Technical support in audits, investigations and disputes." } },
  ] satisfies Item[],
  value: {
    es: "El verdadero valor de un estándar no es cumplirlo. Es comprenderlo lo suficiente para convertirlo en decisiones técnicas confiables, capacitación especializada y respaldo objetivo cuando más se necesita.",
    pt: "O verdadeiro valor de um padrão não é cumpri-lo. É compreendê-lo o suficiente para transformá-lo em decisões técnicas confiáveis, capacitação especializada e respaldo objetivo quando mais se precisa.",
    en: "The real value of a standard is not meeting it. It is understanding it well enough to turn it into reliable technical decisions, specialist training and objective backing when it matters most.",
  } satisfies L10n,
  triad: {
    api: { es: "Diseño y fabricación", pt: "Projeto e fabricação", en: "Design and manufacture" },
    ds1: { es: "Inspección y criterios", pt: "Inspeção e critérios", en: "Inspection and criteria" },
    astm: { es: "Métodos y ensayos", pt: "Métodos e ensaios", en: "Methods and tests" },
    center: { es: "Componente de perforación", pt: "Componente de perfuração", en: "Drilling component" },
  } satisfies Record<string, L10n>,
};

/* Slide 9 — partner */
export const partner = {
  titleA: { es: "Más que un proveedor", pt: "Mais do que um fornecedor", en: "More than a supplier" } satisfies L10n,
  titleB: { es: "Un aliado estratégico", pt: "Um aliado estratégico", en: "A strategic partner" } satisfies L10n,
  pillars: [
    {
      key: "support",
      image: "/media/deck/partner-field.jpg",
      t: { es: "Soporte técnico permanente", pt: "Suporte técnico permanente", en: "Ongoing technical support" },
      points: {
        es: ["Visitas técnicas", "Auditorías", "Interventorías", "Asesoría personalizada"],
        pt: ["Visitas técnicas", "Auditorias", "Fiscalizações", "Assessoria personalizada"],
        en: ["Technical visits", "Audits", "Third-party oversight", "Tailored advice"],
      },
    },
    {
      key: "knowledge",
      image: "/media/deck/partner-training.jpg",
      t: { es: "Transferencia del conocimiento", pt: "Transferência do conhecimento", en: "Knowledge transfer" },
      points: {
        es: ["Entrenamiento al personal", "ASTM, DS-1, API", "Interpretación de reportes", "Buenas prácticas"],
        pt: ["Treinamento do pessoal", "ASTM, DS-1, API", "Interpretação de relatórios", "Boas práticas"],
        en: ["Staff training", "ASTM, DS-1, API", "Report interpretation", "Good practice"],
      },
    },
    {
      key: "improvement",
      image: "/media/deck/partner-review.jpg",
      t: { es: "Mejora continua", pt: "Melhoria contínua", en: "Continual improvement" },
      points: {
        es: ["Retroalimentación", "Optimización de procesos", "Análisis de hallazgos", "Análisis interno por procesos"],
        pt: ["Retroalimentação", "Otimização de processos", "Análise de achados", "Análise interna por processos"],
        en: ["Feedback", "Process optimisation", "Analysis of findings", "Internal process analysis"],
      },
    },
  ] satisfies { key: string; image: string; t: L10n; points: L10nList }[],
};

/* Slide 10 — TI-QMS */
export const tiqms = {
  kicker: { es: "Trazabilidad digital", pt: "Rastreabilidade digital", en: "Digital traceability" } satisfies L10n,
  title: { es: "Plataforma integral para la gestión eficiente de inspecciones", pt: "Plataforma integral para a gestão eficiente de inspeções", en: "One platform for efficient inspection management" } satisfies L10n,
  features: [
    { key: "requests", t: { es: "Seguimiento de solicitudes", pt: "Acompanhamento de solicitações", en: "Request tracking" }, d: { es: "Control en tiempo real del estado de cada solicitud y su ciclo de vida completo.", pt: "Controle em tempo real do status de cada solicitação e de todo o seu ciclo de vida.", en: "Real-time status of every request across its full life cycle." } },
    { key: "competence", t: { es: "Certificados de competencia", pt: "Certificados de competência", en: "Competence certificates" }, d: { es: "Verificación de certificaciones y competencias del personal inspector.", pt: "Verificação das certificações e competências do pessoal inspetor.", en: "Check the certifications and competence of the inspection staff." } },
    { key: "calibration", t: { es: "Certificados de calibración", pt: "Certificados de calibração", en: "Calibration certificates" }, d: { es: "Consulta y descarga de certificados de calibración de los equipos utilizados en cada inspección.", pt: "Consulta e download dos certificados de calibração dos equipamentos usados em cada inspeção.", en: "View and download calibration certificates for the equipment used in each inspection." } },
    { key: "photos", t: { es: "Registros fotográficos HD", pt: "Registros fotográficos HD", en: "HD photo records" }, d: { es: "Imágenes de cada inspección disponibles para descarga en máxima resolución.", pt: "Imagens de cada inspeção disponíveis para download em resolução máxima.", en: "Images from every inspection, downloadable at full resolution." } },
    { key: "reports", t: { es: "Reportes de inspección", pt: "Relatórios de inspeção", en: "Inspection reports" }, d: { es: "Acceso a reportes detallados de cada herramienta y sus resultados.", pt: "Acesso a relatórios detalhados de cada ferramenta e seus resultados.", en: "Detailed reports for every tool and its results." } },
    { key: "documents", t: { es: "Documentos asociados", pt: "Documentos associados", en: "Associated documents" }, d: { es: "Control de parámetros de inspección, órdenes internas de trabajo, planilla de parafiscales y otros documentos clave.", pt: "Controle de parâmetros de inspeção, ordens internas de trabalho, folha de encargos sociais e outros documentos-chave.", en: "Inspection parameters, internal work orders, social-security payroll filings and other key documents." } },
  ] satisfies ({ key: string } & Item)[],
  benefitsTitle: { es: "Beneficio", pt: "Benefício", en: "Benefits" } satisfies L10n,
  benefits: [
    { t: { es: "Disponibilidad inmediata de información", pt: "Disponibilidade imediata de informação", en: "Information on demand" }, d: { es: "Acceda a toda la información de sus inspecciones desde cualquier lugar.", pt: "Acesse todas as informações das suas inspeções de qualquer lugar.", en: "Reach all your inspection information from anywhere." } },
    { t: { es: "Trazabilidad completa", pt: "Rastreabilidade completa", en: "Complete traceability" }, d: { es: "Cada inspección puede rastrearse desde el inspector hasta el cliente final.", pt: "Cada inspeção pode ser rastreada do inspetor ao cliente final.", en: "Every inspection can be traced from the inspector to the end client." } },
    { t: { es: "Respaldo documental", pt: "Respaldo documental", en: "Documentary backing" }, d: { es: "Mayor rapidez en auditorías y evidencia técnica organizada y segura.", pt: "Mais rapidez em auditorias e evidência técnica organizada e segura.", en: "Faster audits, with technical evidence organised and secure." } },
    { t: { es: "Mayor transparencia", pt: "Mais transparência", en: "Greater transparency" }, d: { es: "Información clara, confiable y accesible para todas las partes interesadas.", pt: "Informação clara, confiável e acessível para todas as partes interessadas.", en: "Clear, reliable information accessible to every stakeholder." } },
  ] satisfies Item[],
};

/* Slide 11 — closing */
export const closing = {
  pillars: [
    { key: "reliability", t: { es: "Confiabilidad técnica", pt: "Confiabilidade técnica", en: "Technical reliability" }, d: { es: "Inspectores competentes, procedimientos estandarizados, equipos calibrados y cumplimiento API y DS-1.", pt: "Inspetores competentes, procedimentos padronizados, equipamentos calibrados e conformidade API e DS-1.", en: "Competent inspectors, standardised procedures, calibrated equipment and API and DS-1 compliance." } },
    { key: "support", t: { es: "Cercanía y soporte especializado", pt: "Proximidade e suporte especializado", en: "Close, specialist support" }, d: { es: "Acompañamiento técnico permanente, auditorías e interventorías.", pt: "Acompanhamento técnico permanente, auditorias e fiscalizações.", en: "Ongoing technical support, audits and third-party oversight." } },
    { key: "digital", t: { es: "Calidad y trazabilidad digital", pt: "Qualidade e rastreabilidade digital", en: "Quality and digital traceability" }, d: { es: "Implementación de TI-QMS para asegurar evidencia, acceso inmediato a la información y respaldo documental durante el ciclo de la inspección.", pt: "Implementação do TI-QMS para assegurar evidência, acesso imediato à informação e respaldo documental durante o ciclo da inspeção.", en: "TI-QMS secures evidence, instant access to information and documentary backing throughout the inspection cycle." } },
  ] satisfies ({ key: string } & Item)[],
  statementA: { es: "Nuestro objetivo no es únicamente inspeccionar una broca.", pt: "Nosso objetivo não é apenas inspecionar uma broca.", en: "Our goal is not only to inspect a drill bit." } satisfies L10n,
  statementB: {
    es: "Es proporcionar información técnica confiable que permita a nuestros clientes tomar decisiones con menor riesgo y mayor respaldo documental.",
    pt: "É fornecer informação técnica confiável que permita aos nossos clientes tomar decisões com menor risco e maior respaldo documental.",
    en: "It is to provide reliable technical information that lets our clients make decisions with less risk and stronger documentary backing.",
  } satisfies L10n,
  /** The deck's original wording, used where the Ulterra partnership is presented. */
  statementUlterra: {
    es: "Es proporcionar información técnica confiable que permita a Ulterra y a sus clientes tomar decisiones con menor riesgo y mayor respaldo documental.",
    pt: "É fornecer informação técnica confiável que permita à Ulterra e aos seus clientes tomar decisões com menor risco e maior respaldo documental.",
    en: "It is to provide reliable technical information that lets Ulterra and its clients make decisions with less risk and stronger documentary backing.",
  } satisfies L10n,
};
