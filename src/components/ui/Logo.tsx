import Image from "next/image";
import { cn } from "@/lib/cn";

export function Logo({ className, preload }: { className?: string; preload?: boolean }) {
  return (
    <Image
      src="/media/brand/logo.png"
      alt="Tech-Inspection S.A.S."
      width={900}
      height={317}
      preload={preload}
      className={cn("h-auto w-auto", className)}
      sizes="220px"
    />
  );
}
