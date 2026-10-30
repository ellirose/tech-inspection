import type { L10n, L10nList } from "@/i18n/config";

/** Landing-page copy. Facts match the client deck; the wording and structure are the site's own. */
export const home = {
  hero: {
    eyebrow: { es: "Ensayos no destructivos · Oil & Gas", pt: "Ensaios não destrutivos · Oil & Gas", en: "Non-destructive testing · Oil & Gas" } satisfies L10n,
    titleA: { es: "Detectamos la falla", pt: "Detectamos a falha", en: "We find the flaw" } satisfies L10n,
    titleB: { es: "antes de que llegue al pozo.", pt: "antes que ela chegue ao poço.", en: "before it reaches the well." } satisfies L10n,
    lead: {
      es: "Inspección NDT de brocas, tubería y herramientas de perforación con inspectores Nivel II, equipos calibrados y criterios DS-1, API y ASTM.",
      pt: "Inspeção END de brocas, tubulações e ferramentas de perfuração com inspetores Nível II, equipamentos calibrados e critérios DS-1, API e ASTM.",
      en: "NDT inspection of drill bits, pipe and drilling tools by Level II inspectors, with calibrated equipment and DS-1, API and ASTM criteria.",
    } satisfies L10n,
    inspecting: { es: "Inspeccionando", pt: "Inspecionando", en: "Inspecting" } satisfies L10n,
    words: {
      es: ["Brocas PDC", "Drill pipe", "Componentes BHA", "Líneas de presión", "Equipos de izaje"],
      pt: ["Brocas PDC", "Drill pipe", "Componentes BHA", "Linhas de pressão", "Equipamentos de içamento"],
      en: ["PDC bits", "Drill pipe", "BHA components", "Pressure lines", "Lifting gear"],
    } satisfies L10nList,
    services: { es: "Ver qué inspeccionamos", pt: "Ver o que inspecionamos", en: "See what we inspect" } satisfies L10n,
    stats: [
      { value: 10, prefix: "+", label: { es: "años en Oil & Gas", pt: "anos em Oil & Gas", en: "years in Oil & Gas" } },
      { value: 4, label: { es: "métodos NDT", pt: "métodos END", en: "NDT methods" } },
      { value: 9, label: { es: "líneas de servicio", pt: "linhas de serviço", en: "service lines" } },
    ] satisfies { value: number; prefix?: string; label: L10n }[],
    clients: { es: "Confían en nosotros", pt: "Confiam em nós", en: "Trusted by" } satisfies L10n,
    wall: { es: "Espesor de pared", pt: "Espessura de parede", en: "Wall thickness" } satisfies L10n,
    indication: { es: "Indicación lineal detectada", pt: "Indicação linear detectada", en: "Linear indication found" } satisfies L10n,
    live: { es: "En vivo", pt: "Ao vivo", en: "Live" } satisfies L10n,
    personnel: { es: "Inspectores Nivel II", pt: "Inspetores Nível II", en: "Level II inspectors" } satisfies L10n,
  },

  services: {
    eyebrow: { es: "Qué inspeccionamos", pt: "O que inspecionamos", en: "What we inspect" } satisfies L10n,
    title: { es: "Nueve líneas de servicio. Un mismo rigor.", pt: "Nove linhas de serviço. O mesmo rigor.", en: "Nine service lines. One standard of rigour." } satisfies L10n,
    lead: {
      es: "De la broca al tanque de almacenamiento: elija el componente y vea cómo lo inspeccionamos.",
      pt: "Da broca ao tanque de armazenamento: escolha o componente e veja como o inspecionamos.",
      en: "From the drill bit to the storage tank: pick a component and see how we inspect it.",
    } satisfies L10n,
    featured: { es: "Especialidad", pt: "Especialidade", en: "Specialty" } satisfies L10n,
  },

  methods: {
    detects: { es: "Detecta", pt: "Detecta", en: "Finds" } satisfies L10n,
  },

  process: {
    eyebrow: { es: "Cómo trabajamos", pt: "Como trabalhamos", en: "How we work" } satisfies L10n,
    title: { es: "Una ruta trazable, de la recepción al reporte.", pt: "Uma rota rastreável, do recebimento ao relatório.", en: "One traceable route, from receipt to report." } satisfies L10n,
    lead: {
      es: "Cada componente sigue el mismo procedimiento estandarizado y queda documentado en TI-QMS.",
      pt: "Cada componente segue o mesmo procedimento padronizado e fica documentado no TI-QMS.",
      en: "Every component follows the same standardised procedure and is documented in TI-QMS.",
    } satisfies L10n,
    steps: [
      { t: { es: "Solicitud y recepción", pt: "Solicitação e recebimento", en: "Request & receipt" }, d: { es: "Identificamos cada pieza al recibirla.", pt: "Identificamos cada peça ao recebê-la.", en: "Every part is identified on arrival." } },
      { t: { es: "Puesta a punto", pt: "Preparação", en: "Preparation" }, d: { es: "Limpieza y preparación de la superficie.", pt: "Limpeza e preparação da superfície.", en: "Cleaning and surface preparation." } },
      { t: { es: "Inspección visual y NDT", pt: "Inspeção visual e END", en: "Visual & NDT inspection" }, d: { es: "VT, MT, PT y UT según el componente.", pt: "VT, MT, PT e UT conforme o componente.", en: "VT, MT, PT and UT to suit the component." } },
      { t: { es: "Evaluación", pt: "Avaliação", en: "Evaluation" }, d: { es: "Criterios de aceptación DS-1, API y ASTM.", pt: "Critérios de aceitação DS-1, API e ASTM.", en: "DS-1, API and ASTM acceptance criteria." } },
      { t: { es: "Reporte y conformidad", pt: "Relatório e conformidade", en: "Report & conformity" }, d: { es: "Registros, reporte y declaración de conformidad.", pt: "Registros, relatório e declaração de conformidade.", en: "Records, report and declaration of conformity." } },
    ] satisfies { t: L10n; d: L10n }[],
    recMt: { es: "MT · en campo", pt: "MT · em campo", en: "MT · on site" } satisfies L10n,
    recPt: { es: "PT · en campo", pt: "PT · em campo", en: "PT · on site" } satisfies L10n,
  },

  why: {
    eyebrow: { es: "Por qué Tech-Inspection", pt: "Por que a Tech-Inspection", en: "Why Tech-Inspection" } satisfies L10n,
    title: { es: "Certeza técnica que se puede auditar.", pt: "Certeza técnica que pode ser auditada.", en: "Technical certainty you can audit." } satisfies L10n,
    lead: {
      es: "Personal certificado, equipos calibrados y un sistema de gestión verificado por terceros respaldan cada resultado que entregamos.",
      pt: "Pessoal certificado, equipamentos calibrados e um sistema de gestão verificado por terceiros respaldam cada resultado que entregamos.",
      en: "Certified people, calibrated equipment and a third-party-audited management system stand behind every result we deliver.",
    } satisfies L10n,
    founded: { es: "Fundada en", pt: "Fundada em", en: "Founded in" } satisfies L10n,
    standards: { es: "Normas que guían cada decisión", pt: "Normas que orientam cada decisão", en: "Standards behind every decision" } satisfies L10n,
    partner: { es: "Aliado estratégico desde 2015", pt: "Aliado estratégico desde 2015", en: "Strategic partner since 2015" } satisfies L10n,
  },

  platform: {
    title: { es: "Cada inspección, trazable en línea.", pt: "Cada inspeção, rastreável online.", en: "Every inspection, traceable online." } satisfies L10n,
  },
};
