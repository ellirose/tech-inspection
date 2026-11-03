import { describe, expect, it } from "vitest";
import { splitReplies } from "@/lib/chat/protocol";
import { systemPrompt } from "@/lib/chat/prompt";
import { chatTools, leadDraftInput, toDraft } from "@/lib/chat/tools";

describe("quick replies", () => {
  it("reads the options line at the end of an answer", () => {
    expect(splitReplies("¿Cuántas piezas?\n<<1–10|11–50| 51–200 |Más de 200>>")).toEqual({ text: "¿Cuántas piezas?", replies: ["1–10", "11–50", "51–200", "Más de 200"] });
    expect(splitReplies("Sin opciones.")).toEqual({ text: "Sin opciones.", replies: [] });
  });

  it("hides a marker that is still arriving", () => {
    expect(splitReplies("¿Dónde se realiza?\n<<En nuestra ba").text).toBe("¿Dónde se realiza?");
    expect(splitReplies("¿Dónde se realiza?\n<").text).toBe("¿Dónde se realiza?\n");
  });

  it("drops empty and overlong options and keeps five at most", () => {
    expect(splitReplies(`x <<a||${"b".repeat(61)}|c|d|e|f|g>>`).replies).toEqual(["a", "c", "d", "e", "f"]);
  });
});

describe("create_lead", () => {
  const base = { name: "Ana Ruiz", email: "ana@example.com", services: ["tuberia"], quantity: "11-50", location: "field", city: "Yopal", urgency: "priority" };

  it("accepts a complete request and keeps only services that exist", () => {
    const parsed = leadDraftInput.parse({ ...base, services: ["tuberia", "no-existe"], methods: ["ut"], industry: " Perforación ", company: "" });
    expect(parsed.industry).toBe("Perforación");
    expect(parsed.company).toBeUndefined();
    expect(toDraft(parsed, new Set(["tuberia"])).services).toEqual(["tuberia"]);
  });

  it("explains what is missing, so the model can ask for it", () => {
    const noContact = leadDraftInput.safeParse({ ...base, email: undefined });
    expect(noContact.success).toBe(false);
    expect(noContact.error?.issues[0].message).toMatch(/email or a phone/);
    expect(leadDraftInput.safeParse({ ...base, email: "ana@" }).success).toBe(false);
    expect(leadDraftInput.safeParse({ ...base, phone: "12" , email: undefined }).success).toBe(false);
    expect(leadDraftInput.safeParse({ ...base, quantity: "about 30" }).success).toBe(false);
    expect(leadDraftInput.safeParse({ name: "Ana", phone: "+57 321 828 4129" }).success).toBe(false);
  });

  it("declares the same fields to the model as it validates", () => {
    const tool = chatTools.find((t) => t.name === "create_lead")!;
    expect(Object.keys(tool.input_schema.properties!).sort()).toEqual(Object.keys(leadDraftInput.shape).sort());
  });
});

describe("chat tools and prompt", () => {
  it("defines each tool once, closed to extra fields", () => {
    expect(chatTools.map((t) => t.name)).toEqual(["get_service_info", "create_lead", "show_contact"]);
    for (const t of chatTools) expect(t.input_schema.additionalProperties).toBe(false);
  });

  it("states the rules of the design document in the visitor's language", () => {
    const es = systemPrompt("es", "## Company\nTECH-INSPECTION");
    expect(es).toContain("Colombia (es-CO)");
    expect(es).toContain('"usted"');
    expect(es).toMatch(/Never give prices/);
    expect(es).toMatch(/certified inspector/);
    expect(es).toMatch(/80 words/);
    expect(es.endsWith("## Company\nTECH-INSPECTION")).toBe(true);
    expect(systemPrompt("en", "kb")).toContain("Write in English");
  });
});
