import { describe, expect, it } from "vitest";
import { leadInput } from "@/lib/leads/input";
import { splitContact } from "@/lib/leads/options";

const wizard = {
  source: "form_quote",
  lang: "es",
  services: ["tuberia"],
  methods: ["ut", "unsure"],
  quantity: "11-50",
  location: "field",
  city: "",
  urgency: "priority",
  description: "",
  name: "  Ana Gómez ",
  company: "",
  email: "ana@example.com",
  phone: "",
  consent: true,
  website: "",
  attribution: { utmSource: "google", landingPage: "/es?utm_source=google" },
};

describe("leadInput", () => {
  it("accepts a wizard submission and drops blank optional fields", () => {
    const lead = leadInput.parse(wizard);
    expect(lead).toMatchObject({ name: "Ana Gómez", email: "ana@example.com", quantity: "11-50", urgency: "priority" });
    expect(lead.city).toBeUndefined();
    expect(lead.phone).toBeUndefined();
    expect(lead.attribution).toEqual({ utmSource: "google", landingPage: "/es?utm_source=google" });
  });

  it("requires consent, a way to reply and something to inspect", () => {
    expect(leadInput.safeParse({ ...wizard, consent: false }).success).toBe(false);
    expect(leadInput.safeParse({ ...wizard, email: "", phone: "" }).success).toBe(false);
    expect(leadInput.safeParse({ ...wizard, services: [], methods: [] }).success).toBe(false);
  });

  it("rejects malformed values instead of storing them", () => {
    expect(leadInput.safeParse({ ...wizard, email: "not-an-email" }).success).toBe(false);
    expect(leadInput.safeParse({ ...wizard, phone: "12ab" }).success).toBe(false);
    expect(leadInput.safeParse({ ...wizard, quantity: "1–10" }).success).toBe(false);
    expect(leadInput.safeParse({ ...wizard, services: ["<script>"] }).success).toBe(false);
    expect(leadInput.safeParse({ ...wizard, lang: "fr" }).success).toBe(false);
  });

  it("splits the assistant's single contact answer into email or phone", () => {
    const base = { source: "chatbot", lang: "pt", description: "Brocas PDC", name: "João", consent: true };
    expect(leadInput.parse({ ...base, contact: "Joao@Empresa.com.br" })).toMatchObject({ email: "joao@empresa.com.br" });
    expect(leadInput.parse({ ...base, contact: "+57 321 828 4129" })).toMatchObject({ phone: "+57 321 828 4129" });
    expect(leadInput.safeParse({ ...base, contact: "mañana" }).success).toBe(false);
  });

  it("keeps the honeypot value so the route can drop the submission", () => {
    expect(leadInput.parse({ ...wizard, website: "http://spam.example" }).website).toBe("http://spam.example");
  });
});

describe("splitContact", () => {
  it("does not overwrite a field the visitor already filled", () => {
    expect(splitContact("otro@example.com", { email: "ana@example.com" })).toEqual({ email: "ana@example.com" });
    expect(splitContact("123")).toEqual({});
  });
});
