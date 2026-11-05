"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether a media query matches, read in the browser. The server (and hydration) always gets false,
 * so whatever depends on it renders only after hydration, and never on screens it is not meant for:
 * a phone does not hydrate the desktop-only parts of the page.
 */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}

/** Screens that get the desktop layout (Tailwind's lg breakpoint). */
export const DESKTOP = "(min-width: 1024px)";
