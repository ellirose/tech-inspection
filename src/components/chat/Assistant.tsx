"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowsClockwise, ChatCircleDots, PaperPlaneRight, Sparkle, WhatsappLogo, X } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { MethodKey } from "@/content/methods";
import { cn } from "@/lib/cn";

type Option = { id: string; label: string };
type Msg = {
  id: number;
  from: "bot" | "user";
  text: string;
  options?: Option[];
  link?: { href: string; label: string; external?: boolean; whatsapp?: boolean };
};
type Flow =
  | { kind: "idle" }
  | { kind: "quote"; step: "service" | "qty" | "name" | "contact"; service?: string; qty?: string; name?: string }
  | { kind: "advise"; step: "ferro" | "where"; ferro?: string };

export type AssistantProps = {
  lang: Locale;
  t: Dictionary["chat"];
  quantities: string[];
  waIntro: string;
  whatsapp: string;
  platformUrl: string;
  services: { slug: string; name: string }[];
  methods: { key: MethodKey; slug: string; name: string }[];
};

let uid = 0;
const nextId = () => ++uid;

export function Assistant(props: AssistantProps) {
  const { lang, t, services, methods } = props;
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [flow, setFlow] = useState<Flow>({ kind: "idle" });
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const menu: Option[] = [
    { id: "quote", label: t.options.quote },
    { id: "advise", label: t.options.advise },
    { id: "platform", label: t.options.platform },
    { id: "human", label: t.options.human },
  ];

  const toggle = () => {
    // Greet on first open.
    if (!open && msgs.length === 0) setMsgs([{ id: nextId(), from: "bot", text: t.hello, options: menu }]);
    setOpen((o) => !o);
  };

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const wa = (text: string) => `https://wa.me/${props.whatsapp}?text=${encodeURIComponent(text)}`;

  const say = (m: Omit<Msg, "id" | "from">, delay = 650) => {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMsgs((prev) => [...prev, { id: nextId(), from: "bot", ...m }]);
    }, delay);
  };
  const user = (text: string) =>
    // Options are answered once: strip them from earlier bot bubbles.
    setMsgs((prev) => [...prev.map((m) => ({ ...m, options: undefined })), { id: nextId(), from: "user", text }]);

  const startQuote = (preset?: string) => {
    if (preset) {
      setFlow({ kind: "quote", step: "qty", service: preset });
      say({ text: t.askQty, options: props.quantities.map((q) => ({ id: q, label: q })) });
    } else {
      setFlow({ kind: "quote", step: "service" });
      say({ text: t.askService, options: services.map((s) => ({ id: s.slug, label: s.name })) });
    }
  };

  const recommend = (ferro: string, where: string) => {
    let key: MethodKey = "pt";
    if (where === "internal") key = "ut";
    else if (where === "geometry") key = "vt";
    else if (ferro === "yes") key = "mt";
    const m = methods.find((x) => x.key === key)!;
    setFlow({ kind: "idle" });
    say({
      text: `${t.recommend} ${m.name}. ${t.recommendAfter}`,
      link: { href: `/${lang}/metodos/${m.slug}`, label: m.name },
      options: [
        { id: `quote-method:${m.name}`, label: t.options.quote },
        { id: "restart", label: t.restart },
      ],
    });
  };

  const submitLead = async (contact: string, f: Extract<Flow, { kind: "quote" }>) => {
    const summary = [props.waIntro, `• ${f.service}`, `• ${f.qty}`, `• ${f.name}`, `• ${contact}`].join("\n");
    try {
      await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "assistant", lang, services: [f.service], quantity: f.qty, name: f.name, contact }),
      });
    } catch {
      // The WhatsApp hand-off below still carries the full summary.
    }
    setFlow({ kind: "idle" });
    say({ text: t.thanks, link: { href: wa(summary), label: t.options.human, external: true, whatsapp: true }, options: [{ id: "restart", label: t.restart }] });
  };

  const choose = (opt: Option) => {
    if (opt.label) user(opt.label);
    if (opt.id === "restart") {
      setFlow({ kind: "idle" });
      return say({ text: t.hello, options: menu });
    }
    if (opt.id.startsWith("quote-method:")) return startQuote(opt.id.split(":")[1]);

    if (flow.kind === "quote") {
      if (flow.step === "service") {
        setFlow({ ...flow, step: "qty", service: opt.label });
        return say({ text: t.askQty, options: props.quantities.map((q) => ({ id: q, label: q })) });
      }
      if (flow.step === "qty") {
        setFlow({ ...flow, step: "name", qty: opt.label });
        return say({ text: t.askName });
      }
    }
    if (flow.kind === "advise") {
      if (flow.step === "ferro") {
        setFlow({ kind: "advise", step: "where", ferro: opt.id });
        return say({
          text: t.advise2,
          options: [
            { id: "surface", label: t.surface },
            { id: "internal", label: t.internal },
            { id: "geometry", label: t.geometry },
          ],
        });
      }
      return recommend(flow.ferro ?? "unsure", opt.id);
    }

    switch (opt.id) {
      case "quote":
        return startQuote();
      case "advise":
        setFlow({ kind: "advise", step: "ferro" });
        return say({
          text: t.advise1,
          options: [
            { id: "yes", label: t.yes },
            { id: "no", label: t.no },
            { id: "unsure", label: t.unsure },
          ],
        });
      case "platform":
        return say({ text: t.platformText, link: { href: props.platformUrl, label: "TI-QMS", external: true }, options: [{ id: "restart", label: t.restart }] });
      case "human":
        return say({ text: t.humanText, link: { href: wa(props.waIntro), label: "WhatsApp", external: true, whatsapp: true }, options: [{ id: "restart", label: t.restart }] });
    }
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    user(text);

    if (flow.kind === "quote" && flow.step === "name") {
      setFlow({ ...flow, step: "contact", name: text });
      return say({ text: t.askContact });
    }
    if (flow.kind === "quote" && flow.step === "contact") return submitLead(text, flow);
    if (flow.kind === "quote" && flow.step === "service") {
      setFlow({ ...flow, step: "qty", service: text });
      return say({ text: t.askQty, options: props.quantities.map((q) => ({ id: q, label: q })) });
    }

    // Lightweight intent detection across the three languages.
    const q = text.toLowerCase();
    if (/cotiz|precio|cost|quote|orç|presupuesto|valor/.test(q)) return startQuote();
    if (/m[eé]todo|method|ultra|magn|penetr|visual|dimens|espesor|thickness|grieta|crack|trinca/.test(q)) return choose({ id: "advise", label: "" });
    if (/plataforma|platform|ti-?qms|login|acceso|acesso|informe|report|certificado/.test(q)) return choose({ id: "platform", label: "" });
    if (/asesor|humano|human|whats|llamar|call|ligar|consultor|advisor/.test(q)) return choose({ id: "human", label: "" });
    say({ text: t.fallback, options: menu });
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={toggle}
        aria-label={t.open}
        aria-expanded={open}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="relative grid size-14 place-items-center rounded-[1.25rem] bg-brand-700 sm:size-16 sm:rounded-[1.4rem] text-white shadow-float ring-4 ring-white"
      >
        <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-[1.4rem] bg-brand-500/40" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? "x" : "chat"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
            {open ? <X weight="bold" className="size-7" /> : <ChatCircleDots weight="duotone" className="size-8" />}
          </motion.span>
        </AnimatePresence>
        {!open && <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-mt text-brand-900 ring-2 ring-white"><Sparkle weight="fill" className="size-3.5" /></span>}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label={t.title}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-[8.5rem] right-4 z-[60] flex h-[min(38rem,calc(100svh-11rem))] sm:bottom-[10.5rem] w-[min(26rem,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-[2rem] bg-canvas shadow-float ring-1 ring-line sm:right-6"
          >
            <div className="relative overflow-hidden bg-brand-700 px-5 pb-5 pt-5 text-white">
              <div className="absolute inset-0 bg-blueprint opacity-20 [filter:invert(1)]" />
              <div className="relative flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                  <Sparkle weight="duotone" className="size-7 text-mt" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold leading-tight">{t.title}</p>
                  <p className="flex items-center gap-1.5 text-sm text-white/75">
                    <span className="size-2 rounded-full bg-mt" /> {t.subtitle}
                  </p>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="ml-auto grid size-10 place-items-center rounded-xl bg-white/10 hover:bg-white/20" aria-label="✕">
                  <X weight="bold" className="size-5" />
                </button>
              </div>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-dots px-4 py-5" aria-live="polite">
              {msgs.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex flex-col", m.from === "user" ? "items-end" : "items-start")}>
                  <p
                    className={cn(
                      "max-w-[85%] whitespace-pre-line rounded-3xl px-4 py-3 text-[0.98rem] leading-snug",
                      m.from === "user" ? "rounded-br-lg bg-brand-700 text-white" : "rounded-bl-lg bg-white text-ink shadow-soft ring-1 ring-line",
                    )}
                  >
                    {m.text}
                  </p>
                  {m.link && (
                    <Link
                      href={m.link.href}
                      target={m.link.external ? "_blank" : undefined}
                      rel={m.link.external ? "noopener" : undefined}
                      className={cn(
                        "mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-display text-sm font-bold",
                        m.link.whatsapp ? "bg-whatsapp text-white" : "bg-brand-50 text-brand-700 ring-1 ring-brand-100",
                      )}
                    >
                      {m.link.whatsapp && <WhatsappLogo weight="fill" className="size-5" />}
                      {m.link.label}
                      <ArrowRight weight="bold" className="size-4" />
                    </Link>
                  )}
                  {m.options && (
                    <div className="mt-2.5 flex max-w-[95%] flex-wrap gap-2">
                      {m.options.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => choose(o)}
                          className={cn(
                            "rounded-full bg-white px-3.5 py-2 text-[0.9rem] font-semibold text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-700 hover:text-white",
                            o.id === "restart" && "inline-flex items-center gap-1.5 text-mute ring-line",
                          )}
                        >
                          {o.id === "restart" && <ArrowsClockwise weight="bold" className="size-4" />}
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              {typing && (
                <div className="flex w-fit gap-1.5 rounded-3xl rounded-bl-lg bg-white px-4 py-4 shadow-soft ring-1 ring-line">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="size-2 rounded-full bg-brand-400" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }} />
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={send} className="flex items-center gap-2 border-t border-line bg-white p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                className="min-w-0 flex-1 rounded-full bg-mist px-4 py-3 text-base outline-none ring-brand-300 focus:ring-2"
              />
              <button type="submit" className="grid size-12 place-items-center rounded-full bg-brand-700 text-white transition hover:bg-brand-600" aria-label={t.send}>
                <PaperPlaneRight weight="fill" className="size-5" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
