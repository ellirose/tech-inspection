// Health check for uptime monitoring and the deploy job's post-release check (design document §15.5).
import { sql } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/db";

export async function GET() {
  await connection();
  const started = performance.now();
  try {
    await db.execute(sql`select 1`);
    return Response.json(
      { status: "ok", version: process.env.APP_VERSION ?? "dev", db: { ok: true, ms: Math.round(performance.now() - started) } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "error", version: process.env.APP_VERSION ?? "dev", db: { ok: false } },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
