"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { readCue } from "@/lib/scene";
import type { SceneApi } from "./scene";

/**
 * The fixed backdrop of every public page: a CSS night sky, the WebGL oil-field scene on top of it
 * (desktop with a fine pointer only; three.js is loaded on demand) and a veil. The section crossing
 * the middle of the screen drives the scene through its cue (see lib/scene.ts).
 */
export function SceneBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const api = useRef<SceneApi | null>(null);
  const pathname = usePathname();

  // Start the scene once; it survives client-side navigation.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || matchMedia("(max-width: 1023px), (pointer: coarse)").matches) return;
    let cancelled = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    import("./scene").then(({ createScene }) => {
      if (cancelled) return;
      api.current = createScene(canvas, { reduced });
      if (!api.current) return;
      canvas.dataset.ready = "";
      window.dispatchEvent(new Event("scene:ready"));
    });
    return () => {
      cancelled = true;
      api.current?.dispose();
      api.current = null;
    };
  }, []);

  // Follow scroll and the active section on the current page.
  useEffect(() => {
    let active: Element | null = null;
    const apply = () => {
      const c = readCue(active);
      if (veilRef.current) veilRef.current.style.opacity = String(Math.min(0.95, c.veil));
      const s = api.current;
      if (!s) return;
      s.setPaused(c.mode === "pause");
      if (c.mode !== "pause") s.setMode(c.mode);
      s.setIntensity(c.intensity);
      s.setAccent(c.accent);
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      api.current?.setProgress(max > 0 ? window.scrollY / max : 0);
    };
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        // Innermost wins when cues are nested
        const next = [...visible].sort((a, b) => (a.contains(b) ? 1 : b.contains(a) ? -1 : 0))[0] ?? null;
        if (next !== active) {
          active = next;
          apply();
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    document.querySelectorAll("[data-scene]").forEach((el) => io.observe(el));
    const onReady = () => {
      apply();
      onScroll();
    };
    apply();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("scene:ready", onReady);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scene:ready", onReady);
    };
  }, [pathname]);

  return (
    <>
      <div aria-hidden className="scene-sky" />
      <canvas ref={canvasRef} aria-hidden className="scene-canvas" />
      <div ref={veilRef} aria-hidden className="scene-veil" />
    </>
  );
}
