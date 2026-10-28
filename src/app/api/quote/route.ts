// Lead intake for the quote wizard and the assistant.
// Wire this to the client's CRM / mailbox (e.g. SMTP, HubSpot, TI-QMS) before launch;
// for now it validates the payload and logs it on the server.

type Lead = {
  source?: "wizard" | "assistant";
  lang?: string;
  services?: string[];
  methods?: string[];
  quantity?: string;
  location?: string;
  city?: string;
  urgency?: string;
  notes?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  contact?: string;
  consent?: boolean;
};

const clip = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

export async function POST(request: Request) {
  let body: Lead;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const lead = {
    source: body.source === "assistant" ? "assistant" : "wizard",
    lang: clip(body.lang, 5),
    services: Array.isArray(body.services) ? body.services.map((s) => clip(s, 120)).filter(Boolean).slice(0, 10) : [],
    methods: Array.isArray(body.methods) ? body.methods.map((s) => clip(s, 40)).filter(Boolean).slice(0, 4) : [],
    quantity: clip(body.quantity, 40),
    location: clip(body.location, 120),
    city: clip(body.city, 120),
    urgency: clip(body.urgency, 40),
    notes: clip(body.notes, 2000),
    name: clip(body.name, 120),
    company: clip(body.company, 160),
    email: clip(body.email, 160),
    phone: clip(body.phone, 40),
    contact: clip(body.contact, 160),
    consent: body.consent === true,
  };

  const reachable = lead.email || lead.phone || lead.contact;
  if (!lead.name || !reachable || lead.services.length === 0) {
    return Response.json({ ok: false, error: "missing_fields" }, { status: 422 });
  }
  if (lead.source === "wizard" && !lead.consent) {
    return Response.json({ ok: false, error: "consent_required" }, { status: 422 });
  }

  const id = `TI-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  console.info("[quote] new lead", id, JSON.stringify(lead));

  return Response.json({ ok: true, id });
}
