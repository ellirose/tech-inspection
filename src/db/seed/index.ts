// Loads the site's current content (src/content/*.ts, the material migrated from Wix and the client deck)
// into an empty database. Refuses to touch a database that already has content unless --force is given,
// so it can never overwrite edits made in the admin panel by accident. --blocks reloads only the named
// page sections (for a change to their structure, which the admin cannot make) and leaves the rest alone.
// Usage: npm run db:seed [-- --force | --blocks tiqms,home]
import { existsSync } from "node:fs";
import { sql } from "drizzle-orm";
import { createDb } from "../index";
import * as s from "../schema";
import { blocks, homeBlock } from "./blocks";
import { legacyRedirects } from "./redirects";
import { home } from "@/content/home";
import { methods } from "@/content/methods";
import { services } from "@/content/services";
import {
  FOUNDED,
  PLATFORM_URL,
  YEARS,
  accountabilityDocs,
  certifications,
  channels,
  clients,
  company,
  keyPartner,
  leadership,
  personnelCredentials,
  policyDocs,
} from "@/content/site";

/** Document thumbnails that were hard-coded on the HSEQ page. */
const docThumbnails: Record<string, string> = { "PL-09-1": "/media/hseq/data-protection.jpg" };

const contentTables = [
  s.serviceMethod,
  s.serviceIndustry,
  s.caseStudyService,
  s.faq,
  s.caseStudy,
  s.service,
  s.method,
  s.industry,
  s.certification,
  s.client,
  s.stat,
  s.teamMember,
  s.contactChannel,
  s.companyDocument,
  s.pageBlock,
  s.siteSettings,
];

async function main() {
  if (!process.env.DATABASE_URL && existsSync(".env.local")) process.loadEnvFile(".env.local");
  const force = process.argv.includes("--force");
  const blockArg = process.argv.indexOf("--blocks");
  const { db, pool } = createDb();

  try {
    if (blockArg !== -1) {
      const all: Record<string, unknown> = { home: homeBlock, ...blocks };
      const keys = (process.argv[blockArg + 1] ?? "").split(",").filter(Boolean);
      const unknown = keys.filter((k) => !(k in all));
      if (!keys.length || unknown.length) throw new Error(`--blocks needs page-section keys from: ${Object.keys(all).join(", ")}`);
      for (const key of keys) {
        await db
          .insert(s.pageBlock)
          .values({ key, data: all[key] })
          .onConflictDoUpdate({ target: s.pageBlock.key, set: { data: all[key], updatedAt: new Date(), updatedBy: null } });
      }
      console.log(`Reloaded page sections: ${keys.join(", ")}. Restart the site or save the section in the admin to refresh its cache.`);
      return;
    }


    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(s.siteSettings);
    if (count > 0 && !force) {
      console.log("Content already present; nothing changed. Use --force to wipe content tables and reload.");
      return;
    }

    await db.transaction(async (tx) => {
      if (force) {
        for (const table of contentTables) await tx.delete(table);
      }

      await tx.insert(s.siteSettings).values({
        data: { company, founded: FOUNDED, years: YEARS, platformUrl: PLATFORM_URL, keyPartner },
      });

      const methodRows = await tx
        .insert(s.method)
        .values(
          methods.map((m, i) => ({
            sortOrder: i,
            key: m.key,
            slug: m.slug,
            code: m.code,
            name: m.name,
            tagline: m.tagline,
            intro: m.intro,
            body: m.body,
            advantages: m.advantages,
            detects: m.detects,
            steps: m.steps,
            cover: m.cover,
            gallery: m.gallery,
            video: m.video ?? null,
          })),
        )
        .returning({ id: s.method.id, key: s.method.key });
      const methodId = new Map(methodRows.map((r) => [r.key, r.id]));

      for (const [i, svc] of services.entries()) {
        const [row] = await tx
          .insert(s.service)
          .values({
            sortOrder: i,
            slug: svc.slug,
            icon: svc.icon,
            image: svc.image,
            gallery: svc.gallery,
            name: svc.name,
            short: svc.short,
            body: svc.body,
            scope: svc.scope,
            needsReview: svc.draft ?? false,
          })
          .returning({ id: s.service.id });
        await tx.insert(s.serviceMethod).values(
          svc.methods.map((key, j) => ({ serviceId: row.id, methodId: methodId.get(key)!, sortOrder: j })),
        );
      }

      await tx.insert(s.certification).values([
        ...certifications.map((c, i) => ({
          sortOrder: i,
          key: c.id,
          kind: "system" as const,
          code: c.code,
          ring: c.ring,
          title: c.title,
          body: c.body,
        })),
        ...personnelCredentials.map((c, i) => ({
          sortOrder: i,
          key: c.code.toLowerCase(),
          kind: "personnel" as const,
          code: c.code,
          title: c.title,
          body: c.body,
        })),
      ]);

      // Logos were already public on the Wix site; showLogo stays true until the client says otherwise.
      await tx.insert(s.client).values(
        clients.map((c, i) => ({ sortOrder: i, name: c.name, logo: c.logo, square: c.square ?? false, showLogo: true })),
      );

      await tx.insert(s.stat).values(
        home.hero.stats.map((st, i) => ({ sortOrder: i, value: st.value, prefix: "prefix" in st ? st.prefix : null, label: st.label })),
      );

      await tx.insert(s.teamMember).values(
        leadership.map((p, i) => ({
          sortOrder: i,
          name: p.name,
          role: p.role,
          bio: p.bio,
          photo: p.photo,
          email: p.email,
          isLeadership: true,
        })),
      );

      await tx.insert(s.contactChannel).values(
        channels.map((c, i) => ({ sortOrder: i, role: c.role, scope: c.scope, phone: c.phone, email: c.email })),
      );

      await tx.insert(s.companyDocument).values([
        ...policyDocs.map((d, i) => ({
          sortOrder: i,
          kind: "policy" as const,
          code: d.code,
          title: d.title,
          fileUrl: d.file,
          thumbnail: docThumbnails[d.code] ?? null,
        })),
        ...accountabilityDocs.map((d, i) => ({
          sortOrder: i,
          kind: "accountability" as const,
          code: d.code,
          title: d.title,
          fileUrl: d.file,
          year: d.year ?? null,
        })),
      ]);

      await tx.insert(s.pageBlock).values([
        { key: "home", data: homeBlock },
        ...Object.entries(blocks).map(([key, data]) => ({ key, data })),
      ]);
    });

    // Redirects are managed in the admin, so --force leaves edited ones alone and only adds missing Wix URLs.
    await db
      .insert(s.redirect)
      .values(legacyRedirects.map(([fromPath, toPath]) => ({ fromPath, toPath, statusCode: 308 })))
      .onConflictDoNothing({ target: s.redirect.fromPath });

    console.log(
      `Seeded: ${methods.length} methods, ${services.length} services, ${certifications.length + personnelCredentials.length} certifications, ` +
        `${clients.length} clients, ${leadership.length} people, ${channels.length} contact lines, ` +
        `${policyDocs.length + accountabilityDocs.length} documents, ${Object.keys(blocks).length + 1} page blocks, ${legacyRedirects.length} redirects.`,
    );
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
