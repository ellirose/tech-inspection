"use client";

import { useEffect } from "react";

/** Tells the server which address answered 404 (path and referring site only), for Redirecciones. */
export function NotFoundReport() {
  useEffect(() => {
    const body = JSON.stringify({ path: location.pathname, referrer: document.referrer || undefined });
    fetch("/api/not-found", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  }, []);
  return null;
}
