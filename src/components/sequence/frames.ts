import type { SequenceSpec } from "@/lib/sequences";

/**
 * Draws a frame sequence on a canvas. Desktop scrubs it with scroll (`scrub`); phones loop a subset
 * at 8 fps while on screen; reduced motion holds the first frame. Frames load coarse-to-fine once the
 * section is near, and the nearest loaded frame stands in for one still on its way, so a fast scroll
 * never shows a blank. Without `spec.src` it paints moving lines in the scene's accent instead.
 */
export type FramePlayer = { scrub(p: number): void; dispose(): void };

const LOOP_MS = 125;

export function createFramePlayer(canvas: HTMLCanvasElement, spec: SequenceSpec, { loop, reduced }: { loop: boolean; reduced: boolean }): FramePlayer {
  const ctx = canvas.getContext("2d", { alpha: false })!;
  // Frame numbers (0-based) this device uses
  const step = loop ? Math.max(1, Math.floor(spec.frames / spec.mobileFrames)) : 1;
  const indices = Array.from({ length: Math.ceil(spec.frames / step) }, (_, i) => i * step);
  const images: (HTMLImageElement | undefined)[] = [];
  let current = 0;
  let width = 0;
  let height = 0;
  let timer = 0;
  let disposed = false;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(current);
  };

  const nearestLoaded = (slot: number) => {
    for (let d = 0; d < indices.length; d++) {
      if (images[slot - d]) return images[slot - d];
      if (images[slot + d]) return images[slot + d];
    }
    return undefined;
  };

  function draw(slot: number) {
    if (!width || !height) return;
    if (!spec.src) return lines(ctx, spec, indices[slot], width, height);
    const img = nearestLoaded(slot);
    if (!img) {
      ctx.fillStyle = "#02070d";
      ctx.fillRect(0, 0, width, height);
      return;
    }
    // object-fit: cover
    const s = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
  }

  // Coarse-to-fine: every 16th frame first, then 8th, 4th, 2nd, all
  const order: number[] = [];
  for (const stride of [16, 8, 4, 2, 1]) for (let i = 0; i < indices.length; i += stride) if (!order.includes(i)) order.push(i);

  const load = () => {
    if (!spec.src) return;
    let next = 0;
    let inFlight = 0;
    const pump = () => {
      while (!disposed && inFlight < 4 && next < order.length) {
        const slot = order[next++];
        const img = new Image();
        inFlight++;
        img.decoding = "async";
        img.onload = () => {
          images[slot] = img;
          inFlight--;
          if (Math.abs(slot - current) <= 16) draw(current);
          pump();
        };
        img.onerror = () => {
          inFlight--;
          pump();
        };
        img.src = `${spec.src}/f_${String(indices[slot] + 1).padStart(3, "0")}.webp`;
      }
    };
    pump();
  };

  const play = (on: boolean) => {
    window.clearInterval(timer);
    timer = 0;
    if (on && loop && !reduced) {
      timer = window.setInterval(() => {
        current = (current + 1) % indices.length;
        draw(current);
      }, LOOP_MS);
    }
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  let started = false;
  const io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting && !started) {
        started = true;
        load();
      }
      play(e.isIntersecting);
    },
    { rootMargin: "150% 0px" },
  );
  io.observe(canvas);

  return {
    scrub(p) {
      if (loop) return;
      const slot = Math.min(indices.length - 1, Math.max(0, Math.floor(p * indices.length)));
      if (slot === current) return;
      current = slot;
      draw(slot);
    },
    dispose() {
      disposed = true;
      play(false);
      ro.disconnect();
      io.disconnect();
    },
  };
}

/** Scene accent glow and a floor grid that rushes toward the camera as the scroll advances. */
function lines(ctx: CanvasRenderingContext2D, spec: SequenceSpec, frame: number, w: number, h: number) {
  const n = spec.scenes.length;
  const s = frame / Math.max(1, spec.frames - 1);
  const stage = Math.min(n - 1, Math.floor(s * n));
  const scene = spec.scenes[stage];
  const vx = w * 0.68;
  const horizon = h * 0.6;

  ctx.fillStyle = "#02070d";
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(vx, horizon, 0, vx, horizon, w * 0.6);
  glow.addColorStop(0, hexA(scene.accent, 0.28));
  glow.addColorStop(1, hexA(scene.accent, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Floor grid rushing toward the camera as the scroll advances
  ctx.strokeStyle = hexA(scene.accent, 0.22);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = -14; i <= 14; i++) {
    ctx.moveTo(vx + i * 6, horizon);
    ctx.lineTo(vx + i * w * 0.16, h);
  }
  const travel = (s * 24) % 1;
  for (let k = 0; k < 12; k++) {
    const z = (k + 1 - travel) / 12;
    const y = horizon + (h - horizon) * z * z;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
