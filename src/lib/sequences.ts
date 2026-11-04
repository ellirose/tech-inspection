import type { MethodKey } from "@/content/methods";

/**
 * Scroll-scrubbed video sections (components/sequence). Each video is exported as numbered WebP
 * frames (`f_001.webp` …) in `public/media/sequences/<key>/`; until then `src` is null and the
 * section draws a placeholder that names the scene the video must show at that scroll position.
 *
 * The scenes below are the storyboard the videos are produced from (doc/04-brand/VIDEO-1-METHODS.md, VIDEO-2-PROCESS.md):
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
    src: "/media/sequences/methods",
    frames: 240,
    mobileFrames: 48,
    scroll: 3.2,
    scenes: [
      { label: "VT · Visual y dimensional", shot: "Broca PDC de 12¼ pulgadas, cara de corte arriba: luz rasante blanca revela aletas, cortadores, boquillas y gauge.", accent: "#f5a524" },
      { label: "MT · Partículas magnéticas", shot: "Sub de perforación sobre bloques en V, yugo sobre la rosca del pin: bajo luz UV-A la rosca brilla en verde fluorescente.", accent: "#7ad62a" },
      { label: "PT · Líquidos penetrantes", shot: "Segunda broca PDC cubierta de penetrante rojo brillante durante el tiempo de permanencia.", accent: "#ef3e57" },
      { label: "UT · Ultrasonido", shot: "Drill collar con palpador de ultrasonido sobre acoplante y detector de fallas con onda verde. La luz se apaga.", accent: "#1fb3ee" },
    ],
  },
  process: {
    key: "process",
    title: "El recorrido de una broca",
    src: "/media/sequences/process",
    frames: 240,
    mobileFrames: 48,
    scroll: 3.6,
    scenes: [
      { label: "Solicitud y recepción", shot: "Broca recién llegada del pozo, con lodo seco, sobre un pallet; etiqueta de identificación con código de barras.", accent: "#1fc8f5" },
      { label: "Puesta a punto", shot: "Chorro de agua a presión en cámara lenta lava el pin y las aletas; queda el acero limpio.", accent: "#1fc8f5" },
      { label: "Inspección visual y NDT", shot: "Bajo luz UV-A, la conexión roscada de la broca brilla con partículas magnéticas fluorescentes, con el yugo encima.", accent: "#1fc8f5" },
      { label: "Evaluación", shot: "Galga de perfil de rosca asentada en el pin, calibrador al lado y el estándar técnico cerrado.", accent: "#3a98f0" },
      { label: "Reporte y conformidad", shot: "Broca aprobada sobre un pedestal con protector en el pin, tablet con el reporte y un taladro al atardecer al fondo.", accent: "#86e33a" },
    ],
  },
} satisfies Record<string, SequenceSpec>;
