import Image from "next/image";
import { officialSeals, type SealId } from "@/content/site";
import { cn } from "@/lib/cn";

/**
 * Official CCS certification seal, exactly as published: never recoloured, stretched or rotated. Its own
 * white border keeps it legible on dark and photo backgrounds. Size it through `className` (width only:
 * the seal is square). The certificate code, when known, sits underneath as the CCS manuals require.
 */
export function CcsSeal({ id, number, sizes, className, preload }: { id: SealId; number?: string; sizes: string; className?: string; preload?: boolean }) {
  const s = officialSeals[id];
  return (
    <figure className={cn("m-0 flex flex-col items-center", className)}>
      <Image src={s.src} width={342} height={342} alt={s.alt} sizes={sizes} preload={preload} className="aspect-square w-full drop-shadow-[0_6px_14px_rgb(4_20_40/0.28)]" />
      {number && (
        <figcaption className="mt-2 rounded-full bg-white px-2.5 py-0.5 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm font-medium tracking-wide text-[#00539b] ring-1 ring-[#00539b]/15">{number}</figcaption>
      )}
    </figure>
  );
}
