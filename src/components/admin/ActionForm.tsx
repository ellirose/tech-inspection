"use client";

import { useActionState } from "react";
import { buttonClass, Notice, quietButtonClass } from "./ui";
import { cn } from "@/lib/cn";

export type ActionResult = { ok?: string; error?: string };
type Action = (state: ActionResult, form: FormData) => Promise<ActionResult>;

/** A form bound to a server action, with its result shown under the fields. */
export function ActionForm({
  action,
  hidden,
  submit,
  quiet,
  confirm,
  className,
  children,
}: {
  action: Action;
  hidden?: Record<string, string>;
  submit: string;
  quiet?: boolean;
  /** Asks before submitting, for actions that are hard to undo. */
  confirm?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [state, run, pending] = useActionState(action, {});
  return (
    <form action={run} onSubmit={(e) => confirm && !window.confirm(confirm) && e.preventDefault()} className={className ?? "space-y-3"}>
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {children}
      {state.error && <Notice>{state.error}</Notice>}
      {state.ok && <Notice tone="ok">{state.ok}</Notice>}
      <button className={cn(quiet ? quietButtonClass : buttonClass, "h-10 px-4 text-sm")} disabled={pending}>
        {pending ? "Guardando…" : submit}
      </button>
    </form>
  );
}
