// Exports leads to CSV until the admin inbox exists (stage 4).
// Usage: npm run leads:export -- [--since 2026-11-01] [--out leads.csv]   (default: all leads to stdout)
// The file holds personal data: keep it out of the repository and delete it once used.
import { writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { asc, gte } from "drizzle-orm";
import { createDb, schema } from "../src/db";
import { leadsToCsv } from "../src/lib/leads/csv";

if (!process.env.DATABASE_URL) process.loadEnvFile(".env.local");
const { values } = parseArgs({ options: { since: { type: "string" }, out: { type: "string" } } });

const since = values.since ? new Date(`${values.since}T00:00:00-05:00`) : undefined;
if (since && Number.isNaN(since.getTime())) throw new Error(`--since must be YYYY-MM-DD, got ${values.since}`);

async function main() {
  const { db, pool } = createDb();
  try {
    const leads = await db
      .select()
      .from(schema.lead)
      .where(since ? gte(schema.lead.createdAt, since) : undefined)
      .orderBy(asc(schema.lead.createdAt));
    const csv = leadsToCsv(leads);
    if (values.out) {
      writeFileSync(values.out, csv, "utf8");
      console.error(`${leads.length} leads written to ${values.out}`);
    } else process.stdout.write(csv);
  } finally {
    await pool.end();
  }
}

main();
