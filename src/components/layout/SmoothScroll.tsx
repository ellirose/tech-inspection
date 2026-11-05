"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import type Lenis from "lenis";
import "lenis/dist/lenis.css";

let instance: Lenis | null = null;

/** The smooth-scroll controller, when there is one (mouse and trackpad screens only). */
export const getLenis = () => instance;

/**
 * Smooth wheel scrolling for mouse and trackpad users, loaded only on such screens: touch scrolling is
 * left to the browser, so phones neither download nor run it. Motion animations follow the visitor's
 * reduced-motion setting.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    import("lenis").then(({ default: LenisClass }) => {
      if (cancelled) return;
      instance = new LenisClass({ autoRaf: true, lerp: 0.11, wheelMultiplier: 1, anchors: { offset: -96 } });
    });
    return () => {
      cancelled = true;
      instance?.destroy();
      instance = null;
    };
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
