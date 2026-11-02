// Checks that the seeded database holds exactly the content the site was built from.
// Needs a migrated and seeded database (npm run db:setup); skipped when DATABASE_URL is unset.
import { asc, eq } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { createDb, schema as s } from "@/db";
import { blocks, homeBlock } from "@/db/seed/blocks";
import { home } from "@/content/home";
import { methods } from "@/content/methods";
import { services } from "@/content/services";
import { accountabilityDocs, channels, clients, company, policyDocs } from "@/content/site";

const enabled = Boolean(process.env.DATABASE_URL);
const conn = enabled ? createDb() : null;

afterAll(async () => {
  await conn?.pool.end();
});

describe.skipIf(!enabled)("seeded content", () => {
  const db = conn!.db;

  it("keeps methods in display order with every field", async () => {
    const rows = await db.select().from(s.method).orderBy(asc(s.method.sortOrder));
    expect(rows.map((r) => r.slug)).toEqual(methods.map((m) => m.slug));
    for (const m of methods) {
      const r = rows.find((x) => x.key === m.key)!;
      expect({ name: r.name, steps: r.steps, gallery: r.gallery, video: r.video ?? undefined }).toEqual({
        name: m.name,
        steps: m.steps,
        gallery: m.gallery,
        video: m.video,
      });
    }
  });

  it("links each service to its methods in order", async () => {
    const rows = await db.select().from(s.service).orderBy(asc(s.service.sortOrder));
    expect(rows.map((r) => r.slug)).toEqual(services.map((x) => x.slug));
    const links = await db
      .select({ serviceId: s.serviceMethod.serviceId, key: s.method.key })
      .from(s.serviceMethod)
      .innerJoin(s.method, eq(s.method.id, s.serviceMethod.methodId))
      .orderBy(asc(s.serviceMethod.sortOrder));
    for (const svc of services) {
      const id = rows.find((r) => r.slug === svc.slug)!.id;
      expect(links.filter((l) => l.serviceId === id).map((l) => l.key)).toEqual(svc.methods);
    }
    expect(rows.filter((r) => r.needsReview).map((r) => r.slug)).toEqual(services.filter((x) => x.draft).map((x) => x.slug));
  });

  it("stores page blocks unchanged", async () => {
    const rows = await db.select().from(s.pageBlock);
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r.data]));
    expect(byKey.home).toEqual(JSON.parse(JSON.stringify(homeBlock)));
    for (const [key, value] of Object.entries(blocks)) expect(byKey[key]).toEqual(JSON.parse(JSON.stringify(value)));
  });

  it("moves the home counters to the stat table", async () => {
    const rows = await db.select().from(s.stat).orderBy(asc(s.stat.sortOrder));
    expect(rows.map((r) => ({ value: r.value, label: r.label }))).toEqual(home.hero.stats.map((x) => ({ value: x.value, label: x.label })));
  });

  it("keeps company data, clients, contact lines and documents", async () => {
    const [settings] = await db.select().from(s.siteSettings);
    expect(settings.data.company).toEqual(company);
    expect((await db.select().from(s.client).orderBy(asc(s.client.sortOrder))).map((c) => c.name)).toEqual(clients.map((c) => c.name));
    expect((await db.select().from(s.contactChannel).orderBy(asc(s.contactChannel.sortOrder))).map((c) => c.email)).toEqual(
      channels.map((c) => c.email),
    );
    const docs = await db.select().from(s.companyDocument).orderBy(asc(s.companyDocument.sortOrder));
    expect(docs.filter((d) => d.kind === "policy").map((d) => d.fileUrl)).toEqual(policyDocs.map((d) => d.file));
    expect(docs.filter((d) => d.kind === "accountability").map((d) => d.year)).toEqual(accountabilityDocs.map((d) => d.year));
  });
});
