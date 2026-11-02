// Small building blocks shared by the admin screens.
import { cn } from "@/lib/cn";

export const fieldClass =
  "w-full rounded-xl bg-surface px-3.5 py-2.5 text-base text-ink ring-1 ring-inset ring-line outline-none transition placeholder:text-mute/70 focus:ring-2 focus:ring-accent";
export const labelClass = "mb-1.5 block text-sm font-bold text-ink";
export const buttonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 font-bold text-white transition hover:bg-brand-500 disabled:opacity-60 dark:bg-neon dark:text-[#071a2e]";
export const quietButtonClass = "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 font-bold text-ink ring-1 ring-inset ring-line transition hover:bg-surface-2 disabled:opacity-60";

export function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl bg-surface p-6 shadow-soft ring-1 ring-line", className)}>
      {title && <h2 className="mb-4 text-lg font-extrabold tracking-tight text-ink">{title}</h2>}
      {children}
    </section>
  );
}

export function Notice({ tone = "error", children }: { tone?: "error" | "ok" | "info"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-2xl px-4 py-3 text-sm font-bold",
        tone === "error" && "bg-pt/10 text-pt",
        tone === "ok" && "bg-lime/15 text-lime-deep dark:text-lime",
        tone === "info" && "bg-tint text-accent-ink",
      )}
    >
      {children}
    </p>
  );
}

/** Centered card used by the sign-in, recovery and setup screens. */
export function AuthFrame({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-svh place-items-center bg-blueprint px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] bg-surface p-8 shadow-card ring-1 ring-line sm:p-10">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">Tech-Inspection · Panel</p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        {lead && <p className="mt-2 text-ink-soft">{lead}</p>}
        <div className="mt-7">{children}</div>
      </div>
    </main>
  );
}
