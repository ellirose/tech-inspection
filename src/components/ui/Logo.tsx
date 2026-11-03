import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The full-colour logo on a white plate: the identity manual allows it only on white and forbids
 * recolouring it (doc/04-brand/BRAND-GUIDELINES.md), and the site is dark.
 */
export function Logo({ className, preload }: { className?: string; preload?: boolean }) {
  return (
    <span className={cn("relative block w-fit rounded-xl bg-white px-2.5 py-1 shadow-[0_6px_20px_-8px_rgb(0_0_0/0.6)]", className)}>
      <Image src="/media/brand/logo.png" alt="Tech-Inspection S.A.S." width={900} height={317} preload={preload} sizes="240px" className="h-full w-auto" />
    </span>
  );
}
