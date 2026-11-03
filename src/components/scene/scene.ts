import * as THREE from "three";
import type { SceneMode } from "@/lib/scene";

/**
 * The night oil field behind the site, drawn in code. As the page scrolls the camera flies forward
 * past drilling derricks and two pipelines; ultrasonic pulses travel along the pipes, a sonar ring
 * beats near the hero and an A-scan trace sweeps across the horizon. In `scan` mode the derricks
 * fade out and the camera is inside a pipe being inspected, tinted by the section's accent.
 *
 * Loaded on demand by SceneBackground (desktop, WebGL only).
 */

const FOG = 0x030a12;
const AZURE = 0x3a98f0;
const NEON = 0x1fc8f5;
const FLOOR = -14;
const PIPE = { x: 8.5, y: FLOOR + 1.2, r: 0.9 };
const TUNNEL = { y: -1, r: 12 };
const Z_NEAR = 30;
const Z_FAR = -345;

// Camera flight, keyed by page scroll progress
const FLIGHT = [
  { p: 0, x: 0, y: 2, z: 26 },
  { p: 0.15, x: -3, y: 1, z: -6 },
  { p: 0.4, x: 2, y: -1, z: -70 },
  { p: 0.7, x: -2, y: -2, z: -150 },
  { p: 1, x: 0, y: -3, z: -235 },
];

export type SceneApi = {
  setProgress(p: number): void;
  setMode(mode: Exclude<SceneMode, "pause">): void;
  setIntensity(i: number): void;
  setAccent(hex: string): void;
  setPaused(paused: boolean): void;
  dispose(): void;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const gauss = (s: number, mu: number, w: number) => Math.exp(-(((s - mu) / w) ** 2));

function flight(p: number) {
  let a = FLIGHT[0];
  let b = FLIGHT[FLIGHT.length - 1];
  for (let i = 0; i < FLIGHT.length - 1; i++) {
    if (p >= FLIGHT[i].p && p <= FLIGHT[i + 1].p) {
      a = FLIGHT[i];
      b = FLIGHT[i + 1];
      break;
    }
  }
  let t = b.p === a.p ? 0 : (p - a.p) / (b.p - a.p);
  t = t * t * (3 - 2 * t);
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t) };
}

/** Collects line segments into one geometry, so each layer is a single draw call. */
class Lines {
  v: number[] = [];
  seg(a: number[], b: number[]) {
    this.v.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  }
  ring(cx: number, cy: number, z: number, r: number, n: number) {
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = ((i + 1) / n) * Math.PI * 2;
      this.seg([cx + r * Math.cos(a0), cy + r * Math.sin(a0), z], [cx + r * Math.cos(a1), cy + r * Math.sin(a1), z]);
    }
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.v, 3));
    return g;
  }
}

