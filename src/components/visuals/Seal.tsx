import { useId } from "react";
import { cn } from "@/lib/cn";

/** Circular text seal (ring text on a path) around a short code; the ring can spin slowly. */
export function Seal({ ring, code, className, spin = false }: { ring: string; code: string; className?: string; spin?: boolean }) {
  const id = useId();
  return (
    <div className={cn("relative aspect-square", className)}>
      <svg viewBox="0 0 200 200" className={cn("absolute inset-0 size-full", spin && "animate-spin-slow motion-reduce:animate-none")} aria-hidden="true">
        <defs>
          <path id={`ring-${id}`} d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        <circle cx="100" cy="100" r="96" fill="none" stroke="var(--color-neon)" strokeOpacity="0.45" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="88" fill="none" stroke="var(--color-lime)" strokeOpacity="0.8" strokeWidth="1.2" strokeDasharray="2 5" />
        <text className="fill-ink font-mono" fontSize="12.5" fontWeight="700">
          {/* Repeat to fill the ring, then justify so the text closes neatly on itself. */}
          <textPath href={`#ring-${id}`} textLength="460" lengthAdjust="spacing">
            {ring.repeat(Math.max(1, Math.floor(44 / ring.length)))}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[25%] grid place-items-center rounded-full bg-brand-600 text-white shadow-[0_10px_24px_-8px_rgb(10_100_191/0.7)] dark:bg-neon dark:text-[#071a2e]">
        <span className="px-1 text-center text-[clamp(0.85rem,1.6vw,1.25rem)] font-extrabold leading-none tracking-tight">{code}</span>
      </div>
    </div>
  );
}
