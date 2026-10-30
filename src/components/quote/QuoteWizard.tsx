"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CheckCircle, WhatsappLogo } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { MethodKey } from "@/content/methods";
import type { ServiceIcon } from "@/content/services";
import { MethodGlyph, ServiceGlyph } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

type Props = {
  lang: Locale;
  t: Dictionary["quote"];
  services: { slug: string; icon: ServiceIcon; name: string }[];
  methods: { key: MethodKey; code: string; name: string }[];
  whatsapp: string;
  policyHref: string;
};

const field = "w-full rounded-2xl bg-surface px-4 py-3.5 text-[1.05rem] font-medium text-ink ring-1 ring-inset ring-line outline-none transition placeholder:text-mute/70 focus:ring-2 focus:ring-neon";
const label = "mb-2 block text-[1.02rem] font-bold text-ink";

function Choice({ on, onClick, children, className }: { on: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "relative rounded-2xl px-4 py-3 text-left text-[1rem] font-bold transition",
        on ? "bg-brand-600 text-white ring-1 ring-brand-600 shadow-[0_12px_26px_-12px_rgb(31_55_214/0.7)] dark:bg-neon dark:text-[#071a2e] dark:ring-neon" : "bg-surface text-ink ring-1 ring-inset ring-line hover:ring-accent/40",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function QuoteWizard({ lang, t, services, methods, whatsapp, policyHref }: Props) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [form, setForm] = useState({
    services: [] as string[],
    methods: [] as string[],
    quantity: "",
    location: "",
    city: "",
    urgency: t.urgencies[0],
    notes: "",
    name: "",
    company: "",
    email: "",
    phone: "",
    consent: false,
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k: "services" | "methods", v: string) => set(k, form[k].includes(v) ? form[k].filter((x) => x !== v) : [...form[k], v]);

  const valid = [form.services.length > 0, !!form.quantity && !!form.location, !!form.name && (!!form.email || !!form.phone) && form.consent];

  const go = (to: number) => {
    if (to > step && !valid[step]) return setError(t.required);
    setError("");
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  const summary = [
    t.waIntro,
    `• ${form.services.join(", ")}`,
    form.methods.length ? `• ${form.methods.join(", ")}` : "",
    `• ${form.quantity} · ${form.location}${form.city ? ` (${form.city})` : ""} · ${form.urgency}`,
    form.notes ? `• ${form.notes}` : "",
    `• ${form.name}${form.company ? ` — ${form.company}` : ""}`,
  ]
    .filter(Boolean)
    .join("\n");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid[2]) return setError(t.required);
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "wizard", lang, ...form }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("idle");
      setError(t.error);
    }
  };

  if (status === "done") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center rounded-[2.5rem] bg-surface p-10 text-center shadow-card ring-1 ring-line sm:p-14">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }} className="grid size-20 place-items-center rounded-full bg-lime/20 text-lime-deep dark:text-lime">
          <CheckCircle weight="light" className="size-12" />
        </motion.span>
        <h3 className="mt-6 text-3xl font-extrabold tracking-tight text-ink">{t.successTitle}</h3>
        <p className="mt-3 max-w-md text-lg text-ink-soft">{t.successText}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(summary)}`} target="_blank" rel="noopener" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-whatsapp px-6 font-bold text-white">
            <WhatsappLogo weight="fill" className="size-6" /> {t.continueWa}
          </a>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setStep(0);
              setForm((f) => ({ ...f, services: [], methods: [], notes: "" }));
            }}
            className="h-14 rounded-full px-6 font-bold text-ink ring-1 ring-inset ring-line"
          >
            {t.newRequest}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="relative overflow-hidden rounded-[2.5rem] rounded-tr-[5rem] bg-surface p-6 shadow-card ring-1 ring-line sm:p-10" noValidate>
      {/* Stepper */}
      <ol className="flex items-center gap-2">
        {t.steps.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => i < step && go(i)}
              className={cn(
                "grid size-11 shrink-0 place-items-center rounded-full font-mono text-sm font-bold transition",
                i < step ? "bg-lime text-[#071a2e]" : i === step ? "bg-brand-600 text-white ring-4 ring-neon/30 dark:bg-neon dark:text-[#071a2e]" : "bg-surface text-mute ring-1 ring-line",
              )}
              aria-current={i === step ? "step" : undefined}
            >
              {i < step ? <Check weight="bold" className="size-4" /> : i + 1}
            </button>
            <span className={cn("hidden text-sm font-medium sm:block", i === step ? "text-ink" : "text-mute")}>{s}</span>
            {i < t.steps.length - 1 && (
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                <motion.span className="block h-full rounded-full bg-neon" animate={{ width: i < step ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="relative mt-9 min-h-[25rem]">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 && (
              <fieldset>
                <legend className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{t.q1}</legend>
                <p className="mt-1 text-mute">{t.q1hint}</p>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {services.map((s) => {
                    const on = form.services.includes(s.name);
                    return (
                      <Choice key={s.slug} on={on} onClick={() => toggle("services", s.name)} className="flex items-center gap-3 py-3.5">
                        <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", on ? "bg-white/15 text-white dark:bg-[#071a2e]/10 dark:text-[#071a2e]" : "bg-tint text-accent")}>
                          <ServiceGlyph name={s.icon} className="size-6" />
                        </span>
                        <span>{s.name}</span>
                        {on && <Check weight="bold" className="ml-auto size-5 text-lime" />}
                      </Choice>
                    );
                  })}
                </div>
                <p className={cn(label, "mt-7")}>{t.methodsQ}</p>
                <div className="flex flex-wrap gap-2">
                  {methods.map((m) => (
                    <Choice key={m.key} on={form.methods.includes(m.code)} onClick={() => toggle("methods", m.code)} className="flex items-center gap-2 py-2.5">
                      <MethodGlyph name={m.key} className="size-5" /> {m.name}
                    </Choice>
                  ))}
                  <Choice on={form.methods.includes("?")} onClick={() => toggle("methods", "?")} className="py-2.5">
                    {t.unsure}
                  </Choice>
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset className="space-y-6">
                <legend className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{t.q2}</legend>
                <div>
                  <p className={label}>{t.quantity} *</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {t.quantities.map((q) => (
                      <Choice key={q} on={form.quantity === q} onClick={() => set("quantity", q)} className="text-center">
                        {q}
                      </Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={label}>{t.location} *</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {t.locations.map((l) => (
                      <Choice key={l} on={form.location === l} onClick={() => set("location", l)}>
                        {l}
                      </Choice>
                    ))}
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className={label}>{t.city}</span>
                    <input className={field} value={form.city} onChange={(e) => set("city", e.target.value)} autoComplete="address-level2" />
                  </label>
                  <div>
                    <p className={label}>{t.urgency}</p>
                    <div className="flex gap-1 rounded-2xl bg-surface-2 p-1 ring-1 ring-inset ring-line">
                      {t.urgencies.map((u, i) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => set("urgency", u)}
                          className={cn(
                            "flex-1 rounded-xl py-2.5 text-sm font-bold transition",
                            form.urgency === u ? ["bg-brand-600 text-white", "bg-vt text-[#071a2e]", "bg-pt text-white"][i] : "text-ink-soft hover:bg-surface",
                          )}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <label className="block">
                  <span className={label}>{t.notes}</span>
                  <textarea className={cn(field, "min-h-28 resize-y")} placeholder={t.notesPh} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
                </label>
              </fieldset>
            )}

            {step === 2 && (
              <fieldset className="space-y-5">
                <legend className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{t.q3}</legend>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className={label}>{t.name} *</span>
                    <input className={field} value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" required />
                  </label>
                  <label>
                    <span className={label}>{t.company}</span>
                    <input className={field} value={form.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" />
                  </label>
                  <label>
                    <span className={label}>{t.email} *</span>
                    <input className={field} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
                  </label>
                  <label>
                    <span className={label}>{t.phone} *</span>
                    <input className={field} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
                  </label>
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-surface-2 p-4 ring-1 ring-inset ring-line">
                  <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1 size-5 accent-brand-600" />
                  <span className="text-[0.98rem] text-ink-soft">
                    {t.consent}{" "}
                    <a href={policyHref} target="_blank" rel="noopener" className="font-bold text-accent underline underline-offset-4">
                      {t.consentLink}
                    </a>
                    . *
                  </span>
                </label>
              </fieldset>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-2xl bg-pt/10 px-4 py-3 font-bold text-pt">
          {error}
        </p>
      )}

      <div className="mt-7 flex items-center justify-between gap-3">
        <button type="button" onClick={() => go(step - 1)} className={cn("inline-flex h-14 items-center gap-2 rounded-full px-5 font-bold text-ink-soft transition hover:bg-surface-2", step === 0 && "invisible")}>
          <ArrowLeft weight="bold" className="size-5" /> {t.prev}
        </button>
        {step < 2 ? (
          <button type="button" onClick={() => go(step + 1)} className="group inline-flex h-14 items-center gap-3 rounded-full bg-brand-600 pl-6 pr-5 font-bold text-white transition hover:bg-brand-500 dark:bg-neon dark:text-[#071a2e]">
            {t.next}
            <ArrowRight weight="bold" className="size-4 transition group-hover:translate-x-0.5" />
          </button>
        ) : (
          <button type="submit" disabled={status === "sending"} className="inline-flex h-14 items-center gap-3 rounded-full bg-neon pl-6 pr-5 font-bold text-[#071a2e] shadow-neon transition hover:bg-lime disabled:opacity-60">
            {status === "sending" ? t.sending : t.send}
            <ArrowRight weight="bold" className="size-5" />
          </button>
        )}
      </div>
    </form>
  );
}
