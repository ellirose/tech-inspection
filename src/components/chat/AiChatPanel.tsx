"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowsClockwise, Check, PaperPlaneRight, Phone, WhatsappLogo, X } from "@phosphor-icons/react/ssr";
import { Mascot } from "./Mascot";
import { Turnstile, TURNSTILE_SITE_KEY } from "@/components/leads/Turnstile";
import { submitLead } from "@/lib/leads/client";
import { track } from "@/lib/analytics";
import { labelFor, locationKeys, quantityKeys, urgencyKeys } from "@/lib/leads/options";
import { CHAT_LIMITS, chatNotes, splitReplies, type ChatError, type ChatEvent, type ChatMessage, type LeadDraft } from "@/lib/chat/protocol";
import { cn } from "@/lib/cn";
import type { AiAssistantProps } from "./AiAssistant";

type LeadCard = { draft: LeadDraft; status: "open" | "sending" | "sent" | "closed"; consent: boolean; error?: string };
type Item = {
  id: number;
  role: "user" | "assistant";
  text: string;
  /** For the model only (chatNotes): what the visitor saw or did besides the text. */
  note?: string;
  replies?: string[];
  lead?: LeadCard;
  contact?: boolean;
  link?: { href: string; label: string; whatsapp?: boolean };
};
type Saved = { id: string; items: Item[] };

const STORE = "ti:chat";
const read = (): Saved | null => {
  try {
    return JSON.parse(sessionStorage.getItem(STORE) ?? "null") as Saved | null;
  } catch {
    return null;
  }
};
const save = (value: Saved) => {
  try {
    sessionStorage.setItem(STORE, JSON.stringify(value));
  } catch {}
};
const newId = () => crypto.randomUUID();

