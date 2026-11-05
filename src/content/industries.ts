// Industries served (design document §7.1 /industrias), grouped from the service lines. Seed data: the
// admin edits them under Contenido → Industrias. [CONFIRM the list with the client]
import type { L10n, L10nList } from "@/i18n/config";
import type { MethodKey } from "./methods";
import { QAQC_SLUG } from "./modules";

export type Industry = {
  slug: string;
  name: L10n;
  intro: L10n;
  /** What we inspect for this industry, one item per line. */
  components: L10nList;
  image: string;
  services: string[];
  methods: MethodKey[];
};

export const industries: Industry[] = [
  {
    slug: "perforacion-petroleo-y-gas",
    name: { es: "Perforación de petróleo y gas", pt: "Perfuração de petróleo e gás", en: "Oil and gas drilling" },
    intro: {
      es: "Inspeccionamos la sarta de perforación y sus herramientas antes de bajar al pozo: brocas, tubería, componentes de BHA, herramientas de pesca y wireline y equipos de cementación, con criterios de aceptación DS-1 y personal certificado.",
      pt: "Inspecionamos a coluna de perfuração e suas ferramentas antes de descer ao poço: brocas, tubos, componentes de BHA, ferramentas de pescaria e wireline e equipamentos de cimentação, com critérios de aceitação DS-1 e pessoal certificado.",
      en: "We inspect the drill string and its tools before they go downhole: bits, pipe, BHA components, fishing and wireline tools and cementing equipment, to DS-1 acceptance criteria and with certified personnel.",
    },
    components: {
      es: ["Brocas PDC y tricónicas", "Drill pipe, heavy weight y drill collars", "Estabilizadores, martillos y crossovers", "Herramientas de pesca y wireline", "Equipos de cementación"],
      pt: ["Brocas PDC e tricônicas", "Drill pipe, heavy weight e drill collars", "Estabilizadores, martelos e crossovers", "Ferramentas de pescaria e wireline", "Equipamentos de cimentação"],
      en: ["PDC and roller-cone bits", "Drill pipe, heavy weight and drill collars", "Stabilisers, jars and crossovers", "Fishing and wireline tools", "Cementing equipment"],
    },
    image: "/media/deck/pdc-bit.jpg",
    services: ["brocas", "tuberia", "componentes-bha", "fishing-wireline", "equipos-de-cementacion"],
    methods: ["ut", "mt", "pt", "vt"],
  },
  {
    slug: "produccion-y-facilidades",
    name: { es: "Producción y facilidades de superficie", pt: "Produção e facilidades de superfície", en: "Production and surface facilities" },
    intro: {
      es: "Verificamos el estado de líneas de presión, tanques y estructuras de las facilidades de producción: espesores de pared, corrosión, soldaduras y dimensiones, para que cada equipo opere dentro de los límites de su norma.",
      pt: "Verificamos o estado de linhas de pressão, tanques e estruturas das facilidades de produção: espessuras de parede, corrosão, soldas e dimensões, para que cada equipamento opere dentro dos limites da sua norma.",
      en: "We check the condition of pressure lines, tanks and structures in production facilities: wall thickness, corrosion, welds and dimensions, so each piece of equipment runs within the limits of its code.",
    },
    components: {
      es: ["Líneas y conexiones de alta presión", "Tanques de almacenamiento", "Soldaduras y estructuras metálicas"],
      pt: ["Linhas e conexões de alta pressão", "Tanques de armazenamento", "Soldas e estruturas metálicas"],
      en: ["High-pressure lines and connections", "Storage tanks", "Welds and steel structures"],
    },
    image: "/media/methods/ut-4.jpg",
    services: ["lineas-de-presion", "tanques", "estructural"],
    methods: ["ut", "vt", "pt", "mt"],
  },
  {
    slug: "izaje-y-manejo-de-cargas",
    name: { es: "Izaje y manejo de cargas", pt: "Içamento e movimentação de cargas", en: "Lifting and load handling" },
    intro: {
      es: "Inspeccionamos herramientas y accesorios de levante para que cada maniobra se haga con equipos en buen estado: detectamos grietas, desgaste y deformaciones antes de que pongan en riesgo a las personas y la carga.",
      pt: "Inspecionamos ferramentas e acessórios de içamento para que cada manobra seja feita com equipamentos em bom estado: detectamos trincas, desgaste e deformações antes que coloquem em risco as pessoas e a carga.",
      en: "We inspect lifting tools and accessories so every lift is made with sound equipment: we find cracks, wear and deformation before they put people and loads at risk.",
    },
    components: {
      es: ["Elevadores, cuñas y llaves", "Eslingas, grilletes y ganchos", "Accesorios y herramientas de levante"],
      pt: ["Elevadores, cunhas e chaves", "Lingas, manilhas e ganchos", "Acessórios e ferramentas de içamento"],
      en: ["Elevators, slips and tongs", "Slings, shackles and hooks", "Lifting accessories and tools"],
    },
    image: "/media/photos/workshop-team.jpg",
    services: ["levante-e-izaje"],
    methods: ["mt", "pt", "vt"],
  },
  {
    slug: "metalmecanica-y-fabricacion",
    name: { es: "Metalmecánica y fabricación", pt: "Metalmecânica e fabricação", en: "Metalworking and fabrication" },
    intro: {
      es: "Acompañamos a talleres y fabricantes con inspección de soldaduras y estructuras y con aseguramiento y control de calidad (QA/QC) de herramientas, desde la recepción de materiales hasta la entrega documentada.",
      pt: "Acompanhamos oficinas e fabricantes com inspeção de soldas e estruturas e com garantia e controle da qualidade (QA/QC) de ferramentas, desde o recebimento de materiais até a entrega documentada.",
      en: "We support workshops and manufacturers with weld and structural inspection and with quality assurance and control (QA/QC) of tools, from receiving materials to a documented delivery.",
    },
    components: {
      es: ["Soldaduras y uniones", "Estructuras y piezas fabricadas", "Herramientas nuevas y reparadas (QA/QC)"],
      pt: ["Soldas e uniões", "Estruturas e peças fabricadas", "Ferramentas novas e reparadas (QA/QC)"],
      en: ["Welds and joints", "Fabricated structures and parts", "New and repaired tools (QA/QC)"],
    },
    image: "/media/photos/engineering-tools.jpg",
    services: ["estructural", QAQC_SLUG],
    methods: ["vt", "pt", "mt", "ut"],
  },
];
