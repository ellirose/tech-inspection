"use client";

import { startTransition, useActionState } from "react";

/**
 * Runs a server action from a form's onSubmit instead of its `action` attribute. React resets a form
 * after every `<form action>` submission, including one the server rejected, which would wipe what the
 * person typed; submitting this way keeps the fields as they are. Pass `confirm` to ask first.
 */
export function useFormAction<S>(action: (state: Awaited<S>, form: FormData) => S | Promise<S>, initial: Awaited<S>, confirm?: string) {
  const [state, run, pending] = useActionState(action, initial);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm && !window.confirm(confirm)) return;
    const form = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => run(form));
  };
  return [state, onSubmit, pending] as const;
}
