"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { AssistantProps } from "./Assistant";
import { ChatLauncher } from "./ChatLauncher";

export type AiAssistantProps = AssistantProps & {
  quote: Pick<Dictionary["quote"], "quantities" | "locations" | "urgencies" | "unsure" | "consent" | "consentLink" | "captcha" | "invalid" | "rateLimited">;
  phone: string;
  phoneHref: string;
};

// The panel's code loads on first open, or earlier when the browser is idle, so it never weighs on the
// page's first paint (design document §12.3).
const load = () => import("./AiChatPanel");
const AiChatPanel = lazy(load);

/** The chatbot (stage 6): used instead of the guided assistant when the site has an Anthropic API key. */
export function AiAssistant(props: AiAssistantProps) {
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 3000));
    idle(() => void load());
  }, []);

  const toggle = () => {
    setOpened(true);
    setOpen((o) => !o);
  };

  return (
    <>
      <ChatLauncher open={open} onClick={toggle} label={props.t.open} />
      {/* Stays mounted once opened, so closing and reopening keeps the conversation and any answer in progress. */}
      {opened && (
        <Suspense fallback={null}>
          <AiChatPanel {...props} open={open} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
