"use client";

import { useEffect, useRef } from "react";
import { addLeadNote, assignLead, changeLeadStatus, type ActionState } from "@/app/admin/(panel)/leads/actions";
import { buttonClass, Card, fieldClass, labelClass, Notice } from "@/components/admin/ui";
import { useFormAction } from "@/components/admin/useFormAction";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  status: string;
  assignedTo: string | null;
  statuses: [string, string][];
  assignees: { id: string; name: string }[];
};

function Result({ state }: { state: ActionState }) {
  if (state.error) return <Notice>{state.error}</Notice>;
  if (state.ok) return <Notice tone="ok">{state.ok}</Notice>;
  return null;
}

export function LeadActions({ id, status, assignedTo, statuses, assignees }: Props) {
  const [statusState, statusSubmit, statusPending] = useFormAction<ActionState>(changeLeadStatus, {});
  const [assignState, assignSubmit, assignPending] = useFormAction<ActionState>(assignLead, {});
  const [noteState, noteSubmit, notePending] = useFormAction<ActionState>(addLeadNote, {});
  // Comment boxes clear only once their text is saved.
  const statusForm = useRef<HTMLFormElement>(null);
  const noteForm = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const note = statusForm.current?.elements.namedItem("note");
    if (statusState.ok && note instanceof HTMLTextAreaElement) note.value = "";
  }, [statusState]);
  useEffect(() => {
    if (noteState.ok) noteForm.current?.reset();
  }, [noteState]);
  const small = cn(buttonClass, "h-10 px-4 text-sm");

  return (
    <div className="space-y-5">
      <Card title="Estado">
        <form ref={statusForm} onSubmit={statusSubmit} className="space-y-3">
          <input type="hidden" name="id" value={id} />
          <select name="status" defaultValue={status} className={fieldClass} aria-label="Estado">
            {statuses.map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <textarea name="note" placeholder="Comentario opcional sobre el cambio" className={cn(fieldClass, "min-h-20 text-sm")} maxLength={2000} />
          <Result state={statusState} />
          <button className={small} disabled={statusPending}>
            Guardar estado
          </button>
        </form>
      </Card>

      <Card title="Responsable">
        <form onSubmit={assignSubmit} className="space-y-3">
          <input type="hidden" name="id" value={id} />
          <select name="assignee" defaultValue={assignedTo ?? ""} className={fieldClass} aria-label="Responsable">
            <option value="">Sin asignar</option>
            {assignees.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <Result state={assignState} />
          <button className={small} disabled={assignPending}>
            Asignar
          </button>
        </form>
      </Card>

      <Card title="Nota interna">
        <form ref={noteForm} onSubmit={noteSubmit} className="space-y-3">
          <input type="hidden" name="id" value={id} />
          <label className="block">
            <span className={cn(labelClass, "sr-only")}>Nota</span>
            <textarea name="note" required placeholder="Llamada, acuerdos, próximos pasos…" className={cn(fieldClass, "min-h-24 text-sm")} maxLength={2000} />
          </label>
          <Result state={noteState} />
          <button className={small} disabled={notePending}>
            Agregar nota
          </button>
        </form>
      </Card>
    </div>
  );
}
