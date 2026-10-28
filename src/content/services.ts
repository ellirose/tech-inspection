import type { L10n, L10nList } from "@/i18n/config";
import type { MethodKey } from "./methods";

export type ServiceIcon = "pipe" | "drill" | "gauge" | "wrench" | "cylinder" | "crane" | "tank" | "buildings";

export type Service = {
  slug: string;
  icon: ServiceIcon;
  image: string;
  name: L10n;
  short: L10n;
  body: [L10n, L10n];
  scope: L10nList;
  methods: MethodKey[];
  /** Content not yet supplied by the client; copy is a sensible draft to confirm. */
  draft?: boolean;
};

export const services: Service[] = [
  {
    slug: "tuberia",
    icon: "pipe",
    image: "/media/photos/pipe-bore.jpg",
    name: { es: "Tubería", pt: "Tubulações", en: "Pipe & OCTG" },
    short: { es: "Drill pipe, casing, tubing y tubería de cementación.", pt: "Drill pipe, casing, tubing e tubulação de cimentação.", en: "Drill pipe, casing, tubing and cementing pipe." },
    body: [
      { es: "Protegemos la integridad de sus sistemas de tubería, especialmente en el sector de hidrocarburos, para que mantengan rendimiento y seguridad a lo largo del tiempo.", pt: "Protegemos a integridade dos seus sistemas de tubulação, especialmente no setor de hidrocarbonetos, para que mantenham desempenho e segurança ao longo do tempo.", en: "We safeguard the integrity of your piping, especially in oil & gas, so it keeps performing safely over time." },
      { es: "Aplicamos ensayos no destructivos para detectar discontinuidades, corrosión o cualquier defecto que comprometa el funcionamiento, con diagnósticos precisos para cada tramo.", pt: "Aplicamos ensaios não destrutivos para detectar descontinuidades, corrosão ou qualquer defeito que comprometa o funcionamento, com diagnósticos precisos para cada trecho.", en: "Non-destructive testing detects discontinuities, corrosion or any defect that could compromise operation, with a precise diagnosis for every joint." },
    ],
    scope: {
      es: ["Tubería de perforación (drill pipe)", "Tubería de revestimiento (casing)", "Tubería de producción (tubing)", "Tubería de cementación"],
      pt: ["Tubo de perfuração (drill pipe)", "Tubo de revestimento (casing)", "Tubo de produção (tubing)", "Tubulação de cimentação"],
      en: ["Drill pipe", "Casing", "Tubing", "Cementing pipe"],
    },
    methods: ["ut", "mt", "vt"],
  },
  {
    slug: "componentes-bha",
    icon: "drill",
    image: "/media/photos/drill-bit.jpg",
    name: { es: "Componentes de BHA", pt: "Componentes de BHA", en: "BHA components" },
    short: { es: "Brocas, estabilizadores y motores del Bottom Hole Assembly.", pt: "Brocas, estabilizadores e motores do Bottom Hole Assembly.", en: "Bits, stabilizers and motors in the bottom hole assembly." },
    body: [
      { es: "Revisamos los elementos más críticos de la sarta de perforación para garantizar la seguridad y eficiencia de sus operaciones.", pt: "Revisamos os elementos mais críticos da coluna de perfuração para garantir a segurança e a eficiência das suas operações.", en: "We inspect the most critical elements of the drill string to keep your operations safe and efficient." },
      { es: "Detectamos a tiempo defectos, desgaste o discontinuidades, previniendo fallas operativas, retrasos costosos y daños a los equipos.", pt: "Detectamos a tempo defeitos, desgaste ou descontinuidades, prevenindo falhas operacionais, atrasos custosos e danos aos equipamentos.", en: "We catch defects, wear or discontinuities early, preventing failures, costly delays and equipment damage." },
    ],
    scope: {
      es: ["Brocas", "Estabilizadores", "Motores de perforación", "Otros componentes del BHA"],
      pt: ["Brocas", "Estabilizadores", "Motores de perfuração", "Outros componentes do BHA"],
      en: ["Drill bits", "Stabilizers", "Drilling motors", "Other BHA components"],
    },
    methods: ["mt", "pt", "vt", "ut"],
  },
  {
    slug: "lineas-de-presion",
    icon: "gauge",
    image: "/media/methods/ut-4.jpg",
    name: { es: "Líneas de presión", pt: "Linhas de pressão", en: "Pressure lines" },
    short: { es: "Sistemas de transporte de fluidos y gases a presión.", pt: "Sistemas de transporte de fluidos e gases sob pressão.", en: "Pressurised fluid and gas transport systems." },
    body: [
      { es: "Inspeccionamos líneas de presión para garantizar la integridad de los sistemas de transporte de fluidos y gases en petróleo y gas, energía y petroquímica.", pt: "Inspecionamos linhas de pressão para garantir a integridade dos sistemas de transporte de fluidos e gases em petróleo e gás, energia e petroquímica.", en: "We inspect pressure lines to secure fluid and gas transport systems in oil & gas, power and petrochemicals." },
      { es: "Detectamos temprano corrosión, desgaste, fisuras o discontinuidades, previniendo daños costosos y paradas operativas.", pt: "Detectamos cedo corrosão, desgaste, fissuras ou descontinuidades, prevenindo danos custosos e paradas operacionais.", en: "We spot corrosion, wear, cracks or discontinuities early, preventing costly damage and shutdowns." },
    ],
    scope: {
      es: ["Corrosión y desgaste", "Fisuras y discontinuidades", "Medición de espesores", "Cumplimiento de estándares de seguridad"],
      pt: ["Corrosão e desgaste", "Fissuras e descontinuidades", "Medição de espessuras", "Conformidade com padrões de segurança"],
      en: ["Corrosion and wear", "Cracks and discontinuities", "Thickness gauging", "Safety-standard compliance"],
    },
    methods: ["ut", "mt", "pt", "vt"],
  },
  {
    slug: "fishing-wireline",
    icon: "wrench",
    image: "/media/methods/mt-yoke.jpg",
    name: { es: "Fishing y wireline", pt: "Fishing e wireline", en: "Fishing & wireline" },
    short: { es: "Herramientas de recuperación y mantenimiento de pozos.", pt: "Ferramentas de recuperação e manutenção de poços.", en: "Well recovery and maintenance tools." },
    body: [
      { es: "Inspeccionamos herramientas de fishing y wireline, esenciales para recuperar equipos y ejecutar tareas críticas en pozos petroleros.", pt: "Inspecionamos ferramentas de fishing e wireline, essenciais para recuperar equipamentos e executar tarefas críticas em poços de petróleo.", en: "We inspect fishing and wireline tools, essential for recovering equipment and critical well work." },
      { es: "Con inspecciones rigurosas aseguramos que cada herramienta esté libre de defectos y cumpla los más altos estándares de calidad y fiabilidad.", pt: "Com inspeções rigorosas garantimos que cada ferramenta esteja livre de defeitos e atenda aos mais altos padrões de qualidade e confiabilidade.", en: "Rigorous inspection ensures every tool is defect-free and meets the highest quality and reliability standards." },
    ],
    scope: {
      es: ["Herramientas de pesca", "Herramientas de wireline", "Conexiones y roscas", "Componentes de recuperación"],
      pt: ["Ferramentas de pescaria", "Ferramentas de wireline", "Conexões e roscas", "Componentes de recuperação"],
      en: ["Fishing tools", "Wireline tools", "Connections and threads", "Recovery components"],
    },
    methods: ["mt", "vt", "pt"],
  },
  {
    slug: "equipos-de-cementacion",
    icon: "cylinder",
    image: "/media/methods/pt-3.jpg",
    name: { es: "Equipos de cementación", pt: "Equipamentos de cimentação", en: "Cementing equipment" },
    short: { es: "Cabezales, bombas, mezcladores y herramientas asociadas.", pt: "Cabeças, bombas, misturadores e ferramentas associadas.", en: "Heads, pumps, mixers and associated tools." },
    body: [
      { es: "Aseguramos que los equipos de cementación operen en condiciones óptimas para colocar correctamente el cemento y proteger la integridad estructural del pozo.", pt: "Garantimos que os equipamentos de cimentação operem em condições ideais para posicionar corretamente o cimento e proteger a integridade estrutural do poço.", en: "We make sure cementing equipment runs in optimal condition to place cement correctly and protect well integrity." },
      { es: "Combinamos inspección visual, ultrasonido y ensayos electromagnéticos para detectar defectos o desgaste antes de las operaciones críticas.", pt: "Combinamos inspeção visual, ultrassom e ensaios eletromagnéticos para detectar defeitos ou desgaste antes das operações críticas.", en: "Visual inspection, ultrasound and electromagnetic tests catch defects or wear before critical operations." },
    ],
    scope: {
      es: ["Cabezales de cementación", "Bombas", "Mezcladores", "Herramientas asociadas"],
      pt: ["Cabeças de cimentação", "Bombas", "Misturadores", "Ferramentas associadas"],
      en: ["Cementing heads", "Pumps", "Mixers", "Associated tools"],
    },
    methods: ["vt", "ut", "mt"],
  },
  {
    slug: "levante-e-izaje",
    icon: "crane",
    image: "/media/photos/workshop-team.jpg",
    name: { es: "Levante e izaje", pt: "Elevação e içamento", en: "Lifting & hoisting" },
    short: { es: "Cuñas, elevadores, grúas, eslingas, ganchos y polipastos.", pt: "Cunhas, elevadores, guindastes, lingas, ganchos e talhas.", en: "Slips, elevators, cranes, slings, hooks and hoists." },
    body: [
      { es: "Verificamos que los equipos para levantar y mover cargas pesadas cumplan los más altos estándares de seguridad, previniendo fallas que pongan en riesgo la operación o al personal.", pt: "Verificamos se os equipamentos de elevação e movimentação de cargas pesadas atendem aos mais altos padrões de segurança, prevenindo falhas que coloquem em risco a operação ou as pessoas.", en: "We verify that equipment for lifting and moving heavy loads meets the highest safety standards, preventing failures that put operations or people at risk." },
      { es: "Complementamos la inspección con revisión y mantenimiento preventivo para prolongar la vida útil de sus herramientas.", pt: "Complementamos a inspeção com revisão e manutenção preventiva para prolongar a vida útil das suas ferramentas.", en: "Inspection is backed by review and preventive maintenance to extend tool life." },
    ],
    scope: {
      es: ["Cuñas y elevadores manuales", "Elevadores mecánicos e hidráulicos", "Grúas, eslingas y ganchos", "Polipastos y accesorios de izaje"],
      pt: ["Cunhas e elevadores manuais", "Elevadores mecânicos e hidráulicos", "Guindastes, lingas e ganchos", "Talhas e acessórios de içamento"],
      en: ["Slips and manual elevators", "Mechanical and hydraulic elevators", "Cranes, slings and hooks", "Hoists and rigging"],
    },
    methods: ["mt", "vt", "pt"],
  },
  {
    slug: "tanques",
    icon: "tank",
    image: "/media/photos/pressure-wash.jpg",
    name: { es: "Tanques", pt: "Tanques", en: "Tanks" },
    short: { es: "Espesores, soldaduras y estado general de tanques.", pt: "Espessuras, soldas e estado geral de tanques.", en: "Thickness, welds and overall tank condition." },
    body: [
      { es: "Evaluamos el estado de tanques de almacenamiento para garantizar su integridad y una operación segura.", pt: "Avaliamos o estado de tanques de armazenamento para garantir sua integridade e uma operação segura.", en: "We assess storage tanks to secure their integrity and safe operation." },
      { es: "Combinamos medición de espesores por ultrasonido, inspección de soldaduras e inspección visual y dimensional para detectar corrosión y pérdida de material.", pt: "Combinamos medição de espessuras por ultrassom, inspeção de soldas e inspeção visual e dimensional para detectar corrosão e perda de material.", en: "Ultrasonic thickness gauging, weld inspection and visual-dimensional checks reveal corrosion and material loss." },
    ],
    scope: {
      es: ["Medición de espesores", "Inspección de soldaduras", "Evaluación de corrosión", "Inspección visual y dimensional"],
      pt: ["Medição de espessuras", "Inspeção de soldas", "Avaliação de corrosão", "Inspeção visual e dimensional"],
      en: ["Thickness gauging", "Weld inspection", "Corrosion assessment", "Visual & dimensional"],
    },
    methods: ["ut", "vt", "pt", "mt"],
    draft: true,
  },
  {
    slug: "estructural",
    icon: "buildings",
    image: "/media/photos/warehouse.jpg",
    name: { es: "Estructural", pt: "Estrutural", en: "Structural" },
    short: { es: "Puentes, plataformas y edificaciones industriales.", pt: "Pontes, plataformas e edificações industriais.", en: "Bridges, platforms and industrial buildings." },
    body: [
      { es: "Garantizamos la integridad y seguridad de estructuras críticas en construcción, energía, minería y otras industrias.", pt: "Garantimos a integridade e a segurança de estruturas críticas em construção, energia, mineração e outras indústrias.", en: "We secure the integrity of critical structures in construction, energy, mining and beyond." },
      { es: "Inspeccionamos puentes, plataformas, edificaciones industriales y otros componentes para asegurar que cumplan los estándares de calidad y seguridad.", pt: "Inspecionamos pontes, plataformas, edificações industriais e outros componentes para garantir que atendam aos padrões de qualidade e segurança.", en: "We inspect bridges, platforms, industrial buildings and other members against quality and safety standards." },
    ],
    scope: {
      es: ["Puentes", "Plataformas", "Edificaciones industriales", "Uniones soldadas"],
      pt: ["Pontes", "Plataformas", "Edificações industriais", "Juntas soldadas"],
      en: ["Bridges", "Platforms", "Industrial buildings", "Welded joints"],
    },
    methods: ["vt", "ut", "mt", "pt"],
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
