import * as THREE from "three";
import type { SceneMode } from "@/lib/scene";

/**
 * The inspection yard behind the site, drawn in code from what Tech-Inspection inspects. As the page
 * scrolls the camera moves down a yard of drill pipe racked in pyramids (tool joints, threaded pins),
 * where EMI inspection rings run along the joints carrying ultrasonic pulses. PDC drill bits turn at
 * points along the way, a magnetic flux field shows the leakage at a crack (how MT finds it), a sonar
 * ring beats near the hero and an A-scan trace sweeps across the far end. In `scan` mode the yard fades
 * and the camera is inside a pipe bore being inspected, tinted by the section's accent.
 *
 * Loaded on demand by SceneBackground (desktop, WebGL only).
 */

const FOG = 0x030a12;
const AZURE = 0x3a98f0;
const NEON = 0x1fc8f5;
const FLOOR = -14;
const PIPE = { r: 0.55, joint: 0.78, length: 26, gap: 1.6 };
const RACK = { x: 12, y: FLOOR + 2.2, spacing: 1.7 };
const TUNNEL = { y: -1, r: 12 };
const Z_NEAR = 30;
const Z_FAR = -345;

// Camera path, keyed by page scroll progress
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
const TAU = Math.PI * 2;

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
  path(points: number[][]) {
    for (let i = 0; i < points.length - 1; i++) this.seg(points[i], points[i + 1]);
  }
  /** Circle around the z axis at (cx, cy, z). */
  ring(cx: number, cy: number, z: number, r: number, n: number) {
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * TAU;
      const a1 = ((i + 1) / n) * TAU;
      this.seg([cx + r * Math.cos(a0), cy + r * Math.sin(a0), z], [cx + r * Math.cos(a1), cy + r * Math.sin(a1), z]);
    }
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.v, 3));
    return g;
  }
}

/** One drill pipe joint lying along z: box tool joint toward the camera, pipe body, pin tool joint and threaded pin. */
function pipeJoint(L: Lines, x: number, y: number, z0: number, z1: number) {
  const { r, joint: R } = PIPE;
  const at = (rad: number, a: number, z: number) => [x + rad * Math.cos(a), y + rad * Math.sin(a), z];
  const sides = 6;
  // Box end
  L.ring(x, y, z0, R, 12);
  L.ring(x, y, z0 - 1.6, R, 12);
  for (let k = 0; k < sides; k++) {
    const a = (k / sides) * TAU;
    L.seg(at(R, a, z0), at(R, a, z0 - 1.6));
    L.seg(at(R, a, z0 - 1.6), at(r, a, z0 - 2));
  }
  // Body
  for (let k = 0; k < sides; k++) {
    const a = (k / sides) * TAU;
    L.seg(at(r, a, z0 - 2), at(r, a, z1 + 2.3));
  }
  for (let z = z0 - 6; z > z1 + 3; z -= 5) L.ring(x, y, z, r, 10);
  // Pin tool joint
  L.ring(x, y, z1 + 2, R, 12);
  L.ring(x, y, z1 + 0.9, R, 12);
  for (let k = 0; k < sides; k++) {
    const a = (k / sides) * TAU;
    L.seg(at(r, a, z1 + 2.3), at(R, a, z1 + 2));
    L.seg(at(R, a, z1 + 2), at(R, a, z1 + 0.9));
  }
  // Tapered thread: a helix narrowing to the pin nose
  const turns = 5;
  const steps = turns * 10;
  const helix: number[][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    helix.push(at(lerp(0.64, 0.44, t), t * turns * TAU, lerp(z1 + 0.9, z1, t)));
  }
  L.path(helix);
}

