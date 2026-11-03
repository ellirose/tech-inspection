// Chatbot endpoint (design document §12.3). The browser sends the visible conversation; the answer streams
// back as one JSON event per line (lib/chat/protocol.ts). Order: same-origin check, size and shape, turn
// limit, rate limits (per visitor and a daily cap for the whole site, which bounds the API bill), then the
// model. The API key stays on the server. Logs carry no conversation text.
import Anthropic from "@anthropic-ai/sdk";
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

const MODEL = process.env.CHAT_MODEL || "claude-opus-5-5";
const EFFORT = (process.env.CHAT_EFFORT || "low") as Anthropic.OutputConfig["effort"];
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

let client: Anthropic | undefined;

export async function POST(request: NextRequest) {
  // Only the site's own pages may use the bot (and spend its API budget).
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.headers.get("host")) return fail("invalid", 403);
  // The bot needs its key, and the database for limits and the conversation log.
  if (!process.env.ANTHROPIC_API_KEY || !hasDatabase) return fail("disabled", 503);
  if (Number(request.headers.get("content-length") ?? 0) > 128 * 1024) return fail("invalid", 413);

  const parsed = chatRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("invalid", 422);
  const { conversationId, lang, page } = parsed.data;
  // The API needs the conversation to start with the visitor; the widget's own greeting is not sent.
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
  client ??= new Anthropic();
  const anthropic = client;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatEvent) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      const usage: ChatUsage = { input: 0, cached: 0, output: 0 };
      const messages: Anthropic.MessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));
      let answer = "";
      let jsonRetries = 0;

      try {
        for (let round = 0; round < MAX_ROUNDS; round++) {
          const turn = anthropic.messages.stream(
            {
              model: MODEL,
              max_tokens: 4000,
              output_config: { effort: EFFORT },
              system: [{ type: "text", text: systemPrompt(lang, knowledge), cache_control: { type: "ephemeral" } }],
              tools: chatTools,
              messages,
            },
            { signal: request.signal },
          );
          let roundText = "";
          turn.on("text", (delta) => {
            // Text after a lookup continues the same answer, as a new paragraph.
            const prefix = !roundText && answer ? "\n\n" : "";
            roundText += delta;
            send({ type: "text", text: prefix + delta });
          });

          let message: Anthropic.Message;
          try {
            message = await turn.finalMessage();
            jsonRetries = 0;
          } catch (error) {
            // A tool input that could not be parsed at all: generate the turn again (twice at most).
            if (error instanceof Anthropic.APIError || request.signal.aborted || jsonRetries++ >= 2) throw error;
            if (roundText) {
              send({ type: "reset" });
              if (answer) send({ type: "text", text: answer });
            }
            round--;
            continue;
          }
          if (roundText) answer += (answer ? "\n\n" : "") + roundText;
          usage.input += message.usage.input_tokens + (message.usage.cache_creation_input_tokens ?? 0);
          usage.cached += message.usage.cache_read_input_tokens ?? 0;
          usage.output += message.usage.output_tokens;

          if (message.stop_reason === "refusal") {
            send({ type: "contact" });
            break;
          }
          const calls = message.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
          if (calls.length === 0) break;
          // A tool input cut off by the token limit can still look valid: do not act on it.
          if (message.stop_reason === "max_tokens") throw new Error("tool input truncated");

          let shown = false;
          const results: Anthropic.ToolResultBlockParam[] = [];
          for (const call of calls) {
            if (call.name === "get_service_info") {
              const input = getServiceInfoInput.safeParse(call.input);
              const info = input.success ? await topicInfo(input.data.topic, lang) : null;
              results.push({ type: "tool_result", tool_use_id: call.id, content: info ?? "Unknown topic. Use a service slug or method key from the knowledge base.", is_error: !info });
            } else if (call.name === "create_lead") {
              const input = leadDraftInput.safeParse(call.input);
              if (input.success) {
                send({ type: "lead", draft: toDraft(input.data, knownServices) });
                shown = true;
              } else {
                const problems = input.error.issues.map((i) => `${i.path.join(".") || "input"}: ${i.message}`).join("; ");
                results.push({ type: "tool_result", tool_use_id: call.id, content: `Not shown to the visitor. Fix or ask for: ${problems}`, is_error: true });
              }
            } else if (call.name === "show_contact") {
              send({ type: "contact" });
              shown = true;
            } else {
              results.push({ type: "tool_result", tool_use_id: call.id, content: "Unknown tool.", is_error: true });
            }
          }
          // A card on screen ends the turn: the visitor acts on it next.
          if (shown) break;
          messages.push({ role: "assistant", content: message.content });
          messages.push({ role: "user", content: results });
        }
        send({ type: "done" });
      } catch (error) {
        if (!request.signal.aborted) {
          const busy = error instanceof Anthropic.RateLimitError || error instanceof Anthropic.InternalServerError || (error instanceof Anthropic.APIError && error.status === 529);
          console.error("[chat] model call failed:", error instanceof Anthropic.APIError ? `${error.status} ${error.name}` : (error as Error).message);
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
