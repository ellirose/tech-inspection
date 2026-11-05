// /api/chat end to end against a stand-in for OpenAI Chat Completions (no real API call, no database):
// streaming text, a lookup tool round, a lead card, a retry after broken tool JSON, and what is sent.
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({ hasDatabase: true }));
vi.mock("@/lib/rate-limit", () => ({ hit: async () => ({ ok: true }), visitorKey: (ip: string) => ip }));
vi.mock("@/lib/data/content", () => ({ getServices: async () => [{ slug: "inspeccion-ndt" }] }));
vi.mock("@/lib/chat/knowledge", () => ({
  knowledgeBase: async () => "## Company\nTECH-INSPECTION",
  topicInfo: async (topic: string) => (topic === "ut" ? "Ultrasonido (UT): espesores y defectos internos." : null),
}));
const saved = vi.hoisted(() => [] as { model: string; usage: { input: number; cached: number; output: number }; messages: { role: string; text: string }[] }[]);
vi.mock("@/lib/chat/log", () => ({ saveConversation: async (e: (typeof saved)[number]) => void saved.push(e), pruneConversations: async () => {} }));

type Body = { model: string; messages: { role: string; content: string | null; tool_calls?: unknown[]; tool_call_id?: string }[]; [k: string]: unknown };
const requests: Body[] = [];
let badSeen = 0;

const chunk = (delta: object, finish: string | null = null) => ({ id: "c", object: "chat.completion.chunk", created: 0, model: "m", choices: [{ index: 0, delta, finish_reason: finish }] });
const usage = { id: "c", object: "chat.completion.chunk", created: 0, model: "m", choices: [], usage: { prompt_tokens: 1500, completion_tokens: 40, total_tokens: 1540, prompt_tokens_details: { cached_tokens: 1024 } } };
const text = (s: string) => [chunk({ role: "assistant", content: "" }), ...s.match(/.{1,12}/g)!.map((p) => chunk({ content: p })), chunk({}, "stop")];
const toolCall = (name: string, args: string) => [
  chunk({ role: "assistant", tool_calls: [{ index: 0, id: "call_1", type: "function", function: { name, arguments: "" } }] }),
  chunk({ tool_calls: [{ index: 0, function: { arguments: args.slice(0, 5) } }] }),
  chunk({ tool_calls: [{ index: 0, function: { arguments: args.slice(5) } }] }),
  chunk({}, "tool_calls"),
];

let server: Server;
let POST: (request: Request) => Promise<Response>;

beforeAll(async () => {
  server = createServer((req, res) => {
    let raw = "";
    req.on("data", (d) => (raw += d));
    req.on("end", () => {
      const body = JSON.parse(raw) as Body;
      requests.push(body);
      const last = body.messages.at(-1)!;
      const lastUser = [...body.messages].reverse().find((m) => m.role === "user")?.content ?? "";
      const out =
        last.role === "tool"
          ? text(`Según la ficha: ${last.content}`)
          : lastUser.startsWith("ut")
            ? toolCall("get_service_info", '{"topic":"ut"}')
            : lastUser.startsWith("lead")
              ? [chunk({ role: "assistant", content: "Le muestro el resumen." }), ...toolCall("create_lead", JSON.stringify({ name: "Ana Prueba", email: "ana@example.com", methods: ["ut"], services: ["inspeccion-ndt", "no-existe"] }))]
              : lastUser.startsWith("bad") && badSeen++ === 0
                ? toolCall("get_service_info", '{"topic": "ut"')
                : text("Hola, ¿en qué le ayudo?");
      res.writeHead(200, { "content-type": "text/event-stream" });
      for (const c of [...out, usage]) res.write(`data: ${JSON.stringify(c)}\n\n`);
      res.end("data: [DONE]\n\n");
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  process.env.OPENAI_API_KEY = "sk-test";
  process.env.OPENAI_BASE_URL = `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`;
  ({ POST } = (await import("@/app/api/chat/route")) as unknown as { POST: typeof POST });
});

afterAll(() => server.close());

const ask = async (content: string) => {
  const body = JSON.stringify({ conversationId: crypto.randomUUID(), lang: "es", page: "/es", messages: [{ role: "assistant", content: "Hola" }, { role: "user", content }] });
  const res = await POST(new Request("http://site.test/api/chat", { method: "POST", body, headers: { origin: "http://site.test", host: "site.test", "content-type": "application/json" } }));
  const events = (await res.text()).trim().split("\n").map((l) => JSON.parse(l) as { type: string; text?: string; draft?: { services: string[] } });
  return { status: res.status, events, said: events.filter((e) => e.type === "text").map((e) => e.text).join("") };
};

describe("/api/chat with OpenAI", () => {
  it("streams a plain answer and logs its usage", async () => {
    const r = await ask("hola");
    expect(r.status).toBe(200);
    expect(r.said).toBe("Hola, ¿en qué le ayudo?");
    expect(r.events.at(-1)).toEqual({ type: "done" });
    expect(saved.at(-1)!.usage).toEqual({ input: 476, cached: 1024, output: 40 });
  });

  it("sends the system prompt first, the tools as functions and the reasoning effort", () => {
    const body = requests[0];
    expect(body.messages.map((m) => m.role)).toEqual(["system", "user"]);
    expect(body).toMatchObject({ model: "gpt-5.4-mini", reasoning_effort: "low", max_completion_tokens: 4000, stream: true, stream_options: { include_usage: true } });
    expect((body.tools as { type: string; function: { name: string } }[]).map((t) => `${t.type}:${t.function.name}`)).toEqual(["function:get_service_info", "function:create_lead", "function:show_contact"]);
  });

  it("runs a lookup and answers with its result", async () => {
    const r = await ask("ut, ¿qué es?");
    expect(r.said).toBe("Según la ficha: Ultrasonido (UT): espesores y defectos internos.");
    const second = requests.at(-1)!;
    expect(second.messages.map((m) => m.role)).toEqual(["system", "user", "assistant", "tool"]);
    expect(second.messages[2].tool_calls).toEqual([{ id: "call_1", type: "function", function: { name: "get_service_info", arguments: '{"topic":"ut"}' } }]);
    expect(second.messages[3].tool_call_id).toBe("call_1");
  });

  it("shows a lead card with only the site's services, and ends the turn", async () => {
    const before = requests.length;
    const r = await ask("lead, por favor");
    expect(r.said).toBe("Le muestro el resumen.");
    expect(r.events.find((e) => e.type === "lead")?.draft?.services).toEqual(["inspeccion-ndt"]);
    expect(requests.length - before).toBe(1);
  });

  it("generates the turn again when a tool input is not valid JSON", async () => {
    const before = requests.length;
    const r = await ask("bad");
    expect(r.said).toBe("Hola, ¿en qué le ayudo?");
    expect(requests.length - before).toBe(2);
  });
});
