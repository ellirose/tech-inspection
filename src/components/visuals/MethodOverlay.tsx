"use client";

import { motion } from "motion/react";
import type { MethodKey } from "@/content/methods";
import { Waveform } from "./Waveform";

const loop = { repeat: Infinity, repeatDelay: 1.2 } as const;
// Jagged fatigue-crack path with a short branch, shared by the MT and PT overlays.
const CRACK = "M62 214 L92 206 L108 219 L131 201 L152 212 L171 196 L197 207 L214 188 L238 199 L259 183 L281 197 L303 191 L322 207 L347 196 L368 203";
const BRANCH = "M238 199 L246 214 L241 231 L250 246";

/** Animated, method-specific annotations drawn over a field photo. */
export function MethodOverlay({ method }: { method: MethodKey }) {
  if (method === "mt") {
    return (
      <svg viewBox="0 0 430 400" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <filter id="mt-glow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[120, 160, 250, 290].map((y, i) => (
          <motion.path
            key={y}
            d={`M20 ${y} C 140 ${y - 40}, 290 ${y + 40}, 410 ${y}`}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.45"
            strokeWidth="1.4"
            strokeDasharray="4 8"
            animate={{ strokeDashoffset: [0, -48] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
          />
        ))}
        <motion.path
          d={CRACK}
          fill="none"
          stroke="#b6ff5c"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#mt-glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 1] }}
          transition={{ duration: 3, ease: "easeInOut", ...loop }}
        />
        <motion.path
          d={BRANCH}
          fill="none"
          stroke="#b6ff5c"
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#mt-glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 0, 1, 1] }}
          transition={{ duration: 3, ease: "easeInOut", times: [0, 0.5, 0.8, 1], ...loop }}
        />
        <motion.circle cx="215" cy="190" r="70" fill="none" stroke="#b6ff5c" strokeWidth="2" strokeDasharray="6 6" animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }} style={{ originX: "215px", originY: "190px" }} />
      </svg>
    );
  }

  if (method === "pt") {
    return (
      <svg viewBox="0 0 430 400" className="absolute inset-0 size-full" aria-hidden="true">
        <motion.path d={CRACK} fill="none" stroke="#ff2d4a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }} transition={{ duration: 2.4, ease: "easeInOut", ...loop }} />
        <motion.path d={BRANCH} fill="none" stroke="#ff2d4a" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 0, 1, 1] }} transition={{ duration: 2.4, times: [0, 0.5, 0.85, 1], ...loop }} />
        {[
          [108, 219],
          [171, 196],
          [238, 199],
          [303, 191],
          [347, 196],
        ].map(([cx, cy], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            fill="#ff2d4a"
            initial={{ r: 0, opacity: 0.75 }}
            animate={{ r: [0, 16, 22], opacity: [0.75, 0.35, 0] }}
            transition={{ duration: 2.6, delay: 0.6 + i * 0.25, repeat: Infinity, repeatDelay: 1 }}
          />
        ))}
        <motion.g animate={{ y: [0, 14, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M215 64 C 215 64, 196 92, 196 104 a19 19 0 0 0 38 0 C 234 92, 215 64, 215 64Z" fill="#ff2d4a" fillOpacity="0.92" />
          <ellipse cx="208" cy="100" rx="4" ry="7" fill="#fff" fillOpacity="0.5" />
        </motion.g>
      </svg>
    );
  }

  if (method === "ut") {
    return (
      <div className="absolute inset-x-[7%] bottom-[8%] rounded-2xl bg-brand-900/55 p-4 text-white ring-1 ring-white/25 backdrop-blur-md">
        <div className="flex items-center justify-between font-mono text-[0.7rem] font-bold tracking-widest">
          <span className="text-ut">A-SCAN · 5 MHz · 0°</span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 animate-pulse rounded-full bg-ut" /> GATE A
          </span>
        </div>
        <Waveform className="mt-2 h-20 w-full text-white" color="#5fd4ff" />
        <div className="mt-1 flex justify-between font-mono text-xs text-white/70">
          <span>0.0</span>
          <span className="font-display text-xl font-bold text-white">t = 12.70 mm</span>
          <span>25.0</span>
        </div>
      </div>
    );
  }

  return (
    <svg viewBox="0 0 430 400" className="absolute inset-0 size-full" aria-hidden="true">
      <g stroke="#ffb53d" strokeWidth="2" fill="none">
        <motion.path d="M80 300 H350" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }} transition={{ duration: 1.8, ...loop }} />
        <path d="M80 286 V314 M350 286 V314" />
        <motion.path d="M372 90 V270" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }} transition={{ duration: 1.8, delay: 0.4, ...loop }} />
        <path d="M358 90 H386 M358 270 H386" />
        <circle cx="215" cy="180" r="44" strokeDasharray="5 6" />
        <path d="M215 120 V240 M155 180 H275" strokeOpacity="0.6" />
      </g>
      <g className="font-mono" fontWeight="700" fontSize="15" fill="#fff">
        <rect x="160" y="312" width="110" height="28" rx="8" fill="#f29a0b" />
        <text x="215" y="331" textAnchor="middle">Ø 127.00 mm</text>
        <rect x="300" y="166" width="66" height="28" rx="8" fill="#f29a0b" />
        <text x="333" y="185" textAnchor="middle">±0.05</text>
      </g>
    </svg>
  );
}
