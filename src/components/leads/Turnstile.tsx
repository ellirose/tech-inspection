"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/i18n/config";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loading: Promise<TurnstileApi> | undefined;
const loadTurnstile = () =>
  (loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
    s.onerror = () => {
      loading = undefined;
      reject(new Error("turnstile"));
    };
    document.head.appendChild(s);
  }));

/**
 * Cloudflare Turnstile check. Stays invisible unless Cloudflare needs the visitor to click.
 * Tokens are single-use: change `resetKey` after each submission to get a fresh one.
 * Renders nothing when no site key is configured.
 */
export function Turnstile({ lang, onToken, resetKey = 0, className }: { lang: Locale; onToken: (token: string | null) => void; resetKey?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const callback = useRef(onToken);
  useEffect(() => {
    callback.current = onToken;
  });

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !ref.current) return;
    let cancelled = false;
    loadTurnstile()
      .then((api) => {
        if (cancelled || !ref.current) return;
        widget.current = api.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action: "lead",
          appearance: "interaction-only",
          theme: "dark",
          language: lang === "pt" ? "pt-br" : lang,
          callback: (token: string) => callback.current(token),
          "expired-callback": () => callback.current(null),
          "error-callback": () => callback.current(null),
        });
      })
      .catch(() => callback.current(null));
    return () => {
      cancelled = true;
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
    };
  }, [lang]);

  useEffect(() => {
    if (resetKey && widget.current) {
      callback.current(null);
      window.turnstile?.reset(widget.current);
    }
  }, [resetKey]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={ref} className={className} />;
}
