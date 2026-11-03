"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Paperclip } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { MethodKey } from "@/content/methods";
import type { ServiceIcon } from "@/content/services";
import { MethodGlyph, ServiceGlyph } from "@/components/ui/Icons";
import { Turnstile, TURNSTILE_SITE_KEY } from "@/components/leads/Turnstile";
import { saveThanks, submitLead } from "@/lib/leads/client";
import { ATTACHMENTS, formatBytes, labelFor, locationKeys, quantityKeys, urgencyKeys, type LeadMethod, type LocationKey, type QuantityKey, type UrgencyKey } from "@/lib/leads/options";
import { cn } from "@/lib/cn";

type Props = {
  lang: Locale;
  t: Dictionary["quote"];
  services: { slug: string; icon: ServiceIcon; name: string }[];
  methods: { key: MethodKey; code: string; name: string }[];
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

export function QuoteWizard({ lang, t, services, methods, policyHref }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  // Answers are stored as keys; labels come from the dictionary (see lib/leads/options.ts).
  const [form, setForm] = useState({
    services: [] as string[],
    methods: [] as LeadMethod[],
    quantity: "" as QuantityKey | "",
    location: "" as LocationKey | "",
    city: "",
    urgency: "scheduled" as UrgencyKey,
    notes: "",
    name: "",
    company: "",
    email: "",
    phone: "",
    consent: false,
    website: "",
  });
  // Files stay out of `form`: they are sent as they are, next to the answers.
  const [files, setFiles] = useState<File[]>([]);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = <K extends "services" | "methods">(k: K, v: (typeof form)[K][number]) => {
    const list = form[k] as string[];
    set(k, (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]) as (typeof form)[K]);
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = [...files, ...(e.target.files ?? [])];
    e.target.value = "";
    const accepted = next.every((f) => ATTACHMENTS.accept.split(",").includes(f.type) || ATTACHMENTS.extensions.test(f.name));
    const total = next.reduce((sum, f) => sum + f.size, 0);
    if (!accepted || next.length > ATTACHMENTS.maxFiles || total > ATTACHMENTS.maxBytes) return setError(t.filesError);
    setError("");
    setFiles(next);
  };

  const valid = [form.services.length > 0, !!form.quantity && !!form.location, !!form.name && (!!form.email || !!form.phone) && form.consent];

  const go = (to: number) => {
    if (to > step && !valid[step]) return setError(t.required);
    setError("");
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  const summary = (reference: string) =>
    [
      `${t.waIntro} ${reference}`,
      `• ${form.services.map((slug) => services.find((s) => s.slug === slug)?.name ?? slug).join(", ")}`,
      form.methods.length ? `• ${form.methods.map((k) => (k === "unsure" ? t.unsure : methods.find((m) => m.key === k)?.code)).join(", ")}` : "",
      `• ${labelFor(quantityKeys, t.quantities, form.quantity || undefined)} · ${labelFor(locationKeys, t.locations, form.location || undefined)}${form.city ? ` (${form.city})` : ""} · ${labelFor(urgencyKeys, t.urgencies, form.urgency)}`,
      form.notes ? `• ${form.notes}` : "",
      `• ${form.name}${form.company ? ` — ${form.company}` : ""}`,
    ]
      .filter(Boolean)
      .join("\n");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid[2]) return setError(t.required);
    if (TURNSTILE_SITE_KEY && !token) return setError(t.captcha);
    setSending(true);
    setError("");
    const { notes, quantity, location, ...rest } = form;
    const res = await submitLead({
      ...rest,
      source: "form_quote",
      lang,
      description: notes,
      quantity: quantity || undefined,
      location: location || undefined,
      turnstileToken: token ?? undefined,
    }, files);
    if (res.ok) {
      saveThanks({ reference: res.reference, whatsappText: summary(res.reference), emailed: !!form.email });
      return router.push(`/${lang}/gracias`);
    }
    setSending(false);
    setAttempt((n) => n + 1);
    if (res.error === "files") {
      setDir(-1);
      setStep(1);
    }
    setError({ invalid: t.invalid, files: t.filesError, rate_limited: t.rateLimited, captcha: t.captcha, server: t.error }[res.error]);
  };

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
                    const on = form.services.includes(s.slug);
                    return (
                      <Choice key={s.slug} on={on} onClick={() => toggle("services", s.slug)} className="flex items-center gap-3 py-3.5">
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
                    <Choice key={m.key} on={form.methods.includes(m.key)} onClick={() => toggle("methods", m.key)} className="flex items-center gap-2 py-2.5">
                      <MethodGlyph name={m.key} className="size-5" /> {m.name}
                    </Choice>
                  ))}
                  <Choice on={form.methods.includes("unsure")} onClick={() => toggle("methods", "unsure")} className="py-2.5">
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
                    {t.quantities.map((q, i) => (
                      <Choice key={q} on={form.quantity === quantityKeys[i]} onClick={() => set("quantity", quantityKeys[i])} className="text-center">
                        {q}
                      </Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={label}>{t.location} *</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {t.locations.map((l, i) => (
                      <Choice key={l} on={form.location === locationKeys[i]} onClick={() => set("location", locationKeys[i])}>
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
                          onClick={() => set("urgency", urgencyKeys[i])}
                          className={cn(
                            "flex-1 rounded-xl py-2.5 text-sm font-bold transition",
                            form.urgency === urgencyKeys[i] ? ["bg-brand-600 text-white", "bg-vt text-[#071a2e]", "bg-pt text-white"][i] : "text-ink-soft hover:bg-surface",
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
                <div>
                  <p className={label}>{t.files}</p>
                  <p id="quote-files-hint" className="-mt-1 mb-3 text-sm text-mute">
                    {t.filesHint}
                  </p>
                  {files.length > 0 && (
                    <ul className="mb-3 space-y-2">
                      {files.map((f, i) => (
                        <li key={`${f.name}-${f.size}-${i}`} className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-2.5 ring-1 ring-inset ring-line">
                          <Paperclip weight="bold" className="size-4 shrink-0 text-accent" aria-hidden />
                          <span className="min-w-0 flex-1 truncate font-medium text-ink">{f.name}</span>
                          <span className="shrink-0 text-sm text-mute">{formatBytes(f.size, lang)}</span>
                          <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="shrink-0 text-sm font-bold text-accent" aria-label={`${t.filesRemove}: ${f.name}`}>
                            {t.filesRemove}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {files.length < ATTACHMENTS.maxFiles && (
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-surface px-5 py-3 font-bold text-ink ring-1 ring-inset ring-line transition hover:ring-accent/40 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-neon">
                      <Paperclip weight="bold" className="size-5 text-accent" aria-hidden />
                      {t.filesAdd}
                      <input type="file" multiple accept={ATTACHMENTS.accept} onChange={addFiles} aria-describedby="quote-files-hint" className="sr-only" />
                    </label>
                  )}
                </div>
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
                {/* Honeypot: off-screen and skipped by keyboard and screen readers, so only bots fill it. */}
                <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
                  <label>
                    {t.honeypot}
                    <input tabIndex={-1} autoComplete="off" name="website" value={form.website} onChange={(e) => set("website", e.target.value)} />
                  </label>
                </div>
                <Turnstile lang={lang} onToken={setToken} resetKey={attempt} />
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
        {/* Separate keys: if React reused one element for both, the click on "next" that reaches the last step
            would turn it into the submit button mid-click and send the form at once. */}
        {step < 2 ? (
          <button key="next" type="button" onClick={() => go(step + 1)} className="group inline-flex h-14 items-center gap-3 rounded-full bg-brand-600 pl-6 pr-5 font-bold text-white transition hover:bg-brand-500 dark:bg-neon dark:text-[#071a2e]">
            {t.next}
            <ArrowRight weight="bold" className="size-4 transition group-hover:translate-x-0.5" />
          </button>
        ) : (
          <button key="send" type="submit" disabled={sending} className="inline-flex h-14 items-center gap-3 rounded-full bg-neon pl-6 pr-5 font-bold text-[#071a2e] shadow-neon transition hover:bg-lime disabled:opacity-60">
            {sending ? t.sending : t.send}
            <ArrowRight weight="bold" className="size-5" />
          </button>
        )}
      </div>
    </form>
  );
}
