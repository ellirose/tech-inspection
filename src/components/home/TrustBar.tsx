import Image from "next/image";
import { clients } from "@/content/site";
import { cn } from "@/lib/cn";

const credentials = ["ISO 9001:2015", "ISO 45001:2018", "Decreto 1072/2015", "RUC", "ASNT-TC-1A", "DS-1"];

/** Infinite marquee mixing client logos with credential chips. */
export function TrustBar({ label }: { label: string }) {
  const row = clients.flatMap((c, i) => [
    { type: "logo" as const, ...c },
    { type: "cred" as const, name: credentials[i % credentials.length] },
  ]);

  return (
    <section aria-label={label} className="relative border-y border-line bg-white py-10">
      <p className="text-center font-mono text-xs font-bold uppercase tracking-[0.22em] text-mute">{label}</p>
      <div className="mt-7 overflow-hidden mask-fade-x">
        <div className="flex w-max animate-marquee items-center gap-5 hover:[animation-play-state:paused]">
          {[...row, ...row].map((item, i) =>
            item.type === "logo" ? (
              <div key={i} className="flex h-24 w-56 shrink-0 items-center justify-center rounded-[1.5rem] bg-canvas px-7 ring-1 ring-line">
                <Image
                  src={item.logo}
                  alt={item.name}
                  width={220}
                  height={90}
                  className={cn("object-contain opacity-80 grayscale-[25%] transition hover:opacity-100 hover:grayscale-0", item.square ? "size-[4.5rem] rounded-xl" : "max-h-16 w-auto")}
                />
              </div>
            ) : (
              <span key={i} className="shrink-0 rounded-full border-2 border-dashed border-brand-200 px-6 py-3 font-mono text-[0.95rem] font-bold tracking-wider text-brand-700">
                {item.name}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
