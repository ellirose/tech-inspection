"use client";

import { motion } from "motion/react";
import { WhatsappLogo } from "@phosphor-icons/react/ssr";
import { Assistant, type AssistantProps } from "@/components/chat/Assistant";

/** Bottom-right stack: WhatsApp shortcut above the guided assistant. */
export function FloatingActions({ assistant, whatsappLabel }: { assistant: AssistantProps; whatsappLabel: string }) {
  return (
    <div className="fixed bottom-5 right-4 z-[55] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <motion.a
        href={`https://wa.me/${assistant.whatsapp}?text=${encodeURIComponent(assistant.waIntro)}`}
        target="_blank"
        rel="noopener"
        aria-label={whatsappLabel}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.08 }}
        className="group relative flex h-14 items-center gap-2 rounded-full bg-whatsapp px-3.5 text-white shadow-float"
      >
        <WhatsappLogo weight="fill" className="size-7" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-[0.95rem] font-medium transition-all duration-500 group-hover:max-w-56 group-hover:pr-1">
          {whatsappLabel}
        </span>
      </motion.a>
      <Assistant {...assistant} />
    </div>
  );
}
