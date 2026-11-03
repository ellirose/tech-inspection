import { statusLabels } from "@/lib/leads/admin";
import { cn } from "@/lib/cn";

const tones: Record<keyof typeof statusLabels, string> = {
  new: "bg-brand-600 text-white dark:bg-neon dark:text-[#071a2e]",
  contacted: "bg-tint text-accent-ink",
  quoted: "bg-vt/20 text-[#8a5a00] dark:text-vt",
  won: "bg-lime/20 text-lime-deep dark:text-lime",
  lost: "bg-surface-2 text-mute",
};

export function StatusBadge({ status }: { status: keyof typeof statusLabels }) {
  return <span className={cn("inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold", tones[status])}>{statusLabels[status]}</span>;
}
