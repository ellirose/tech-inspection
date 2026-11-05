// Chatbot endpoint (design document §12.3). The browser sends the visible conversation; the answer streams
// back as one JSON event per line (lib/chat/protocol.ts). Order: same-origin check, size and shape, turn
// limit, rate limits (per visitor and a daily cap for the whole site, which bounds the API bill), then the
// model (OpenAI Chat Completions). The API key stays on the server. Logs carry no conversation text.
import OpenAI from "openai";
import type { ChatCompletionMessageFunctionToolCall, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { ReasoningEffort } from "openai/resources/shared";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { hasDatabase } from "@/db";
import { locales } from "@/i18n/config";
import { knowledgeBase, topicInfo } from "@/lib/chat/knowledge";
import { pruneConversations, saveConversation, type ChatUsage } from "@/lib/chat/log";
import { systemPrompt } from "@/lib/chat/prompt";
import { CHAT_LIMITS, type ChatError, type ChatEvent } from "@/lib/chat/protocol";
import { chatTools, getServiceInfoInput, leadDraftInput, toDraft } from "@/lib/chat/tools";
import { getServices } from "@/lib/data/content";
import { hit, visitorKey } from "@/lib/rate-limit";

const MODEL = process.env.CHAT_MODEL || "gpt-5.4-mini";
/** Reasoning effort, for the models that take one (GPT-5 and later, o-series). "off" leaves it out. */
const EFFORT = process.env.CHAT_EFFORT || "low";
const reasoning = EFFORT !== "off" && /^(gpt-[5-9]|o\d)/.test(MODEL) && !MODEL.includes("chat");
/** Model calls per visitor message: answers that look something up take two. */
const MAX_ROUNDS = 4;

const limits = [
  { name: "chat:10m", max: 20, windowSeconds: 600 },
  { name: "chat:day", max: 120, windowSeconds: 86_400 },
];
const siteLimit = () => [{ name: "chat:site:day", max: Number(process.env.CHAT_DAILY_LIMIT) || 2000, windowSeconds: 86_400 }];

const chatRequest = z.object({
  conversationId: z.uuid(),
  lang: z.enum(locales),
  page: z.string().max(300).optional(),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(CHAT_LIMITS.messageChars * 3) }))
    .min(1)
    .max(CHAT_LIMITS.userTurns * 4),
});

const fail = (error: ChatError, status: number, headers?: HeadersInit) =>
  Response.json({ type: "error", error } satisfies ChatEvent, { status, headers: { "Cache-Control": "no-store", ...headers } });

const clientIp = (request: NextRequest) => request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

