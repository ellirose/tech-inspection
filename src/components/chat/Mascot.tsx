import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * The assistant's mascot (design document §6.7): a sober inspector in a white hard hat and the logo's
 * blue coverall with a reflective band; the face is a visor that shows an ultrasonic A-scan pulse.
 * Colours from the identity manual: institutional blue #030A8C, complementary #105486, light gray #D9D9D9.
 * Used as the chat button and the chat panel's avatar; never in the hero.
 */
export function Mascot({ className, title }: { className?: string; title?: string }) {
  const id = useId();
  const bg = `${id}-bg`;
  const visor = `${id}-visor`;
  const round = `${id}-round`;
  return (
    <svg viewBox="0 0 64 64" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} className={cn("block", className)}>
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#105486" />
          <stop offset="1" stopColor="#030A8C" />
        </linearGradient>
        <linearGradient id={visor} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1450" />
          <stop offset="1" stopColor="#030A8C" />
        </linearGradient>
        <clipPath id={round}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${round})`}>
        <circle cx="32" cy="32" r="32" fill={`url(#${bg})`} />
        {/* Coverall with reflective band */}
        <path d="M10 64c1.5-9.5 9.4-15 22-15s20.5 5.5 22 15z" fill="#0b1f6e" />
        <path d="M12.6 58.5c3.7-3 10.4-4.6 19.4-4.6s15.7 1.6 19.4 4.6l.6 2.6c-4.2-3-11-4.5-20-4.5s-15.8 1.5-20 4.5z" fill="#D9D9D9" />
        <path d="M27 49.4 32 55l5-5.6" fill="none" stroke="#105486" strokeWidth="1.6" strokeLinejoin="round" />
        {/* Head */}
        <rect x="20.5" y="25" width="23" height="24" rx="10" fill="#D9D9D9" />
        {/* Visor with an A-scan: main bang, flaw echo, back-wall echo */}
        <rect x="22.5" y="32.5" width="19" height="10.5" rx="5.25" fill={`url(#${visor})`} />
        <path d="M24.5 38.6h2.6l1-3.6 1.1 6 1-2.4h3l.7-1.6.8 2.6.5-.9h2.5l.6-2.1.7 3 .6-1h1.8" fill="none" stroke="#ffffff" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
        {/* Hard hat */}
        <path d="M17.5 30.5C17.5 19.8 24 13 32 13s14.5 6.8 14.5 17.5z" fill="#ffffff" />
        <path d="M30.4 13.4h3.2v17.1h-3.2z" fill="#D9D9D9" />
        <rect x="13.5" y="28.6" width="37" height="4.4" rx="2.2" fill="#ffffff" />
        <rect x="13.5" y="31.4" width="37" height="1.6" rx=".8" fill="#D9D9D9" />
      </g>
    </svg>
  );
}
