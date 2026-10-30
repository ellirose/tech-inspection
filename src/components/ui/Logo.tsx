import Image from "next/image";
import { cn } from "@/lib/cn";

/** Follows the theme: charcoal lettering in light mode, white lettering in dark mode. */
export function Logo({ className, preload }: { className?: string; preload?: boolean }) {
  const common = { width: 900, height: 317, preload, sizes: "240px" } as const;
  return (
    <span className={cn("relative block", className)}>
      <Image src="/media/brand/logo.png" alt="Tech-Inspection S.A.S." {...common} className="h-full w-auto dark:hidden" />
      <Image src="/media/brand/logo-light.png" alt="" {...common} className="hidden h-full w-auto dark:block" />
    </span>
  );
}