/** Links in the bot's text: web addresses only, opened in a new tab. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+[^\s).,;:!?])/g);
  return parts.map((p, i) =>
    i % 2 ? (
      <a key={i} href={p} target="_blank" rel="noopener nofollow" className="break-all font-bold underline underline-offset-2">
        {p.replace(/^https?:\/\/(www\.)?/, "")}
      </a>
    ) : (
      p
    ),
  );
}

export default function AiChatPanel(props: AiAssistantProps & { open: boolean; onClose: () => void }) {
  const { lang, t, quote } = props;
  const ai = t.ai;
  // The four starting options are shown only; the greeting is not sent to the model.
  const greeting = (): Item => ({ id: 1, role: "assistant", text: t.hello, replies: [t.options.quote, t.options.services, t.options.platform, t.options.human] });
  const [conversation, setConversation] = useState<Saved>(() => {
    const saved = read();
    return saved?.items.length ? saved : { id: newId(), items: [greeting()] };
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const uid = useRef(conversation.items.reduce((n, i) => Math.max(n, i.id), 0));
  const nextId = () => ++uid.current;
  const items = conversation.items;

  useEffect(() => {
    if (!busy) save(conversation);
  }, [conversation, busy]);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [items, busy]);

  const update = (fn: (items: Item[]) => Item[]) => setConversation((c) => ({ ...c, items: fn(c.items) }));
  const patch = (id: number, fields: Partial<Item>) => update((list) => list.map((i) => (i.id === id ? { ...i, ...fields } : i)));
  const add = (item: Omit<Item, "id">) => update((list) => [...list, { ...item, id: nextId() }]);
  const wa = (text: string) => `https://wa.me/${props.whatsapp}?text=${encodeURIComponent(text)}`;
  const contactItem = (text: string): Omit<Item, "id"> => ({ role: "assistant", text, contact: true, note: chatNotes.contactCard });

  const history = (list: Item[]): ChatMessage[] =>
    list
      .filter((i) => i.text || i.note)
      .map((i) => ({ role: i.role, content: [i.text, i.note].filter(Boolean).join("\n\n") }));

  const ask = async (list: Item[]) => {
    if (list.filter((i) => i.role === "user").length > CHAT_LIMITS.userTurns) {
      add(contactItem(ai.limit));
      return;
    }
    setBusy(true);
    const answerId = nextId();
    let answer = "";
    const outcome: { error: ChatError | null } = { error: null };
    let started = false;
    const apply = (event: ChatEvent) => {
      if (event.type === "text" || event.type === "reset") {
        answer = event.type === "text" ? answer + event.text : "";
        if (!started) {
          started = true;
          update((l) => [...l, { id: answerId, role: "assistant", text: "" }]);
        }
        patch(answerId, { text: answer });
      } else if (event.type === "lead") {
        if (!started) update((l) => [...l, { id: answerId, role: "assistant", text: "" }]);
        started = true;
        patch(answerId, { lead: { draft: event.draft, status: "open", consent: false }, note: chatNotes.leadCard });
      } else if (event.type === "contact") {
        if (!started) update((l) => [...l, { id: answerId, role: "assistant", text: "" }]);
        started = true;
        patch(answerId, { contact: true, note: chatNotes.contactCard });
      } else if (event.type === "error") outcome.error = event.error;
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conversation.id, lang, page: location.pathname, messages: history(list) }),
      });
      if (!res.body) throw new Error("no body");
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) if (line.trim()) apply(JSON.parse(line) as ChatEvent);
      }
      if (buffer.trim()) apply(JSON.parse(buffer) as ChatEvent);
    } catch {
      outcome.error = "server";
    }

    // Quick replies are read once the answer is complete.
    if (answer) {
      const { text: clean, replies } = splitReplies(answer);
      patch(answerId, { text: clean, replies });
    }
    if (outcome.error) add(contactItem(outcome.error === "limit" ? ai.limit : outcome.error === "rate_limited" ? ai.rateLimited : ai.busy));
    setBusy(false);
  };

  const sendText = (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    if (text.length > CHAT_LIMITS.messageChars) return add({ role: "assistant", text: ai.tooLong });
    const user: Item = { id: nextId(), role: "user", text };
    // Options are answered once: drop them from earlier bubbles.
    const list = [...items.map((i) => ({ ...i, replies: undefined })), user];
    setConversation((c) => ({ ...c, items: list }));
    setInput("");
    void ask(list);
  };

  const choose = (reply: string) => {
    // The starting options for TI-QMS and an advisor are answered here, without the model.
    if (reply === t.options.platform || reply === t.options.human) {
      const list = [...items.map((i) => ({ ...i, replies: undefined })), { id: nextId(), role: "user" as const, text: reply }];
      const answer: Item =
        reply === t.options.platform
          ? { id: nextId(), role: "assistant", text: t.platformText, link: { href: props.platformUrl, label: "TI-QMS" }, note: chatNotes.platform }
          : { id: nextId(), ...contactItem(t.humanText) };
      setConversation((c) => ({ ...c, items: [...list, answer] }));
      return;
    }
    sendText(reply);
  };

  const restart = () => {
    uid.current = 1;
    setConversation({ id: newId(), items: [greeting()] });
  };

  const confirmLead = async (item: Item) => {
    const card = item.lead!;
    if (!card.consent) return patch(item.id, { lead: { ...card, error: ai.consentRequired } });
    if (TURNSTILE_SITE_KEY && !token) return patch(item.id, { lead: { ...card, error: quote.captcha } });
    patch(item.id, { lead: { ...card, status: "sending", error: undefined } });
    const used = token;
    setToken(null);
    const res = await submitLead({ ...card.draft, source: "chatbot", lang, consent: true, turnstileToken: used ?? undefined, conversationId: conversation.id });
    if (!res.ok) {
      setAttempt((n) => n + 1);
      const error = { invalid: quote.invalid, files: quote.invalid, rate_limited: quote.rateLimited, captcha: quote.captcha, server: t.error }[res.error];
      return patch(item.id, { lead: { ...card, status: "open", error } });
    }
    patch(item.id, { lead: { ...card, status: "sent" } });
    track({ event: "chat_lead", services: card.draft.services.join(","), urgency: card.draft.urgency ?? "" });
    add({
      role: "assistant",
      text: t.thanks.replace("{ref}", res.reference),
      link: { href: wa(`${props.waIntro} ${res.reference}`), label: "WhatsApp", whatsapp: true },
      note: chatNotes.leadSent(res.reference),
    });
  };

  const closeLead = (item: Item) => patch(item.id, { lead: { ...item.lead!, status: "closed" }, note: `${chatNotes.leadCard}\n${chatNotes.leadClosed}` });

  const summary = (d: LeadDraft): [string, string | undefined][] => {
    const what = [
      ...d.services.map((s) => props.services.find((x) => x.slug === s)?.name ?? s),
      ...d.methods.map((m) => (m === "unsure" ? quote.unsure : (props.methods.find((x) => x.key === m)?.name ?? m))),
    ].join(", ");
    const place = [labelFor(locationKeys, quote.locations, d.location), d.city].filter(Boolean).join(" · ");
    const contact = [d.name, [d.role, d.company].filter(Boolean).join(", "), d.email, d.phone].filter(Boolean).join("\n");
    return [
      [ai.labels.what, what],
      [ai.labels.industry, d.industry],
      [ai.labels.component, d.component],
      [ai.labels.quantity, labelFor(quantityKeys, quote.quantities, d.quantity)],
      [ai.labels.place, place],
      [ai.labels.priority, labelFor(urgencyKeys, quote.urgencies, d.urgency)],
      [ai.labels.notes, d.description],
      [ai.labels.contact, contact],
      [ai.labels.channel, d.preferredChannel && ai.channels[d.preferredChannel]],
    ];
  };

  const last = items.at(-1);

  return (
    <AnimatePresence>
      {props.open && (
    <motion.section
      role="dialog"
      aria-label={t.title}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-[8.5rem] right-4 z-[60] flex h-[min(40rem,calc(100svh-11rem))] w-[min(26rem,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-[2rem] bg-canvas shadow-float ring-1 ring-line sm:bottom-[10.5rem] sm:right-6"
    >
      <div className="relative overflow-hidden bg-corp-blue px-5 pb-4 pt-5 text-white">
        <div className="absolute inset-0 bg-network opacity-50" />
        <div className="relative flex items-center gap-3">
          <Mascot className="size-11 shrink-0 rounded-full ring-1 ring-white/25" />
          <div className="min-w-0">
            <p className="text-lg font-semibold leading-tight tracking-tight">{t.title}</p>
            <p className="flex items-center gap-1.5 text-sm text-white/75">
              <span className="size-2 rounded-full bg-mt" /> {t.subtitle}
            </p>
          </div>
          <button type="button" onClick={restart} className="ml-auto grid size-10 place-items-center rounded-full ring-1 ring-white/20 hover:bg-white/10" aria-label={t.restart} title={t.restart}>
            <ArrowsClockwise weight="bold" className="size-5" />
          </button>
          <button type="button" onClick={props.onClose} className="grid size-10 place-items-center rounded-full ring-1 ring-white/20 hover:bg-white/10" aria-label="✕">
            <X weight="bold" className="size-5" />
          </button>
        </div>
        <p className="relative mt-3 text-xs leading-snug text-white/70">{ai.notice}</p>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5" aria-live="polite">
        {items.map((m) => {
          const shown = m.role === "assistant" && busy && m === last ? splitReplies(m.text).text : m.text;
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}>
              {shown && (
                <p className={cn("max-w-[88%] whitespace-pre-line break-words rounded-3xl px-4 py-3 text-[0.98rem] leading-snug", m.role === "user" ? "bg-brand-600 text-white" : "bg-surface text-ink ring-1 ring-line")}>
                  {m.role === "assistant" ? <Linkified text={shown} /> : shown}
                </p>
              )}

              {m.link && (
                <a
                  href={m.link.href}
                  target="_blank"
                  rel="noopener"
                  className={cn("mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold", m.link.whatsapp ? "bg-whatsapp text-whatsapp-ink" : "bg-neon text-[#071a2e]")}
                >
                  {m.link.whatsapp && <WhatsappLogo weight="fill" className="size-5" />}
                  {m.link.label}
                  <ArrowRight weight="bold" className="size-4" />
                </a>
              )}

              {m.contact && (
                <div className="mt-2 w-[88%] rounded-3xl bg-surface p-4 ring-1 ring-line">
                  <p className="text-sm font-bold text-ink">{ai.contactTitle}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={wa(props.waIntro)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-4 py-2.5 text-sm font-bold text-whatsapp-ink">
                      <WhatsappLogo weight="fill" className="size-5" /> WhatsApp
                    </a>
                    <a href={props.phoneHref} className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2.5 text-sm font-bold text-ink ring-1 ring-inset ring-line">
                      <Phone weight="bold" className="size-4" /> {ai.call} {props.phone}
                    </a>
                  </div>
                </div>
              )}

              {m.lead && (
                <div className="mt-2 w-full rounded-3xl bg-surface p-4 ring-1 ring-line">
                  <p className="flex items-center gap-2 text-sm font-bold text-ink">
                    {ai.summaryTitle}
                    {m.lead.status === "sent" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-lime/25 px-2 py-0.5 text-xs text-lime-deep dark:text-lime">
                        <Check weight="bold" className="size-3" /> {ai.sent}
                      </span>
                    )}
                  </p>
                  <dl className="mt-2 divide-y divide-line text-sm">
                    {summary(m.lead.draft)
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k} className="grid grid-cols-[7rem_1fr] gap-2 py-1.5">
                          <dt className="font-bold text-mute">{k}</dt>
                          <dd className="whitespace-pre-line break-words text-ink">{v}</dd>
                        </div>
                      ))}
                  </dl>
                  {(m.lead.status === "open" || m.lead.status === "sending") && (
                    <>
                      <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-2xl bg-surface-2 p-3 text-sm text-ink-soft ring-1 ring-inset ring-line">
                        <input
                          type="checkbox"
                          checked={m.lead.consent}
                          onChange={(e) => patch(m.id, { lead: { ...m.lead!, consent: e.target.checked, error: undefined } })}
                          className="mt-0.5 size-4 shrink-0 accent-brand-600"
                        />
                        <span>
                          {quote.consent}{" "}
                          <a href={props.policyHref} target="_blank" rel="noopener" className="font-bold text-accent underline underline-offset-2">
                            {quote.consentLink}
                          </a>
                          .
                        </span>
                      </label>
                      <Turnstile lang={lang} onToken={setToken} resetKey={attempt} className="mt-3 flex justify-center empty:hidden" />
                      {m.lead.error && (
                        <p role="alert" className="mt-3 rounded-2xl bg-pt/10 px-3 py-2 text-sm font-bold text-pt">
                          {m.lead.error}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" disabled={m.lead.status === "sending"} onClick={() => confirmLead(m)} className="inline-flex items-center gap-2 rounded-full bg-neon px-4 py-2.5 text-sm font-bold text-[#071a2e] transition hover:bg-lime disabled:opacity-60">
                          {m.lead.status === "sending" ? ai.sending : ai.confirm}
                          <ArrowRight weight="bold" className="size-4" />
                        </button>
                        <button type="button" disabled={m.lead.status === "sending"} onClick={() => closeLead(m)} className="rounded-full px-4 py-2.5 text-sm font-bold text-ink-soft ring-1 ring-inset ring-line hover:bg-surface-2">
                          {ai.edit}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {m === last && !busy && m.replies && m.replies.length > 0 && (
                <div className="mt-2.5 flex max-w-[95%] flex-wrap gap-2">
                  {m.replies.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => choose(r)}
                      className="rounded-full bg-surface px-3.5 py-2 text-left text-[0.92rem] font-bold text-accent ring-1 ring-inset ring-line transition hover:bg-brand-600 hover:text-white hover:ring-brand-600"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
        <AnimatePresence>
          {busy && last?.role === "user" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="status" aria-label={ai.typing} className="flex w-fit gap-1.5 rounded-3xl bg-surface px-4 py-4 ring-1 ring-line">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className="size-2 rounded-full bg-neon" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendText(input);
        }}
        className="flex items-center gap-2 border-t border-line bg-surface p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          aria-label={t.placeholder}
          maxLength={CHAT_LIMITS.messageChars}
          className="min-w-0 flex-1 rounded-full bg-surface-2 px-4 py-3 text-base outline-none ring-brand-300 focus:ring-2"
        />
        <button type="submit" disabled={busy || !input.trim()} className="grid size-12 place-items-center rounded-full bg-brand-700 text-white transition hover:bg-brand-600 disabled:opacity-50" aria-label={t.send}>
          <PaperPlaneRight weight="fill" className="size-5" />
        </button>
      </form>
    </motion.section>
      )}
    </AnimatePresence>
  );
}
