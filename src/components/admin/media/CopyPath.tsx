"use client";

import { useState } from "react";

/** A file path with a button that copies it, to paste into a content field. */
export function CopyPath({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-lg bg-surface-2 px-2 py-1 font-mono text-xs text-ink" title={path}>
        {path}
      </code>
      <button
        type="button"
        onClick={() =>
          navigator.clipboard.writeText(path).then(
            () => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            },
            () => {},
          )
        }
        className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-accent ring-1 ring-inset ring-line hover:bg-surface-2"
      >
        {copied ? "Copiada" : "Copiar"}
      </button>
    </div>
  );
}
