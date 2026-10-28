"use client";

import { motion } from "motion/react";
import { useId } from "react";

// Ultrasonic A-scan: initial pulse, a small flaw echo and the back-wall echo.
const A_SCAN =
  "M0 52 L18 52 L22 8 L26 60 L30 30 L34 52 L92 52 L95 38 L98 56 L101 46 L104 52 L168 52 L172 14 L176 60 L180 26 L184 52 L240 52";

export function Waveform({ className, color = "#0aa6e6", gate = true }: { className?: string; color?: string; gate?: boolean }) {
  const id = useId();
  return (
    <svg viewBox="0 0 240 64" className={className} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`fade-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.2" />
          <stop offset="0.5" stopColor={color} stopOpacity="1" />
          <stop offset="1" stopColor={color} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {[16, 32, 48].map((y) => (
        <line key={y} x1="0" x2="240" y1={y} y2={y} stroke="currentColor" strokeOpacity="0.08" />
      ))}
      {gate && (
        <motion.rect
          y="6"
          height="52"
          width="22"
          rx="3"
          fill={color}
          fillOpacity="0.1"
          stroke={color}
          strokeOpacity="0.5"
          strokeDasharray="3 3"
          animate={{ x: [150, 166, 150] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <motion.path
        d={A_SCAN}
        fill="none"
        stroke={`url(#fade-${id})`}
        strokeWidth="2.2"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0.35] }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 0.4, ease: "easeInOut" }}
      />
    </svg>
  );
}
