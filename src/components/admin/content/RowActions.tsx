"use client";

import { ArrowDown, ArrowUp } from "@phosphor-icons/react/ssr";
import { deleteContent, discardPending, moveContent, setContentStatus, type SimpleState } from "@/app/admin/(panel)/contenido/actions";
import { discardBlockPending } from "@/app/admin/(panel)/contenido/paginas/actions";
import { Notice, quietButtonClass } from "@/components/admin/ui";
import { useFormAction } from "@/components/admin/useFormAction";
import { cn } from "@/lib/cn";

const small = cn(quietButtonClass, "h-9 px-3 text-sm");

export function MoveButtons({ collection, id, first, last }: { collection: string; id: string; first: boolean; last: boolean }) {
  const [, onSubmit, pending] = useFormAction<SimpleState>(moveContent, {});
  return (
    <form onSubmit={onSubmit} className="flex gap-1">
      <input type="hidden" name="collection" value={collection} />
      <input type="hidden" name="id" value={id} />
      <button name="direction" value="up" disabled={first || pending} aria-label="Subir" className={cn(small, "px-2")}>
        <ArrowUp className="size-4" />
      </button>
      <button name="direction" value="down" disabled={last || pending} aria-label="Bajar" className={cn(small, "px-2")}>
        <ArrowDown className="size-4" />
      </button>
    </form>
  );
}

export function StatusButton({ collection, id, published }: { collection: string; id: string; published: boolean }) {
  const [state, onSubmit, pending] = useFormAction<SimpleState>(setContentStatus, {});
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <input type="hidden" name="collection" value={collection} />
      <input type="hidden" name="id" value={id} />
      <button disabled={pending} className={small}>
        {published ? "Retirar del sitio" : "Publicar"}
      </button>
      {state.error && <Notice>{state.error}</Notice>}
      {state.ok && <Notice tone="ok">{state.ok}</Notice>}
    </form>
  );
}

/** Throws away the draft saved on a published item (or page section, with `blockKey`). */
export function DiscardDraftButton({ collection, id, blockKey }: { collection?: string; id?: string; blockKey?: string }) {
  const [state, onSubmit, pending] = useFormAction<SimpleState>(blockKey ? discardBlockPending : discardPending, {}, "¿Descartar el borrador? Se pierden los cambios que no se publicaron.");
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      {blockKey ? <input type="hidden" name="key" value={blockKey} /> : (
        <>
          <input type="hidden" name="collection" value={collection} />
          <input type="hidden" name="id" value={id} />
        </>
      )}
      <button disabled={pending} className={cn(small, "text-pt")}>
        Descartar borrador
      </button>
      {state.error && <Notice>{state.error}</Notice>}
      {state.ok && <Notice tone="ok">{state.ok}</Notice>}
    </form>
  );
}

export function DeleteButton({ collection, id, title }: { collection: string; id: string; title: string }) {
  const [state, onSubmit, pending] = useFormAction<SimpleState>(deleteContent, {}, `¿Eliminar «${title}» definitivamente? Si solo quiere ocultarlo, use «Retirar del sitio».`);
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <input type="hidden" name="collection" value={collection} />
      <input type="hidden" name="id" value={id} />
      <button disabled={pending} className={cn(small, "text-pt")}>
        Eliminar
      </button>
      {state.error && <Notice>{state.error}</Notice>}
    </form>
  );
}
