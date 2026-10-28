import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Generic text seal used in place of official certification marks until each
 * brand-usage manual is available. Ring text is set on a circular path.
 */
export function Seal({ ring, code, className, spin = false, tone = "brand" }: { ring: string; code: string; className?: string; spin?: boolean; tone?: "brand" | "mt" }) {
  const id = useId();
  const accent = tone === "mt" ? "#6fd11c" : "#3a44de";
  return (
    <div className={cn("relative aspect-square", className)}>
      <svg viewBox="0 0 200 200" className={cn("absolute inset-0 size-full", spin && "animate-spin-slow")} aria-hidden="true">
        <defs>
          <path id={`ring-${id}`} d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        <circle cx="100" cy="100" r="96" fill="none" stroke="#030a8c" strokeOpacity="0.14" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="88" fill="none" stroke={accent} strokeOpacity="0.55" strokeWidth="1" strokeDasharray="2 5" />
        <text className="fill-brand-700 font-mono" fontSize="12" fontWeight="700">
          {/* Repeat to fill the ring, then justify so the text closes neatly on itself. */}
          <textPath href={`#ring-${id}`} textLength="460" lengthAdjust="spacing">
            {ring.repeat(Math.max(1, Math.floor(44 / ring.length)))}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[24%] grid place-items-center rounded-full bg-white shadow-soft ring-1 ring-line">
        <span className="px-1 text-center font-display text-[clamp(0.9rem,2.2vw,1.5rem)] font-extrabold leading-none tracking-tight text-brand-700">{code}</span>
      </div>
    </div>
  );
}
