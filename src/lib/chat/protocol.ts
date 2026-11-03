// What the chat widget and /api/chat exchange (design document §12.3). The browser keeps the conversation
// for the session and sends the visible text of every turn with each request; the server answers with one
// JSON event per line. Shared by both sides, so nothing here may import server code.
import type { Locale } from "@/i18n/config";
import type { LocationKey, LeadMethod, QuantityKey, UrgencyKey } from "@/lib/leads/options";

export const CHAT_LIMITS = {
  /** Characters in one visitor message. */
  messageChars: 1000,
  /** Visitor messages in one conversation; past this the widget offers WhatsApp instead. */
  userTurns: 30,
  /** Characters across the whole history sent with a request. */
  historyChars: 40_000,
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ChatRequest = {
  /** Random id the browser keeps for its session (crypto.randomUUID). */
  conversationId: string;
  lang: Locale;
  /** Path of the page the chat was opened on. */
  page?: string;
  messages: ChatMessage[];
};

/** A quote request the bot has put together; it becomes a lead only when the visitor confirms the card. */
export type LeadDraft = {
  services: string[];
  methods: LeadMethod[];
  industry?: string;
  component?: string;
  quantity?: QuantityKey;
  location?: LocationKey;
  city?: string;
  urgency?: UrgencyKey;
  description?: string;
  name: string;
  company?: string;
  role?: string;
  email?: string;
  phone?: string;
  preferredChannel?: "email" | "phone" | "whatsapp";
};

export type ChatError = "disabled" | "invalid" | "limit" | "rate_limited" | "busy" | "server";

export type ChatEvent =
  | { type: "text"; text: string }
  /** Discard the text of the current answer: the turn is being generated again. */
  | { type: "reset" }
  | { type: "lead"; draft: LeadDraft }
  | { type: "contact" }
  | { type: "done" }
  | { type: "error"; error: ChatError };

/**
 * Notes the widget adds to the history it sends, so the model knows what the visitor saw or did outside
 * the text: cards shown, a request confirmed. Written in English for the model; never shown on screen.
 */
export const chatNotes = {
  leadCard: "[Website: the request summary card with the consent checkbox and the confirm button is now shown to the visitor.]",
  leadSent: (reference: string) => `[Website: the visitor gave consent and confirmed. The request was stored with reference ${reference}; the team replies during business hours.]`,
  leadClosed: "[Website: the visitor closed the summary card without sending it.]",
  contactCard: "[Website: buttons for WhatsApp and the phone line are now shown to the visitor.]",
  platform: "[Website: the visitor was given the TI-QMS sign-in link.]",
};

/**
 * Quick replies: the bot may end an answer with a line such as `<<Sí|No|No estoy seguro>>`. Returns the
 * text without that line and the options. While the answer is still streaming, an unfinished marker is
 * hidden too, so the visitor never sees the brackets.
 */
export function splitReplies(text: string): { text: string; replies: string[] } {
  const done = text.match(/\n?\s*<<([^<>]*)>>\s*$/);
  if (done) {
    const replies = done[1]
      .split("|")
      .map((r) => r.trim())
      .filter((r) => r && r.length <= 60)
      .slice(0, 5);
    return { text: text.slice(0, done.index).trimEnd(), replies };
  }
  const open = text.lastIndexOf("<<");
  if (open !== -1 && !text.slice(open).includes(">>")) return { text: text.slice(0, open).trimEnd(), replies: [] };
  // The first "<" of a marker that has only begun to arrive.
  return { text: text.endsWith("<") ? text.slice(0, -1) : text, replies: [] };
}
