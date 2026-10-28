import type { Locale } from "@/i18n/config";

type FlagProps = { className?: string };

// Circular flags: each is drawn inside a 32×32 circle clip with a soft glass highlight.
function Disc({ id, children, className }: FlagProps & { id: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <clipPath id={`clip-${id}`}>
          <circle cx="16" cy="16" r="16" />
        </clipPath>
        <radialGradient id={`gloss-${id}`} cx="0.32" cy="0.22" r="0.75">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#clip-${id})`}>
        {children}
        <circle cx="16" cy="16" r="16" fill={`url(#gloss-${id})`} />
      </g>
      <circle cx="16" cy="16" r="15.4" fill="none" stroke="#0e1433" strokeOpacity="0.14" strokeWidth="1.2" />
    </svg>
  );
}

export function FlagCO({ className }: FlagProps) {
  return (
    <Disc id="co" className={className}>
      <rect width="32" height="16" fill="#FCD116" />
      <rect y="16" width="32" height="8" fill="#003893" />
      <rect y="24" width="32" height="8" fill="#CE1126" />
    </Disc>
  );
}

export function FlagBR({ className }: FlagProps) {
  return (
    <Disc id="br" className={className}>
      <rect width="32" height="32" fill="#009B3A" />
      <path d="M16 5.5 29 16 16 26.5 3 16Z" fill="#FEDF00" />
      <circle cx="16" cy="16" r="6.2" fill="#002776" />
      <path d="M10.1 14.6c3.9-.9 8.2-.4 11.7 1.6" stroke="#fff" strokeWidth="1.1" fill="none" />
    </Disc>
  );
}

export function FlagUS({ className }: FlagProps) {
  const stripes = Array.from({ length: 7 }, (_, i) => (
    <rect key={i} y={i * 4.57} width="32" height="2.29" fill="#B22234" />
  ));
  return (
    <Disc id="us" className={className}>
      <rect width="32" height="32" fill="#fff" />
      {stripes}
      <rect width="15" height="16" fill="#3C3B6E" />
      {[3, 7, 11].map((x) => [3.2, 8, 12.8].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.9" fill="#fff" />))}
    </Disc>
  );
}

export const flagFor: Record<Locale, (p: FlagProps) => React.ReactElement> = {
  es: FlagCO,
  pt: FlagBR,
  en: FlagUS,
};

export const localeLabel: Record<Locale, { short: string; name: string }> = {
  es: { short: "ES", name: "Español" },
  pt: { short: "PT", name: "Português (Brasil)" },
  en: { short: "EN", name: "English" },
};
