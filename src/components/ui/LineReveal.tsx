"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";

/** One line of a headline that slides up out of a mask on load. */
export function LineReveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className={cn("block", className)}
        initial={{ y: "105%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.95, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Highlighter stroke that sweeps in under a word after the headline lands. */
export function Underline({ delay = 0.9, className }: { delay?: number; className?: string }) {
  return (
    <motion.span
      aria-hidden
      className={cn("absolute -bottom-[0.02em] left-0 -z-10 h-[0.26em] w-full origin-left rounded-full bg-lime/75", className)}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