/** Arguments of a tool call; null when the model produced something that is not a JSON object. */
const parseArgs = (raw: string): Record<string, unknown> | null => {
  try {
    const value: unknown = JSON.parse(raw || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};

let client: OpenAI | undefined;

export async function POST(request: NextRequest) {
  // Only the site's own pages may use the bot (and spend its API budget).
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.headers.get("host")) return fail("invalid", 403);
  // The bot needs its key, and the database for limits and the conversation log.
  if (!process.env.OPENAI_API_KEY || !hasDatabase) return fail("disabled", 503);
  if (Number(request.headers.get("content-length") ?? 0) > 128 * 1024) return fail("invalid", 413);

  const parsed = chatRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("invalid", 422);
  const { conversationId, lang, page } = parsed.data;
  // The conversation starts with the visitor; the widget's own greeting is not sent.
  const history = parsed.data.messages.slice(parsed.data.messages.findIndex((m) => m.role === "user"));
  const userTurns = history.filter((m) => m.role === "user");
  const last = history.at(-1);
  if (!last || last.role !== "user" || last.content.length > CHAT_LIMITS.messageChars) return fail("invalid", 422);
  if (userTurns.length > CHAT_LIMITS.userTurns || history.reduce((n, m) => n + m.content.length, 0) > CHAT_LIMITS.historyChars) return fail("limit", 429);

  const visitor = await hit(visitorKey(clientIp(request)), limits);
  if (!visitor.ok) return fail("rate_limited", 429, { "Retry-After": String(visitor.retryAfter) });
  if (!(await hit("all", siteLimit())).ok) return fail("busy", 503);

  const [knowledge, services] = await Promise.all([knowledgeBase(lang), getServices()]);
  const knownServices = new Set(services.map((s) => s.slug));
  client ??= new OpenAI();
  const openai = client;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatEvent) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      const usage: ChatUsage = { input: 0, cached: 0, output: 0 };
      // The system prompt comes first and is the same for every visitor in a language, so OpenAI's
      // automatic prompt caching applies to it.
      const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt(lang, knowledge) },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ];
      let answer = "";
      let jsonRetries = 0;

      try {
        for (let round = 0; round < MAX_ROUNDS; round++) {
          const turn = await openai.chat.completions.create(
            {
              model: MODEL,
              max_completion_tokens: 4000,
              ...(reasoning ? { reasoning_effort: EFFORT as ReasoningEffort } : {}),
              messages,
              tools: chatTools,
              stream: true,
              stream_options: { include_usage: true },
              prompt_cache_key: `ti-chat-${lang}`,
            },
            { signal: request.signal },
          );

          let roundText = "";
          let refused = false;
          let finish: string | null = null;
          const calls: { id: string; name: string; args: string }[] = [];
          for await (const chunk of turn) {
            if (chunk.usage) {
              const cached = chunk.usage.prompt_tokens_details?.cached_tokens ?? 0;
              usage.input += chunk.usage.prompt_tokens - cached;
              usage.cached += cached;
              usage.output += chunk.usage.completion_tokens;
            }
            const choice = chunk.choices[0];
            if (!choice) continue;
            const delta = choice.delta;
            if (delta.refusal) refused = true;
            if (delta.content) {
              // Text after a lookup continues the same answer, as a new paragraph.
              const prefix = !roundText && answer ? "\n\n" : "";
              roundText += delta.content;
              send({ type: "text", text: prefix + delta.content });
            }
            // Tool calls arrive in pieces, keyed by their position.
            for (const piece of delta.tool_calls ?? []) {
              const call = (calls[piece.index] ??= { id: "", name: "", args: "" });
              if (piece.id) call.id = piece.id;
              if (piece.function?.name) call.name += piece.function.name;
              if (piece.function?.arguments) call.args += piece.function.arguments;
            }
            if (choice.finish_reason) finish = choice.finish_reason;
          }

          if (refused || finish === "content_filter") {
            if (roundText) answer += (answer ? "\n\n" : "") + roundText;
            send({ type: "contact" });
            break;
          }
          const found = calls.filter(Boolean);
          if (found.length === 0) {
            if (roundText) answer += (answer ? "\n\n" : "") + roundText;
            break;
          }
          // A tool input cut off by the token limit can still look valid: do not act on it.
          if (finish === "length") throw new Error("tool input truncated");
          const inputs = found.map((c) => parseArgs(c.args));
          if (inputs.some((i) => i === null)) {
            // A tool input that could not be parsed at all: generate the turn again (twice at most).
            if (request.signal.aborted || jsonRetries++ >= 2) throw new Error("tool input is not valid JSON");
            if (roundText) {
              send({ type: "reset" });
              if (answer) send({ type: "text", text: answer });
            }
            round--;
            continue;
          }
          jsonRetries = 0;
          if (roundText) answer += (answer ? "\n\n" : "") + roundText;

          let shown = false;
          const results: ChatCompletionMessageParam[] = [];
          const reply = (id: string, content: string) => results.push({ role: "tool", tool_call_id: id, content });
          for (const [i, call] of found.entries()) {
            const args = inputs[i];
            if (call.name === "get_service_info") {
              const input = getServiceInfoInput.safeParse(args);
              const info = input.success ? await topicInfo(input.data.topic, lang) : null;
              reply(call.id, info ?? "Error: unknown topic. Use a service slug or method key from the knowledge base.");
            } else if (call.name === "create_lead") {
              const input = leadDraftInput.safeParse(args);
              if (input.success) {
                send({ type: "lead", draft: toDraft(input.data, knownServices) });
                shown = true;
              } else {
                const problems = input.error.issues.map((p) => `${p.path.join(".") || "input"}: ${p.message}`).join("; ");
                reply(call.id, `Error: not shown to the visitor. Fix or ask for: ${problems}`);
              }
            } else if (call.name === "show_contact") {
              send({ type: "contact" });
              shown = true;
            } else {
              reply(call.id, "Error: unknown tool.");
            }
          }
          // A card on screen ends the turn: the visitor acts on it next.
          if (shown) break;
          const toolCalls: ChatCompletionMessageFunctionToolCall[] = found.map((c) => ({ id: c.id, type: "function", function: { name: c.name, arguments: c.args || "{}" } }));
          messages.push({ role: "assistant", content: roundText || null, tool_calls: toolCalls });
          messages.push(...results);
        }
        send({ type: "done" });
      } catch (error) {
        if (!request.signal.aborted) {
          const busy = error instanceof OpenAI.RateLimitError || error instanceof OpenAI.InternalServerError;
          console.error("[chat] model call failed:", error instanceof OpenAI.APIError ? `${error.status} ${error.name}` : (error as Error).message);
          send({ type: "error", error: busy ? "busy" : "server" });
        }
      } finally {
        controller.close();
      }
      // The visitor already has the whole answer; logging happens after the stream has ended.
      try {
        const sent = parsed.data.messages.map((m) => ({ role: m.role, text: m.content }));
        await saveConversation({ id: conversationId, lang, page, model: MODEL, usage, messages: answer ? [...sent, { role: "assistant", text: answer }] : sent });
        await pruneConversations();
      } catch (error) {
        console.error("[chat] could not log conversation:", (error as { cause?: Error }).cause?.message ?? (error as Error).name);
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" } });
}
