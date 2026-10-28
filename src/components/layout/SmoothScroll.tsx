"use client";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.11, wheelMultiplier: 1, anchors: { offset: -96 } }}>
      {children}
    </ReactLenis>
  );
}
