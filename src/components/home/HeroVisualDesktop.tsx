"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { DESKTOP, useMedia } from "@/lib/use-media";

// The hero's animated rig, desktop only: phones neither download nor hydrate it.
const HeroVisual = dynamic(() => import("./HeroVisual").then((m) => m.HeroVisual), { ssr: false });

export function HeroVisualDesktop(props: ComponentProps<typeof HeroVisual>) {
  return useMedia(DESKTOP) ? <HeroVisual {...props} /> : null;
}
