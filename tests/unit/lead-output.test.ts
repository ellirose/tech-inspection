import { describe, expect, it } from "vitest";
import { csvField, leadsToCsv } from "@/lib/leads/csv";
import { confirmationEmail, teamEmail, type EmailContext } from "@/lib/leads/emails";
import type { Lead } from "@/lib/leads/service";

const lead: Lead = {
  id: "00000000-0000-0000-0000-000000000001",
  reference: "TI-ABCD2345",
  createdAt: new Date("2026-11-01T15:30:00Z"),
  source: "form_quote",
  lang: "en",
  services: ["tuberia", "componentes-bha"],
  methods: ["ut", "unsure"],
  industry: null,
  component: null,
  quantity: "51-200",
  location: "base",
  city: "Yopal",
  urgency: "urgent",
  description: 'Drill pipe <5"> & HWDP',
  attachments: [],
  name: "Jane <b>Doe</b>",
  company: "=HYPERLINK(\"x\")",
  role: null,
  email: "jane@example.com",
  phone: "321 828 4129",
  preferredChannel: null,
  consent: true,
  consentAt: new Date("2026-11-01T15:30:00Z"),
  attribution: { utmSource: "linkedin", submittedFrom: "/en/contacto", device: "mobile" },
  status: "new",
  assignedTo: null,
};

const ctx: EmailContext = {
  serviceNames: {
    tuberia: { es: "Tubería", pt: "Tubulação", en: "Tubulars" },
    "componentes-bha": { es: "Componentes BHA", pt: "Componentes BHA", en: "BHA components" },
  },
  methodNames: { ut: { es: "Ultrasonido", pt: "Ultrassom", en: "Ultrasonic testing" } },
  company: { name: "TECH-INSPECTION S.A.S.", address: "Vía Siberia", phone: "+57 314 452 4817", email: "ventas@example.com", whatsapp: "573218284129", hours: { es: "Lun–Vie", pt: "Seg–Sex", en: "Mon–Fri" } },
};

describe("lead emails", () => {
  it("writes the team notification in Spanish with reply-to set to the requester", () => {
    const mail = teamEmail(lead, ctx, ["ventas@example.com"]);
    expect(mail.subject).toBe("Nueva solicitud TI-ABCD2345 · Tubería +1 · Urgente");
    expect(mail.replyTo).toBe("jane@example.com");
    expect(mail.text).toContain("Ultrasonido, No estoy seguro");
    expect(mail.text).toContain("En nuestra base (Vía Siberia)");
    // Colombian 10-digit mobile gets the country code for the WhatsApp link.
    expect(mail.html).toContain("https://wa.me/573218284129");
  });

  it("escapes everything the requester typed", () => {
    const html = teamEmail(lead, ctx, ["ventas@example.com"]).html;
    expect(html).toContain("Jane &lt;b&gt;Doe&lt;/b&gt;");
    expect(html).toContain("Drill pipe &lt;5&quot;&gt; &amp; HWDP");
    expect(html).not.toContain("<b>Doe</b>");
  });

  it("confirms to the requester in their language", () => {
    const mail = confirmationEmail({ ...lead, email: "jane@example.com" }, ctx);
    expect(mail.to).toEqual(["jane@example.com"]);
    expect(mail.subject).toBe("We received your request TI-ABCD2345");
    expect(mail.replyTo).toBe("ventas@example.com");
    expect(mail.text).toContain("Tubulars, BHA components");
    expect(mail.text).toContain("At our base (Vía Siberia)");
  });
});

describe("leads CSV", () => {
  it("quotes separators and defuses spreadsheet formulas", () => {
    expect(csvField('a "b", c')).toBe('"a ""b"", c"');
    expect(csvField("=SUM(A1)")).toBe(`"'=SUM(A1)"`);
    expect(csvField(null)).toBe("");
  });

  it("starts with a BOM and a header row", () => {
    const csv = leadsToCsv([lead]);
    expect(csv.startsWith("﻿reference,created_at,status")).toBe(true);
    expect(csv).toContain("TI-ABCD2345,2026-11-01T15:30:00.000Z,new,form_quote,en,");
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
  });
});
