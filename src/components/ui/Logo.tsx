import Image from "next/image";
import { cn } from "@/lib/cn";

/** The white plate both logos sit on. */
export const logoPlate = "rounded-xl bg-white shadow-[0_6px_20px_-8px_rgb(0_0_0/0.6)]";

/**
 * The full-colour logo on a white plate: the identity manual allows it only on white and forbids
 * recolouring it (doc/04-brand/BRAND-GUIDELINES.md), and the site is dark.
 */
export function Logo({ className, preload }: { className?: string; preload?: boolean }) {
  return (
    <span className={cn("relative block w-fit px-2.5 py-1", logoPlate, className)}>
      <LogoMark preload={preload} className="h-full w-auto" />
    </span>
  );
}

/**
 * Plain <img> over WebP copies made from logo.png (160/320/480 px wide): the header logo is often the
 * largest element of the first screen, and static files skip the image optimizer's first-request delay.
 */
export function LogoMark({ className, preload }: { className?: string; preload?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/media/brand/logo-320.webp"
      srcSet="/media/brand/logo-160.webp 160w, /media/brand/logo-320.webp 320w, /media/brand/logo-480.webp 480w"
      sizes="160px"
      alt="Tech-Inspection S.A.S."
      width={900}
      height={317}
      fetchPriority={preload ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}

/**
 * The QA/QC line's own logo (blue and green), as in the client presentation. Navy elements, so it
 * also goes on white. Source: reference/qaqc-presentation/.
 */
export function QaqcMark({ className, preload, sizes = "120px" }: { className?: string; preload?: boolean; sizes?: string }) {
  return <Image src="/media/brand/qaqc-logo.png" alt="QA/QC · Aseguramiento y control de calidad" width={226} height={274} preload={preload} sizes={sizes} className={className} />;
}
