"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChatCircleDots, Sparkle, X } from "@phosphor-icons/react/ssr";

/** Round button that opens and closes the chat panel; shared by the guided and the AI assistant. */
export function ChatLauncher({ open, onClick, label }: { open: boolean; onClick: () => void; label: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={open}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      className="relative grid size-14 place-items-center rounded-full bg-brand-600 text-white shadow-float ring-4 ring-surface sm:size-16"
    >
      <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-full bg-neon/35" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={open ? "x" : "chat"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
          {open ? <X weight="bold" className="size-7" /> : <ChatCircleDots weight="light" className="size-7" />}
        </motion.span>
      </AnimatePresence>
      {!open && <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-lime text-[#071a2e] ring-2 ring-surface"><Sparkle weight="fill" className="size-3" /></span>}
    </motion.button>
  );
}