/** A land drilling derrick: tapered lattice mast, crown block, monkey board, drill floor and catwalk. */
function derrick(L: Lines, ox: number, oy: number, oz: number, rot: number, h = 30, base = 3.4, top = 0.9) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const P = (x: number, y: number, z: number) => [ox + x * c - z * s, oy + y, oz + x * s + z * c];
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
    const q = [P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1), P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)];
    for (let k = 0; k < 4; k++) {
      L.seg(q[k], q[(k + 1) % 4]);
      L.seg(q[k + 4], q[((k + 1) % 4) + 4]);
      L.seg(q[k], q[k + 4]);
    }
    return q;
  };

  const levels = 9;
  const corners = (i: number) => {
    const t = i / levels;
    const w = lerp(base, top, Math.pow(t, 0.9));
    const y = t * h;
    return [P(-w, y, -w), P(w, y, -w), P(w, y, w), P(-w, y, w)];
  };
  for (let i = 0; i <= levels; i++) {
    const r = corners(i);
    for (let k = 0; k < 4; k++) L.seg(r[k], r[(k + 1) % 4]);
    if (i < levels) {
      const n = corners(i + 1);
      for (let k = 0; k < 4; k++) {
        L.seg(r[k], n[k]);
        L.seg(r[k], n[(k + 1) % 4]);
        L.seg(r[(k + 1) % 4], n[k]);
      }
    }
  }
  // Monkey board, crown block and gin pole
  const my = h * 0.72;
  const mw = lerp(base, top, Math.pow(0.72, 0.9));
  L.seg(P(mw, my, -mw), P(mw + 2.2, my, -mw));
  L.seg(P(mw + 2.2, my, -mw), P(mw + 2.2, my, mw));
  L.seg(P(mw + 2.2, my, mw), P(mw, my, mw));
  box(-top - 0.5, top + 0.5, h, h + 1.4, -top - 0.5, top + 0.5);
  L.seg(P(-0.5, h + 1.4, 0), P(0, h + 3.2, 0));
  L.seg(P(0.5, h + 1.4, 0), P(0, h + 3.2, 0));
  // Travelling block line
  L.seg(P(0, h, 0), P(0, 1, 0));
  // Drill floor (substructure) with bracing, and the catwalk ramp
  const q = box(-base - 1, base + 1, -3, 0, -base - 1, base + 1);
  L.seg(q[0], q[5]);
  L.seg(q[1], q[4]);
  L.seg(q[3], q[6]);
  L.seg(q[2], q[7]);
  L.seg(P(base + 1, 0, -0.8), P(base + 10, -3, -0.8));
  L.seg(P(base + 1, 0, 0.8), P(base + 10, -3, 0.8));
}

/** A ground pipeline: longitudinal lines, weld rings, flanges and H supports. */
function pipeline(L: Lines, x: number) {
  const { y, r } = PIPE;
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    L.seg([x + r * Math.cos(a), y + r * Math.sin(a), Z_NEAR], [x + r * Math.cos(a), y + r * Math.sin(a), Z_FAR]);
  }
  for (let z = Z_NEAR; z > Z_FAR; z -= 6) {
    const flange = Math.round(z) % 24 === 0;
    L.ring(x, y, z, flange ? r * 1.4 : r, 12);
    if (flange) L.ring(x, y, z - 0.35, r * 1.4, 12);
  }
  for (let z = Z_NEAR - 3; z > Z_FAR; z -= 12) {
    L.seg([x - r, FLOOR, z], [x - r, y - r * 0.6, z]);
    L.seg([x + r, FLOOR, z], [x + r, y - r * 0.6, z]);
    L.seg([x - r - 0.3, y - r * 0.6, z], [x + r + 0.3, y - r * 0.6, z]);
  }
}

function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.25, "rgba(255,255,255,0.85)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const lineMat = (color: number, opacity: number, additive = false) =>
  new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });

function circleLoop(r: number, n: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push(new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), 0));
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

type Pulse = { a: number; side: number; z: number; speed: number };