/** Pipe rack on one side of the path: sawhorse supports and drill pipe stacked 3-2-1. Returns the lanes (pipe centres). */
function pipeRack(L: Lines, cx: number) {
  const { r } = PIPE;
  const s = RACK.spacing;
  const rise = s * Math.sin(Math.PI / 3);
  const y0 = RACK.y + r;
  const lanes = [
    ...[-s, 0, s].map((dx) => ({ x: cx + dx, y: y0 })),
    ...[-s / 2, s / 2].map((dx) => ({ x: cx + dx, y: y0 + rise })),
    { x: cx, y: y0 + 2 * rise },
  ];
  for (let z = Z_NEAR - 4; z > Z_FAR; z -= 13) {
    L.seg([cx - 3, RACK.y, z], [cx + 3, RACK.y, z]);
    L.seg([cx - 3, RACK.y, z], [cx - 3.6, FLOOR, z]);
    L.seg([cx + 3, RACK.y, z], [cx + 3.6, FLOOR, z]);
    L.seg([cx - 3.3, FLOOR + 1.1, z], [cx + 3.3, FLOOR + 1.1, z]);
  }
  lanes.forEach((lane, i) => {
    // Joints laid end to end, staggered per lane like a real stack
    for (let z0 = Z_NEAR - ((i * 7) % 13); z0 - PIPE.length > Z_FAR; z0 -= PIPE.length + PIPE.gap) pipeJoint(L, lane.x, lane.y, z0, z0 - PIPE.length);
  });
  return lanes;
}

/** A PDC drill bit, axis along +z (cutting face toward +z): threaded pin, body with gauge pads, blades and cutters. */
function pdcBit(L: Lines, blades = 6) {
  const body = 4;
  const face = (rad: number) => 1.5 * (1 - (rad / body) ** 2) + 0.2;
  // Pin with thread, shoulder
  const helix: number[][] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const rad = lerp(1.5, 2.1, t);
    helix.push([rad * Math.cos(t * 6 * TAU), rad * Math.sin(t * 6 * TAU), lerp(-7, -4, t)]);
  }
  L.path(helix);
  L.ring(0, 0, -7, 1.5, 20);
  L.ring(0, 0, -4, 2.1, 20);
  L.ring(0, 0, -4, 3, 24);
  L.ring(0, 0, -3.4, 3, 24);
  // Body and gauge
  for (const z of [-3.4, -1.7, 0]) L.ring(0, 0, z, body, 36);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * TAU;
    L.seg([3 * Math.cos(a), 3 * Math.sin(a), -3.4], [body * Math.cos(a), body * Math.sin(a), -3.4]);
  }
  // Blades sweeping from the nose to the gauge, with cutters along their edge
  for (let b = 0; b < blades; b++) {
    const a0 = (b / blades) * TAU;
    const edge: number[][] = [];
    const root: number[][] = [];
    const angleAt = (rad: number) => a0 + 0.55 * (rad / body);
    for (let i = 0; i <= 12; i++) {
      const rad = lerp(0.5, body, i / 12);
      const a = angleAt(rad);
      edge.push([rad * Math.cos(a), rad * Math.sin(a), face(rad) + 0.55]);
      root.push([rad * Math.cos(a), rad * Math.sin(a), face(rad) - 0.1]);
    }
    L.path(edge);
    L.path(root);
    L.seg(root[root.length - 1], [body * Math.cos(angleAt(body)), body * Math.sin(angleAt(body)), -1.7]);
    L.seg(edge[edge.length - 1], [body * Math.cos(angleAt(body)), body * Math.sin(angleAt(body)), -1.7]);
    // Cutters: small discs facing the direction of rotation
    for (const rad of [1.1, 1.7, 2.3, 2.9, 3.5]) {
      const a = angleAt(rad);
      const u = [Math.cos(a), Math.sin(a), 0];
      const c = [rad * Math.cos(a), rad * Math.sin(a), face(rad) + 0.55];
      const disc: number[][] = [];
      for (let i = 0; i <= 10; i++) {
        const t = (i / 10) * TAU;
        disc.push([c[0] + 0.28 * Math.cos(t) * u[0], c[1] + 0.28 * Math.cos(t) * u[1], c[2] + 0.28 * Math.sin(t)]);
      }
      L.path(disc);
    }
  }
  // Nozzles between blades
  for (let b = 0; b < blades; b++) {
    const a = ((b + 0.5) / blades) * TAU + 0.3;
    const p = [1.9 * Math.cos(a), 1.9 * Math.sin(a), face(1.9)];
    L.ring(p[0], p[1], p[2], 0.3, 10);
  }
}

