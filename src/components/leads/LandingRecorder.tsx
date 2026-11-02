"use client";

import { useEffect } from "react";
import { recordLanding } from "@/lib/leads/client";

/** Remembers how the visit started, for the attribution fields of any lead sent later. */
export function LandingRecorder() {
  useEffect(() => {
    try {
      recordLanding();
    } catch {}
  }, []);
  return null;
}
