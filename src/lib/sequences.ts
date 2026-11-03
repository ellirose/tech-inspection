import type { MethodKey } from "@/content/methods";

/**
 * Scroll-scrubbed video sections (components/sequence). Each video is exported as numbered WebP
 * frames (`f_001.webp` …) in `public/media/sequences/<key>/`; until then `src` is null and the
 * section draws a placeholder that names the scene the video must show at that scroll position.
 *
 * The scenes below are the storyboard the videos are produced from (doc/04-brand/VIDEO-PROMPTS.md):
 * keep both in step. Scene boundaries are equal shares of the scroll.
 */
export type Scene = { label: string; shot: string; accent: string };

export type SequenceSpec = {
  key: string;
  title: string;
  /** Frame folder once produced, e.g. "/media/sequences/methods"; null shows the placeholder. */
  src: string | null;
  /** Frames in the full sequence (24 fps: 240 = 10 s). */
  frames: number;
  /** Frames looped on phones, picked evenly from the full set. */
  mobileFrames: number;
  /** Extra scroll while the section is pinned, in screen heights. */
  scroll: number;
  scenes: Scene[];
};

export const METHODS_SEQUENCE_ORDER: MethodKey[] = ["vt", "mt", "pt", "ut"];

export const sequences = {
  methods: {
    key: "methods",
    title: "Cuatro métodos, un mismo acero",
    src: null,
    frames: 240,
    mobileFrames: 48,
    scroll: 3.2,
    scenes: [
      { label: "VT · Visual y dimensional", shot: "Macro de un cordón de soldadura en acero. Luz rasante ámbar recorre el cordón; una línea de medición fina cruza la superficie.", accent: "#f5a524" },
      { label: "MT · Partículas magnéticas", shot: "La luz se apaga a UV. Partículas verdes fluorescentes se agrupan sobre una grieta fina a lo largo del cordón.", accent: "#7ad62a" },
      { label: "PT · Líquidos penetrantes", shot: "La misma zona cubierta de revelador blanco mate. Una línea roja de penetrante aflora desde la grieta.", accent: "#ef3e57" },
      { label: "UT · Ultrasonido", shot: "El acero se vuelve corte transversal. Un pulso azul viaja hacia dentro y rebota en un defecto interno; ecos concéntricos.", accent: "#1fb3ee" },
    ],
  },
  process: {
    key: "process",
    title: "El recorrido de una pieza",
    src: null,
    frames: 240,
    mobileFrames: 48,
    scroll: 3.6,
    scenes: [
      { label: "Solicitud y recepción", shot: "Taller de noche. Una tubería de perforación llega a un rack; una línea de luz cian recorre su contorno y la identifica.", accent: "#1fc8f5" },
      { label: "Puesta a punto", shot: "Niebla de agua a presión sobre la tubería; gotas iluminadas en cian, el acero queda limpio y brillante.", accent: "#1fc8f5" },
      { label: "Inspección visual y NDT", shot: "Un anillo de luz cian avanza a lo largo de la tubería; aparecen indicaciones fluorescentes en la rosca.", accent: "#1fc8f5" },
      { label: "Evaluación", shot: "Primer plano del extremo roscado; líneas de medición holográficas comparan el perfil con la norma.", accent: "#3a98f0" },
      { label: "Reporte y conformidad", shot: "La tubería recibe su banda de color de inspección; la luz se calma y el plano se oscurece.", accent: "#86e33a" },
    ],
  },
} satisfies Record<string, SequenceSpec>;
