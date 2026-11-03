/**
 * Scene cues: how the fixed 3D background (components/scene) behaves while a section is centred
 * on screen. Spread the result on the section root: `<section {...cue({ mode: "scan" })}>`.
 *
 * - `rigs`  the default flight: derricks, pipelines with travelling pulses, particle dust
 * - `scan`  the pipe tunnel with a sweeping inspection ring, tinted by `accent`
 * - `pause` the section covers the screen (scroll sequences), so the scene stops rendering
 */
export type SceneMode = "rigs" | "scan" | "pause";

export type SceneCue = {
  mode?: SceneMode;
  /** 0–1: line brightness, pulse count and speed. */
  intensity?: number;
  /** 0–0.95: darkness of the veil between the scene and the content. */
  veil?: number;
  /** Hex colour for particles, pulses and the tunnel. */
  accent?: string;
};

export const SCENE_DEFAULTS = { mode: "rigs", intensity: 0.5, veil: 0.35, accent: "#1fc8f5" } as const satisfies Required<SceneCue>;

export function cue({ mode, intensity, veil, accent }: SceneCue) {
  return {
    "data-scene": mode ?? SCENE_DEFAULTS.mode,
    "data-scene-intensity": intensity,
    "data-scene-veil": veil,
    "data-scene-accent": accent,
  };
}

/** Reads a cue back from a section element (missing values fall back to the defaults). */
export function readCue(el: Element | null): Required<SceneCue> {
  const num = (name: string, fallback: number) => {
    const v = parseFloat(el?.getAttribute(name) ?? "");
    return Number.isFinite(v) ? v : fallback;
  };
  return {
    mode: (el?.getAttribute("data-scene") as SceneMode | null) ?? SCENE_DEFAULTS.mode,
    intensity: num("data-scene-intensity", SCENE_DEFAULTS.intensity),
    veil: num("data-scene-veil", SCENE_DEFAULTS.veil),
    accent: el?.getAttribute("data-scene-accent") || SCENE_DEFAULTS.accent,
  };
}