/** Magnetic flux from a yoke through a steel plate, with the leakage field that bulges out at a crack. */
function fluxField(L: Lines, routes: number[][][]) {
  const arc = (a: number, h: number, dy = 0) => {
    const pts: number[][] = [];
    for (let i = 0; i <= 28; i++) {
      const t = Math.PI - (i / 28) * Math.PI;
      pts.push([a * Math.cos(t), dy + h * Math.sin(t), 0]);
    }
    return pts;
  };
  // Plate surface and the crack in it
  L.seg([-16, 0, 0], [16, 0, 0]);
  L.seg([-16, -0.8, 0], [16, -0.8, 0]);
  L.path([
    [-0.2, 0, 0],
    [0.15, -0.3, 0],
    [-0.1, -0.55, 0],
    [0.1, -0.8, 0],
  ]);
  // Yoke legs
  for (const x of [-12, 12]) L.path([[x - 0.8, 0, 0], [x - 0.8, 3, 0], [x + 0.8, 3, 0], [x + 0.8, 0, 0]]);
  for (let a = 3; a <= 12; a += 1.5) {
    const pts = arc(a, 0.45 * a);
    L.path(pts);
    routes.push(pts);
  }
  // Leakage at the crack: tight loops that only appear where the field is interrupted
  for (const a of [0.5, 0.85, 1.25, 1.7]) {
    const pts = arc(a, 1.3 * a);
    L.path(pts);
    routes.push(pts);
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
    const a = (i / n) * TAU;
    pts.push(new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), 0));
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