export function createScene(canvas: HTMLCanvasElement, { reduced }: { reduced: boolean }): SceneApi | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  renderer.setClearColor(FOG, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(FOG, 0.0105);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 900);
  const dot = dotTexture();
  const accent = new THREE.Color(NEON);
  const accentTarget = new THREE.Color(NEON);
  const tinted: { color: THREE.Color }[] = [];

  // ── Magnetic-particle dust along the whole flight, with a constellation near the start
  const DUST = 260;
  const dustPos = new Float32Array(DUST * 3);
  const near: THREE.Vector3[] = [];
  for (let i = 0; i < DUST; i++) {
    const x = (Math.random() - 0.5) * 140;
    const y = FLOOR + 1 + Math.random() * 40;
    const z = Z_NEAR - Math.random() * (Z_NEAR - Z_FAR);
    // Keep the camera's corridor clear, or passing particles fill the screen as blurry blobs
    if (Math.abs(x) < 9 && y > -8 && y < 10) {
      i--;
      continue;
    }
    dustPos.set([x, y, z], i * 3);
    if (z > -70) near.push(new THREE.Vector3(x, y, z));
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({ color: NEON, size: 0.55, map: dot, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(dustGeo, dustMat));
  const web = new Lines();
  near.forEach((p, i) => {
    let links = 0;
    for (let j = i + 1; j < near.length && links < 3; j++) {
      if (p.distanceTo(near[j]) < 13) {
        web.seg([p.x, p.y, p.z], [near[j].x, near[j].y, near[j].z]);
        links++;
      }
    }
  });
  const webMat = lineMat(NEON, 0.16, true);
  scene.add(new THREE.LineSegments(web.geometry(), webMat));
  tinted.push(dustMat, webMat);

  // ── Derricks, alternating sides of the flight path
  const rigs = new Lines();
  for (let i = 0; i < 8; i++) {
    const side = i % 2 ? 1 : -1;
    derrick(rigs, side * (17 + (i % 3) * 3), FLOOR + 3, -38 - i * 25, i * 0.55 + (side > 0 ? Math.PI : 0), 28 + (i % 3) * 3);
  }
  const rigMat = lineMat(AZURE, 0.42);
  scene.add(new THREE.LineSegments(rigs.geometry(), rigMat));

  // ── Two pipelines on the ground, each with an inspection ring travelling ahead of the camera
  const pipes = new Lines();
  pipeline(pipes, -PIPE.x);
  pipeline(pipes, PIPE.x);
  const pipeMat = lineMat(NEON, 0.3, true);
  scene.add(new THREE.LineSegments(pipes.geometry(), pipeMat));
  const pigMat = lineMat(NEON, 0.9, true);
  const pigs = [-1, 1].map((side) => {
    const loop = new THREE.LineLoop(circleLoop(PIPE.r * 1.7, 32), pigMat);
    loop.position.set(side * PIPE.x, PIPE.y, 0);
    scene.add(loop);
    return loop;
  });
  tinted.push(pigMat);

  // ── Sonar rings beating near the hero visual
  const sonarMats = [0, 1, 2].map(() => lineMat(NEON, 0, true));
  const sonar = sonarMats.map((m) => {
    const loop = new THREE.LineLoop(circleLoop(1, 96), m);
    loop.position.set(13, 1, -8);
    scene.add(loop);
    return loop;
  });
  tinted.push(...sonarMats);

  // ── Scan mode: the camera inside a pipe, with a sweeping ring
  const tube = new Lines();
  for (let z = Z_NEAR - 5; z > Z_FAR; z -= 7) tube.ring(0, TUNNEL.y, z, TUNNEL.r, 28);
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2;
    tube.seg([TUNNEL.r * Math.cos(a), TUNNEL.y + TUNNEL.r * Math.sin(a), Z_NEAR - 5], [TUNNEL.r * Math.cos(a), TUNNEL.y + TUNNEL.r * Math.sin(a), Z_FAR]);
  }
  const tubeMat = lineMat(NEON, 0, true);
  scene.add(new THREE.LineSegments(tube.geometry(), tubeMat));
  const sweepMat = lineMat(NEON, 0, true);
  const sweep = new THREE.LineLoop(circleLoop(TUNNEL.r, 96), sweepMat);
  sweep.position.y = TUNNEL.y;
  scene.add(sweep);
  tinted.push(tubeMat, sweepMat);

  // ── Pulses: ultrasonic packets along the pipes (rigs) or the tunnel walls (scan)
  const makePulses = (n: number, size: number) => {
    const pos = new Float32Array(n * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    const mat = new THREE.PointsMaterial({ color: NEON, size, map: dot, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    scene.add(new THREE.Points(geo, mat));
    tinted.push(mat);
    const list: Pulse[] = Array.from({ length: n }, (_, i) => ({ a: 0, side: i % 2 ? 1 : -1, z: 0, speed: 0.6 + Math.random() * 0.9 }));
    return { pos, geo, mat, list };
  };
  const pipePulses = makePulses(reduced ? 0 : 28, 1.5);
  const tubePulses = makePulses(reduced ? 0 : 36, 1.7);

  // ── Floor grid, horizon glow and the A-scan trace on the horizon
  const grid = new THREE.GridHelper(720, 72, AZURE, 0x0b2a48);
  grid.position.set(0, FLOOR, -150);
  const gridMat = grid.material as THREE.Material;
  gridMat.transparent = true;
  gridMat.opacity = 0.2;
  gridMat.depthWrite = false;
  scene.add(grid);

  const glowMat = new THREE.MeshBasicMaterial({ color: NEON, transparent: true, opacity: 0.08, fog: false, depthWrite: false, blending: THREE.AdditiveBlending });
  const glow = new THREE.Mesh(new THREE.CircleGeometry(85, 64), glowMat);
  glow.position.set(0, 2, -430);
  scene.add(glow);
  tinted.push(glowMat);

  const TRACE = 320;
  const tracePos = new Float32Array(TRACE * 3);
  const traceNoise = Float32Array.from({ length: TRACE * 2 }, () => Math.random() - 0.5);
  const traceGeo = new THREE.BufferGeometry();
  traceGeo.setAttribute("position", new THREE.BufferAttribute(tracePos, 3).setUsage(THREE.DynamicDrawUsage));
  const traceMat = new THREE.LineBasicMaterial({ color: NEON, transparent: true, opacity: 0.6, fog: false, depthWrite: false, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Line(traceGeo, traceMat));
  tinted.push(traceMat);

  // ── State
  let progressTarget = 0;
  let progress = 0;
  let intensityTarget = 0.5;
  let intensity = 0.5;
  let modeTarget = 0;
  let modeBlend = 0;
  let paused = false;
  let hidden = document.hidden;
  let raf = 0;
  let last = performance.now();
  let time = 0;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  const resize = () => {
    const coarse = matchMedia("(pointer: coarse)").matches;
    renderer.setPixelRatio(coarse ? 1 : Math.min(window.devicePixelRatio, 1.25));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    if (reduced) frame(performance.now());
  };
  const onPointer = (e: PointerEvent) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
  };
  const onVisibility = () => {
    hidden = document.hidden;
    schedule();
  };

  const respawn = (p: Pulse, camZ: number, spread: number) => {
    p.z = camZ - 4 - Math.random() * spread;
    p.speed = 0.6 + Math.random() * 0.9;
  };
  pipePulses.list.forEach((p) => {
    p.a = Math.PI / 2 + (Math.random() - 0.5) * 1.6;
    respawn(p, FLIGHT[0].z, 120);
  });
  tubePulses.list.forEach((p) => {
    p.a = Math.random() * Math.PI * 2;
    respawn(p, FLIGHT[0].z, 120);
  });

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!reduced) time += dt;

    const k = (rate: number) => (reduced ? 1 : Math.min(1, rate * dt));
    progress += (progressTarget - progress) * k(4);
    intensity += (intensityTarget - intensity) * k(2.4);
    modeBlend += (modeTarget - modeBlend) * k(2.2);
    mouse.x += (mouse.tx - mouse.x) * k(3);
    mouse.y += (mouse.ty - mouse.y) * k(3);
    accent.lerp(accentTarget, k(3));
    for (const m of tinted) m.color.copy(accent);

    const I = 0.3 + 0.7 * intensity;
    const rigsOn = 1 - modeBlend;

    // Camera
    const f = flight(progress);
    const sway = reduced ? 0 : 0.4 * Math.sin(time * 0.4);
    camera.position.set(f.x + mouse.x * 4, f.y + mouse.y * 2.4 + sway, f.z);
    camera.lookAt(mouse.x * 2, f.y - 1 + mouse.y * 1.5, f.z - 40);
    const camZ = f.z;

    // Layers
    dustMat.opacity = 0.6 * I;
    dustMat.size = 0.5 + 0.25 * intensity;
    webMat.opacity = 0.17 * I * rigsOn;
    rigMat.opacity = 0.44 * (0.6 + 0.4 * I) * rigsOn;
    pipeMat.opacity = 0.3 * (0.6 + 0.4 * I) * rigsOn;
    gridMat.opacity = (0.14 + 0.1 * I) * (0.4 + 0.6 * rigsOn);
    glowMat.opacity = 0.05 + 0.06 * I;
    tubeMat.opacity = 0.2 * (0.6 + 0.4 * I) * modeBlend;

    // Inspection rings on the pipes ("pigs"), always a little ahead of the camera
    pigs.forEach((pig, i) => {
      const phase = ((time * 0.16 + i * 0.5) % 1 + 1) % 1;
      pig.position.z = camZ - 10 - phase * 70;
      pigMat.opacity = 0.85 * I * rigsOn;
    });

    // Sonar: three rings expanding in turn
    sonar.forEach((ring, i) => {
      const ph = reduced ? 0.35 + i * 0.2 : ((time / 4.8 + i / 3) % 1 + 1) % 1;
      ring.scale.setScalar(1 + ph * 15);
      sonarMats[i].opacity = Math.pow(1 - ph, 1.6) * 0.55 * I * rigsOn;
    });

    // Sweep ring in the tunnel
    const sw = ((time * 0.25) % 1 + 1) % 1;
    sweep.position.z = camZ - 8 - sw * 90;
    sweepMat.opacity = 0.9 * modeBlend * (1 - sw * 0.7);

    // Pulses
    const speed = (0.4 + 1.6 * intensity) * 14 * dt;
    pipePulses.list.forEach((p, i) => {
      p.z -= p.speed * speed;
      if (p.z < camZ - 150 || p.z > camZ + 2) respawn(p, camZ, 30);
      pipePulses.pos.set([p.side * PIPE.x + PIPE.r * Math.cos(p.a), PIPE.y + PIPE.r * Math.sin(p.a), p.z], i * 3);
    });
    pipePulses.geo.attributes.position.needsUpdate = true;
    pipePulses.mat.opacity = 0.95 * rigsOn;
    tubePulses.list.forEach((p, i) => {
      p.z -= p.speed * speed * 1.4;
      if (p.z < camZ - 150 || p.z > camZ + 2) respawn(p, camZ, 30);
      tubePulses.pos.set([TUNNEL.r * Math.cos(p.a), TUNNEL.y + TUNNEL.r * Math.sin(p.a), p.z], i * 3);
    });
    tubePulses.geo.attributes.position.needsUpdate = true;
    tubePulses.mat.opacity = 0.95 * modeBlend;

    // A-scan: main bang, a flaw echo that drifts and the back-wall echo, revealed left to right
    const shift = Math.floor(time * 30);
    const flaw = 0.47 + 0.04 * Math.sin(time * 0.35);
    for (let i = 0; i < TRACE; i++) {
      const s = i / (TRACE - 1);
      const n = traceNoise[(i + shift) % traceNoise.length] * 0.5;
      const spikes = 11 * gauss(s, 0.07, 0.012) + 4 * gauss(s, flaw, 0.008) + 7 * gauss(s, 0.83, 0.009);
      tracePos.set([-115 + 230 * s, FLOOR + 12 + n + spikes * Math.abs(Math.sin(s * 900)), -405], i * 3);
    }
    traceGeo.attributes.position.needsUpdate = true;
    traceGeo.setDrawRange(0, reduced ? TRACE : Math.floor(TRACE * Math.min(1, ((time / 3.4) % 1.25))));
    traceMat.opacity = 0.35 + 0.4 * I;

    renderer.render(scene, camera);
  }

  function loop(now: number) {
    raf = 0;
    if (paused || hidden) return;
    frame(now);
    if (!reduced) raf = requestAnimationFrame(loop);
  }
  function schedule() {
    if (!raf && !paused && !hidden) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  }

  resize();
  window.addEventListener("resize", resize);
  if (!reduced) window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  progress = progressTarget;
  frame(performance.now());
  schedule();

  return {
    setProgress(p) {
      progressTarget = clamp01(p);
      if (reduced) schedule();
    },
    setMode(mode) {
      modeTarget = mode === "scan" ? 1 : 0;
      schedule();
    },
    setIntensity(i) {
      intensityTarget = clamp01(i);
      schedule();
    },
    setAccent(hex) {
      accentTarget.set(hex);
      schedule();
    },
    setPaused(p) {
      paused = p;
      schedule();
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((o) => {
        const obj = o as THREE.Mesh;
        obj.geometry?.dispose();
        const m = obj.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(m) ? m : m ? [m] : []).forEach((x) => x.dispose());
      });
      dot.dispose();
      renderer.dispose();
    },
  };
}
