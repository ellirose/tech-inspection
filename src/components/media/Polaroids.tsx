import Image from "next/image";
import type { Photo } from "@/lib/media";
import { cn } from "@/lib/cn";

const tilt = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-1", "rotate-1"];
const lift = ["sm:translate-y-6", "", "sm:translate-y-10", "sm:-translate-y-2", "sm:translate-y-4", ""];

/** Scattered instant-photo prints with captions; the full frame of every photo stays visible. */
export function Polaroids({ items, className }: { items: Photo[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-start justify-center gap-x-5 gap-y-8 sm:gap-x-8", className)}>
      {items.map((p, i) => (
        <li
          key={p.src}
          className={cn(
            "w-[calc(50%-0.75rem)] bg-white p-2.5 pb-4 shadow-lift ring-1 ring-line transition duration-500 hover:z-10 hover:rotate-0 hover:scale-[1.04] sm:p-3",
            p.w > p.h ? "sm:w-80" : "sm:w-56",
            tilt[i % tilt.length],
            lift[i % lift.length],
          )}
        >
          <Image src={p.src} alt={p.caption ?? ""} width={p.w} height={p.h} sizes="(min-width:640px) 20rem, 45vw" className="h-auto w-full" />
          {p.caption && <p className="mt-3 text-center text-lg font-bold text-[#0b1533]">{p.caption}</p>}
        </li>
      ))}
    </ul>
  );
}