type Pulse = { lane: number; a: number; z: number; speed: number };

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

  // ── Magnetic particles drifting in the air, kept out of the camera's corridor
  const DUST = 220;
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    const x = (Math.random() - 0.5) * 140;
    const y = FLOOR + 1 + Math.random() * 40;
    const z = Z_NEAR - Math.random() * (Z_NEAR - Z_FAR);
    if (Math.abs(x) < 9 && y > -8 && y < 10) {
      i--;
      continue;
    }
    dustPos.set([x, y, z], i * 3);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({ color: NEON, size: 0.5, map: dot, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(dustGeo, dustMat));
  tinted.push(dustMat);

  // ── The pipe yard: a rack of drill pipe on each side of the path
  const yard = new Lines();
  const lanes = [...pipeRack(yard, -RACK.x), ...pipeRack(yard, RACK.x)];
  const yardMat = lineMat(AZURE, 0.4);
  scene.add(new THREE.LineSegments(yard.geometry(), yardMat));

  // EMI inspection rings running along a few joints, ahead of the camera
  const emiMat = lineMat(NEON, 0.9, true);
  const emiLanes = [1, 5, 7, 9];
  const emi = emiLanes.map((lane) => {
    const loop = new THREE.LineLoop(circleLoop(PIPE.joint * 1.5, 32), emiMat);
    loop.position.set(lanes[lane].x, lanes[lane].y, 0);
    scene.add(loop);
    return loop;
  });
  tinted.push(emiMat);

  // ── PDC drill bits turning along the way (tilted toward the path)
  const bitLines = new Lines();
  pdcBit(bitLines);
  const bitGeo = bitLines.geometry();
  const bitMat = lineMat(AZURE, 0.55, true);
  const bits = [
    // Between the heading and the visual on the first screen, then alternating sides further down.
    // Cutting faces turned mostly toward the camera, so blades and cutters read at a glance.
    { pos: [2, 9, -28], tilt: [0.3, -0.22, 0], scale: 1.7 },
    { pos: [-12, 5, -104], tilt: [0.25, 0.35, 0], scale: 2.1 },
    { pos: [12, 4, -188], tilt: [0.2, -0.32, 0], scale: 2.2 },
  ].map(({ pos, tilt, scale }) => {
    const holder = new THREE.Group();
    holder.position.set(pos[0], pos[1], pos[2]);
    holder.rotation.set(tilt[0], tilt[1], tilt[2]);
    holder.scale.setScalar(scale);
    const bit = new THREE.LineSegments(bitGeo, bitMat);
    holder.add(bit);
    scene.add(holder);
    return bit;
  });

  // ── Magnetic flux and the leakage at a crack, low in front of the first screen
  const fluxLines = new Lines();
  const fluxRoutes: number[][][] = [];
  fluxField(fluxLines, fluxRoutes);
  const flux = new THREE.Group();
  flux.position.set(0, FLOOR + 2.4, -16);
  flux.scale.setScalar(1.35);
  const fluxMat = lineMat(NEON, 0.3, true);
  flux.add(new THREE.LineSegments(fluxLines.geometry(), fluxMat));
  scene.add(flux);
  tinted.push(fluxMat);

  // ── Sonar rings beating near the hero visual (ultrasonic testing)
  const sonarMats = [0, 1, 2].map(() => lineMat(NEON, 0, true));
  const sonar = sonarMats.map((m) => {
    const loop = new THREE.LineLoop(circleLoop(1, 96), m);
    loop.position.set(13, 1, -8);
    scene.add(loop);
    return loop;
  });
  tinted.push(...sonarMats);

  // ── Scan mode: inside a pipe bore, with a sweeping inspection ring
  const tube = new Lines();
  for (let z = Z_NEAR - 5; z > Z_FAR; z -= 7) tube.ring(0, TUNNEL.y, z, TUNNEL.r, 28);
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * TAU;
    tube.seg([TUNNEL.r * Math.cos(a), TUNNEL.y + TUNNEL.r * Math.sin(a), Z_NEAR - 5], [TUNNEL.r * Math.cos(a), TUNNEL.y + TUNNEL.r * Math.sin(a), Z_FAR]);
  }
  const tubeMat = lineMat(NEON, 0, true);
  scene.add(new THREE.LineSegments(tube.geometry(), tubeMat));
  const sweepMat = lineMat(NEON, 0, true);
  const sweep = new THREE.LineLoop(circleLoop(TUNNEL.r, 96), sweepMat);
  sweep.position.y = TUNNEL.y;
  scene.add(sweep);
  tinted.push(tubeMat, sweepMat);

  // ── Pulses: ultrasonic packets along the pipe joints (yard), the bore walls (scan) and particles along the flux lines
  const makePoints = (n: number, size: number) => {
    const pos = new Float32Array(Math.max(1, n) * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setDrawRange(0, n);
    const mat = new THREE.PointsMaterial({ color: NEON, size, map: dot, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    return { pos, geo, mat, points: new THREE.Points(geo, mat) };
  };
  const pipePulses = { ...makePoints(reduced ? 0 : 30, 1.3), list: [] as Pulse[] };
  const tubePulses = { ...makePoints(reduced ? 0 : 36, 1.7), list: [] as Pulse[] };
  const fluxDots = { ...makePoints(reduced ? 0 : 40, 0.9), list: [] as { route: number; t: number; speed: number }[] };
  scene.add(pipePulses.points, tubePulses.points);
  flux.add(fluxDots.points);
  tinted.push(pipePulses.mat, tubePulses.mat, fluxDots.mat);

  // ── Floor grid and the A-scan trace at the far end
  const grid = new THREE.GridHelper(720, 72, AZURE, 0x0b2a48);
  grid.position.set(0, FLOOR, -150);
  const gridMat = grid.material as THREE.Material;
  gridMat.transparent = true;
  gridMat.opacity = 0.18;
  gridMat.depthWrite = false;
  scene.add(grid);

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
  for (let i = 0; i < pipePulses.geo.drawRange.count; i++) {
    const p: Pulse = { lane: Math.floor(Math.random() * lanes.length), a: Math.PI / 2 + (Math.random() - 0.5) * 1.4, z: 0, speed: 1 };
    respawn(p, FLIGHT[0].z, 120);
    pipePulses.list.push(p);
  }
  for (let i = 0; i < tubePulses.geo.drawRange.count; i++) {
    const p: Pulse = { lane: 0, a: Math.random() * TAU, z: 0, speed: 1 };
    respawn(p, FLIGHT[0].z, 120);
    tubePulses.list.push(p);
  }
  for (let i = 0; i < fluxDots.geo.drawRange.count; i++) fluxDots.list.push({ route: i % fluxRoutes.length, t: Math.random(), speed: 0.08 + Math.random() * 0.1 });

  function frame(now: number) {
    // rAF's timestamp can precede the performance.now() taken when the loop was scheduled
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
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
    const yardOn = 1 - modeBlend;

    // Camera
    const f = flight(progress);
    const sway = reduced ? 0 : 0.4 * Math.sin(time * 0.4);
    camera.position.set(f.x + mouse.x * 4, f.y + mouse.y * 2.4 + sway, f.z);
    camera.lookAt(mouse.x * 2, f.y - 1 + mouse.y * 1.5, f.z - 40);
    const camZ = f.z;

    // Layers
    dustMat.opacity = 0.5 * I;
    yardMat.opacity = 0.42 * (0.6 + 0.4 * I) * yardOn;
    bitMat.opacity = 0.5 * (0.6 + 0.4 * I) * yardOn;
    fluxMat.opacity = 0.32 * I * yardOn;
    gridMat.opacity = (0.12 + 0.1 * I) * (0.4 + 0.6 * yardOn);
    tubeMat.opacity = 0.2 * (0.6 + 0.4 * I) * modeBlend;

    // Bits turn slowly
    bits.forEach((bit, i) => (bit.rotation.z = time * (0.18 + i * 0.04)));

    // EMI rings, always a little ahead of the camera
    emi.forEach((ring, i) => {
      const phase = ((time * 0.14 + i * 0.27) % 1 + 1) % 1;
      ring.position.z = camZ - 10 - phase * 80;
    });
    emiMat.opacity = 0.85 * I * yardOn;

    // Sonar: three rings expanding in turn
    sonar.forEach((ring, i) => {
      const ph = reduced ? 0.35 + i * 0.2 : ((time / 4.8 + i / 3) % 1 + 1) % 1;
      ring.scale.setScalar(1 + ph * 15);
      sonarMats[i].opacity = Math.pow(1 - ph, 1.6) * 0.5 * I * yardOn;
    });

    // Sweep ring in the bore
    const sw = ((time * 0.25) % 1 + 1) % 1;
    sweep.position.z = camZ - 8 - sw * 90;
    sweepMat.opacity = 0.9 * modeBlend * (1 - sw * 0.7);

    // Pulses
    const speed = (0.4 + 1.6 * intensity) * 14 * dt;
    pipePulses.list.forEach((p, i) => {
      p.z -= p.speed * speed;
      if (p.z < camZ - 150 || p.z > camZ + 2) respawn(p, camZ, 30);
      const lane = lanes[p.lane];
      pipePulses.pos.set([lane.x + PIPE.r * Math.cos(p.a), lane.y + PIPE.r * Math.sin(p.a), p.z], i * 3);
    });
    pipePulses.geo.attributes.position.needsUpdate = true;
    pipePulses.mat.opacity = 0.95 * yardOn;
    tubePulses.list.forEach((p, i) => {
      p.z -= p.speed * speed * 1.4;
      if (p.z < camZ - 150 || p.z > camZ + 2) respawn(p, camZ, 30);
      tubePulses.pos.set([TUNNEL.r * Math.cos(p.a), TUNNEL.y + TUNNEL.r * Math.sin(p.a), p.z], i * 3);
    });
    tubePulses.geo.attributes.position.needsUpdate = true;
    tubePulses.mat.opacity = 0.95 * modeBlend;
    fluxDots.list.forEach((d, i) => {
      d.t = (d.t + d.speed * dt * (0.5 + intensity)) % 1;
      const route = fluxRoutes[d.route];
      const x = d.t * (route.length - 1);
      const a = route[Math.floor(x)];
      const b = route[Math.min(route.length - 1, Math.floor(x) + 1)];
      const u = x - Math.floor(x);
      fluxDots.pos.set([lerp(a[0], b[0], u), lerp(a[1], b[1], u), 0], i * 3);
    });
    fluxDots.geo.attributes.position.needsUpdate = true;
    fluxDots.mat.opacity = 0.9 * I * yardOn;

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
