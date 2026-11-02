export function PageHead({ title, lead, children }: { title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
        {lead && <p className="mt-1 max-w-2xl text-ink-soft">{lead}</p>}
      </div>
      {children}
    </div>
  );
}

/** Placeholder for a module whose editing screens arrive in stage 4. */
export function Upcoming({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-tint px-4 py-3 text-sm font-bold text-accent-ink">{children}</p>;
}
