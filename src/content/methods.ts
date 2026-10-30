import type { L10n, L10nList } from "@/i18n/config";

export type MethodKey = "mt" | "pt" | "ut" | "vt";

export type Method = {
  key: MethodKey;
  slug: string;
  code: string;
  name: L10n;
  tagline: L10n;
  intro: L10n;
  body: L10n;
  advantages: L10nList;
  /** What the method detects, as listed in the client deck (slide 6). */
  detects: L10nList;
  steps: { title: L10n; text: L10n }[];
  cover: string;
  gallery: string[];
  video?: { src: string; poster: string };
};

const all: Method[] = [
  {
    key: "mt",
    slug: "particulas-magneticas",
    code: "MT",
    name: { es: "Partículas magnéticas", pt: "Partículas magnéticas", en: "Magnetic particle testing" },
    tagline: {
      es: "Fluorescencia bajo luz UV que revela grietas superficiales y subsuperficiales en materiales ferromagnéticos.",
      pt: "Fluorescência sob luz UV que revela trincas superficiais e subsuperficiais em materiais ferromagnéticos.",
      en: "UV fluorescence that reveals surface and near-surface cracks in ferromagnetic materials.",
    },
    intro: {
      es: "Detecta discontinuidades en materiales ferromagnéticos, tanto en la superficie como en sus proximidades.",
      pt: "Detecta descontinuidades em materiais ferromagnéticos, tanto na superfície quanto logo abaixo dela.",
      en: "Detects discontinuities in ferromagnetic materials, on the surface and just beneath it.",
    },
    body: {
      es: "Aplicamos partículas secas, húmedas coloreadas o fluorescentes húmedas mientras la pieza está bajo un campo magnético. Las partículas se acumulan alrededor de cada discontinuidad y, con luz UV (luz negra), revelan su ubicación con total claridad.",
      pt: "Aplicamos partículas secas, úmidas coloridas ou fluorescentes úmidas enquanto a peça está sob um campo magnético. As partículas se acumulam ao redor de cada descontinuidade e, com luz UV (luz negra), revelam sua localização com total clareza.",
      en: "We apply dry, visible wet or fluorescent wet particles while the part is under a magnetic field. Particles gather around each discontinuity and, under UV (black) light, reveal its location with complete clarity.",
    },
    advantages: {
      es: ["Inspección rápida y de bajo costo", "Equipo portátil para piezas grandes y pequeñas", "Detecta discontinuidades superficiales y subsuperficiales", "Indicaciones visibles sobre la propia pieza", "Resultados inmediatos", "No afecta la integridad de la pieza"],
      pt: ["Inspeção rápida e de baixo custo", "Equipamento portátil para peças grandes e pequenas", "Detecta descontinuidades superficiais e subsuperficiais", "Indicações visíveis na própria peça", "Resultados imediatos", "Não afeta a integridade da peça"],
      en: ["Fast, low-cost inspection", "Portable kit for large and small parts", "Finds surface and subsurface discontinuities", "Indications form right on the part", "Immediate results", "No damage to part integrity"],
    },
    detects: { es: ["Fisuras superficiales", "Discontinuidades cercanas a la superficie"], pt: ["Fissuras superficiais", "Descontinuidades próximas à superfície"], en: ["Surface cracks", "Near-surface discontinuities"] },
    steps: [
      { title: { es: "Magnetización", pt: "Magnetização", en: "Magnetize" }, text: { es: "Inducimos un campo magnético con yugo o equipo estacionario.", pt: "Induzimos um campo magnético com yoke ou equipamento estacionário.", en: "A magnetic field is induced with a yoke or bench unit." } },
      { title: { es: "Partículas", pt: "Partículas", en: "Particles" }, text: { es: "Aplicamos partículas fluorescentes o visibles sobre la superficie.", pt: "Aplicamos partículas fluorescentes ou visíveis sobre a superfície.", en: "Fluorescent or visible particles are applied to the surface." } },
      { title: { es: "Luz UV", pt: "Luz UV", en: "UV light" }, text: { es: "Las acumulaciones brillan y delatan cada discontinuidad.", pt: "Os acúmulos brilham e denunciam cada descontinuidade.", en: "Particle build-ups glow, exposing every discontinuity." } },
      { title: { es: "Informe", pt: "Relatório", en: "Report" }, text: { es: "Evaluamos frente a la norma y documentamos el resultado.", pt: "Avaliamos conforme a norma e documentamos o resultado.", en: "Indications are judged against the code and documented." } },
    ],
    cover: "/media/methods/mt-1.jpg",
    gallery: ["/media/methods/mt-1.jpg", "/media/methods/mt-4.jpg", "/media/methods/mt-2.jpg", "/media/methods/mt-7.jpg", "/media/methods/mt-3.jpg", "/media/methods/mt-6.jpg", "/media/methods/mt-8.jpg", "/media/methods/mt-yoke.jpg", "/media/methods/mt-5.jpg", "/media/methods/mt-10.jpg", "/media/methods/mt-11.jpg", "/media/methods/mt-12.jpg", "/media/methods/mt-13.jpg", "/media/methods/mt-14.jpg", "/media/methods/mt-15.jpg", "/media/photos/uv-inspector.jpg"],
    video: { src: "/media/video/mt-field.mp4", poster: "/media/methods/mt-6.jpg" },
  },
  {
    key: "pt",
    slug: "liquidos-penetrantes",
    code: "PT",
    name: { es: "Líquidos penetrantes", pt: "Líquidos penetrantes", en: "Liquid penetrant testing" },
    tagline: {
      es: "Un líquido de alto poder humectante penetra por capilaridad y un revelador expone cada imperfección superficial.",
      pt: "Um líquido de alto poder umectante penetra por capilaridade e um revelador expõe cada imperfeição superficial.",
      en: "A high-wetting liquid seeps in by capillarity and a developer exposes every surface flaw.",
    },
    intro: {
      es: "Detecta imperfecciones superficiales en materiales no porosos, metálicos y no metálicos.",
      pt: "Detecta imperfeições superficiais em materiais não porosos, metálicos e não metálicos.",
      en: "Finds surface flaws in non-porous materials, metallic and non-metallic alike.",
    },
    body: {
      es: "El penetrante entra en las discontinuidades por capilaridad. Retiramos el excedente con un sistema de limpieza adecuado y aplicamos un revelador que extrae el líquido atrapado, dibujando la ubicación exacta de cada indicación.",
      pt: "O penetrante entra nas descontinuidades por capilaridade. Removemos o excesso com um sistema de limpeza adequado e aplicamos um revelador que extrai o líquido retido, desenhando a localização exata de cada indicação.",
      en: "The penetrant enters discontinuities by capillary action. We remove the excess with a suitable cleaning system and apply a developer that draws the trapped liquid back out, mapping the exact location of every indication.",
    },
    advantages: {
      es: ["Resultados apenas termina el ensayo", "Uno de los ensayos NDT más económicos", "Aplica a materiales ferrosos y no ferrosos", "Equipo portátil", "No afecta la integridad de la pieza"],
      pt: ["Resultados logo ao final do ensaio", "Um dos ensaios END mais econômicos", "Aplicável a materiais ferrosos e não ferrosos", "Equipamento portátil", "Não afeta a integridade da peça"],
      en: ["Results as soon as the test ends", "One of the most cost-effective NDT methods", "Works on ferrous and non-ferrous materials", "Portable equipment", "No damage to part integrity"],
    },
    detects: { es: ["Fisuras abiertas", "Poros", "Microgrietas"], pt: ["Fissuras abertas", "Poros", "Microtrincas"], en: ["Open cracks", "Porosity", "Micro-cracks"] },
    steps: [
      { title: { es: "Limpieza", pt: "Limpeza", en: "Clean" }, text: { es: "Preparamos la superficie libre de grasa y contaminantes.", pt: "Preparamos a superfície livre de graxa e contaminantes.", en: "The surface is cleaned of grease and contaminants." } },
      { title: { es: "Penetrante", pt: "Penetrante", en: "Penetrant" }, text: { es: "El líquido entra en las discontinuidades por capilaridad.", pt: "O líquido entra nas descontinuidades por capilaridade.", en: "The liquid enters discontinuities by capillarity." } },
      { title: { es: "Remoción", pt: "Remoção", en: "Remove" }, text: { es: "Retiramos el excedente sin vaciar las indicaciones.", pt: "Removemos o excesso sem esvaziar as indicações.", en: "Excess is removed without emptying the flaws." } },
      { title: { es: "Revelado", pt: "Revelação", en: "Develop" }, text: { es: "El revelador hace visible cada indicación para evaluarla.", pt: "O revelador torna cada indicação visível para avaliação.", en: "The developer makes every indication visible for evaluation." } },
    ],
    cover: "/media/methods/pt-1.jpg",
    gallery: ["/media/methods/pt-1.jpg", "/media/methods/pt-3.jpg", "/media/methods/pt-4.jpg", "/media/methods/pt-6.jpg", "/media/methods/pt-7.jpg", "/media/methods/pt-5.jpg", "/media/methods/pt-2.jpg", "/media/methods/pt-8.jpg", "/media/methods/pt-10.jpg", "/media/methods/pt-11.jpg", "/media/methods/pt-12.jpg", "/media/methods/pt-13.jpg"],
    video: { src: "/media/video/pt-field.mp4", poster: "/media/methods/pt-1.jpg" },
  },
  {
    key: "ut",
    slug: "ultrasonido",
    code: "UT",
    name: { es: "Ultrasonido", pt: "Ultrassom", en: "Ultrasonic testing" },
    tagline: {
      es: "Ondas de alta frecuencia que miden espesores y localizan discontinuidades internas con precisión.",
      pt: "Ondas de alta frequência que medem espessuras e localizam descontinuidades internas com precisão.",
      en: "High-frequency waves that measure thickness and locate internal flaws with precision.",
    },
    intro: {
      es: "Mide los ecos que se producen cuando las ondas acústicas encuentran una discontinuidad dentro del material.",
      pt: "Mede os ecos produzidos quando as ondas acústicas encontram uma descontinuidade dentro do material.",
      en: "Measures the echoes produced when acoustic waves meet a discontinuity inside the material.",
    },
    body: {
      es: "Un transductor o palpador colocado sobre la superficie envía un haz pulsado de alta frecuencia. Analizamos las reflexiones para estimar posición, dimensiones, orientación y naturaleza de cada indicación, y medir espesores de pared.",
      pt: "Um transdutor posicionado sobre a superfície emite um feixe pulsado de alta frequência. Analisamos as reflexões para estimar posição, dimensões, orientação e natureza de cada indicação, e medir espessuras de parede.",
      en: "A hand-held transducer placed on the surface sends a high-frequency pulsed beam. We analyse the reflections to estimate the position, size, orientation and nature of each indication, and to measure wall thickness.",
    },
    advantages: {
      es: ["Rápido, con resultados inmediatos", "Ubica discontinuidades internas con exactitud", "Alta sensibilidad a discontinuidades pequeñas", "Gran capacidad de penetración", "Mide espesores de pared", "No afecta la integridad de la pieza"],
      pt: ["Rápido, com resultados imediatos", "Localiza descontinuidades internas com exatidão", "Alta sensibilidade a descontinuidades pequenas", "Grande capacidade de penetração", "Mede espessuras de parede", "Não afeta a integridade da peça"],
      en: ["Fast, with immediate results", "Pinpoints internal discontinuities", "High sensitivity to small flaws", "Deep penetration into the material", "Measures wall thickness", "No damage to part integrity"],
    },
    detects: { es: ["Defectos internos", "Pérdida de espesor", "Laminaciones"], pt: ["Defeitos internos", "Perda de espessura", "Laminações"], en: ["Internal defects", "Wall-thickness loss", "Laminations"] },
    steps: [
      { title: { es: "Calibración", pt: "Calibração", en: "Calibrate" }, text: { es: "Ajustamos el equipo con bloques patrón certificados.", pt: "Ajustamos o equipamento com blocos padrão certificados.", en: "The instrument is set up on certified reference blocks." } },
      { title: { es: "Acoplamiento", pt: "Acoplamento", en: "Couple" }, text: { es: "El acoplante transmite la onda del palpador a la pieza.", pt: "O acoplante transmite a onda do transdutor para a peça.", en: "Couplant carries the wave from probe to part." } },
      { title: { es: "Barrido", pt: "Varredura", en: "Scan" }, text: { es: "Recorremos la zona de interés leyendo cada eco.", pt: "Percorremos a área de interesse lendo cada eco.", en: "The area of interest is scanned echo by echo." } },
      { title: { es: "Evaluación", pt: "Avaliação", en: "Evaluate" }, text: { es: "Dimensionamos indicaciones y registramos espesores.", pt: "Dimensionamos indicações e registramos espessuras.", en: "Indications are sized and thicknesses recorded." } },
    ],
    cover: "/media/methods/ut-1.jpg",
    gallery: ["/media/methods/ut-1.jpg", "/media/methods/ut-2.jpg", "/media/methods/ut-3.jpg", "/media/methods/ut-4.jpg", "/media/methods/ut-5.jpg", "/media/photos/ut-equipment.jpg"],
  },
  {
    key: "vt",
    slug: "dimensional-visual",
    code: "VT",
    name: { es: "Inspección visual y dimensional", pt: "Inspeção visual e dimensional", en: "Visual & dimensional inspection" },
    tagline: {
      es: "Instrumentos calibrados y ojo experto para verificar geometría, desgaste y conformidad con la norma.",
      pt: "Instrumentos calibrados e olhar especializado para verificar geometria, desgaste e conformidade com a norma.",
      en: "Calibrated instruments and a trained eye to verify geometry, wear and code compliance.",
    },
    intro: {
      es: "Detecta grietas, corrosión, desgaste, erosión, fugas o daños físicos en materiales, equipos, accesorios y soldaduras.",
      pt: "Detecta trincas, corrosão, desgaste, erosão, vazamentos ou danos físicos em materiais, equipamentos, acessórios e soldas.",
      en: "Finds cracks, corrosion, wear, erosion, leaks or physical damage in materials, equipment, fittings and welds.",
    },
    body: {
      es: "Con instrumentos de medición debidamente calibrados corroboramos que cada pieza cumpla los estándares de la norma. Partimos de la información técnica del componente para interpretar con acierto cada indicación.",
      pt: "Com instrumentos de medição devidamente calibrados, confirmamos que cada peça atende aos padrões da norma. Partimos das informações técnicas do componente para interpretar corretamente cada indicação.",
      en: "Using properly calibrated measuring instruments, we confirm each part meets the applicable standard, starting from the component's technical data to interpret every indication correctly.",
    },
    advantages: {
      es: ["Datos cuantitativos de forma sencilla", "Evalúa pérdidas de material", "Evalúa la integridad general de la pieza", "Inspección rápida y preventiva"],
      pt: ["Dados quantitativos de forma simples", "Avalia perdas de material", "Avalia a integridade geral da peça", "Inspeção rápida e preventiva"],
      en: ["Quantitative data, simply", "Assesses material loss", "Evaluates overall part integrity", "Fast, preventive inspection"],
    },
    detects: { es: ["Desgaste", "Golpes", "Corrosión", "Deformaciones"], pt: ["Desgaste", "Impactos", "Corrosão", "Deformações"], en: ["Wear", "Impact damage", "Corrosion", "Deformation"] },
    steps: [
      { title: { es: "Documentación", pt: "Documentação", en: "Review" }, text: { es: "Revisamos planos, especificaciones y tolerancias.", pt: "Revisamos desenhos, especificações e tolerâncias.", en: "Drawings, specifications and tolerances are reviewed." } },
      { title: { es: "Visual", pt: "Visual", en: "Visual" }, text: { es: "Examinamos la superficie en busca de daños.", pt: "Examinamos a superfície em busca de danos.", en: "The surface is examined for damage." } },
      { title: { es: "Medición", pt: "Medição", en: "Measure" }, text: { es: "Calibradores, galgas y micrómetros certificados.", pt: "Paquímetros, calibres e micrômetros certificados.", en: "Certified calipers, gauges and micrometers." } },
      { title: { es: "Informe", pt: "Relatório", en: "Report" }, text: { es: "Datos trazables frente a la norma aplicable.", pt: "Dados rastreáveis conforme a norma aplicável.", en: "Traceable data against the applicable code." } },
    ],
    cover: "/media/methods/vt-1.jpg",
    gallery: ["/media/methods/vt-1.jpg", "/media/methods/vt-2.jpg", "/media/methods/vt-3.jpg", "/media/methods/vt-4.jpg", "/media/photos/tool-measure.jpg", "/media/photos/pipe-bore-2.jpg", "/media/photos/engineering-tools.jpg"],
  },
];

/** Deck order: the sequence in which the methods are applied (VT → MT → PT → UT). */
export const methods: Method[] = (["vt", "mt", "pt", "ut"] as const).map((k) => all.find((m) => m.key === k)!);

export const methodByKey = (key: MethodKey) => methods.find((m) => m.key === key)!;
export const methodBySlug = (slug: string) => methods.find((m) => m.slug === slug);
