// Lead storage and rate limiting against the real database. Skipped when DATABASE_URL is unset.
import { eq, inArray, like } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { createDb, schema as s } from "@/db";
import { leadInput } from "@/lib/leads/input";
import { addLeadEvent, createLead } from "@/lib/leads/service";
import { hit } from "@/lib/rate-limit";

const enabled = Boolean(process.env.DATABASE_URL);
const conn = enabled ? createDb() : null;
const created: string[] = [];
const subject = `test-${Date.now()}`;

afterAll(async () => {
  if (!conn) return;
  if (created.length) await conn.db.delete(s.lead).where(inArray(s.lead.id, created));
  await conn.db.delete(s.rateLimit).where(like(s.rateLimit.key, `%:${subject}`));
  await conn.pool.end();
});

describe.skipIf(!enabled)("lead service", () => {
  const db = conn!.db;

  it("stores the lead with consent time, attribution and a history entry", async () => {
    const input = leadInput.parse({
      source: "chatbot",
      lang: "es",
      services: ["tuberia"],
      name: "Prueba Automática",
      contact: "prueba@example.com",
      consent: true,
      attribution: { utmSource: "test" },
    });
    const lead = await createLead(input, { device: "desktop" }, db);
    created.push(lead.id);

    expect(lead.reference).toMatch(/^TI-[2-9A-HJ-NP-Z]{8}$/);
    expect(lead).toMatchObject({ source: "chatbot", email: "prueba@example.com", phone: null, status: "new", consent: true });
    expect(lead.consentAt).toBeInstanceOf(Date);
    expect(lead.attribution).toEqual({ utmSource: "test", device: "desktop" });

    await addLeadEvent(lead.id, "email_team", "outbox", db);
    const events = await db.select().from(s.leadEvent).where(eq(s.leadEvent.leadId, lead.id));
    expect(events.map((e) => e.type).sort()).toEqual(["created", "email_team"]);
  });

  it("allows up to the limit in a window, then reports when to retry", async () => {
    const limit = { name: "test", max: 3, windowSeconds: 60 };
    for (let i = 0; i < 3; i++) expect(await hit(subject, [limit], db)).toEqual({ ok: true });
    const blocked = await hit(subject, [limit], db);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("starts a new window once the previous one has ended", async () => {
    const limit = { name: "test-expired", max: 1, windowSeconds: 60 };
    await db.insert(s.rateLimit).values({ key: `test-expired:${subject}`, count: 5, resetAt: new Date(Date.now() - 1000) });
    expect(await hit(subject, [limit], db)).toEqual({ ok: true });
  });
});
