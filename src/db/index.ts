// Database connection. Server code imports `db`; scripts (migrate, seed) call createDb() with their own URL.
// Not marked server-only so the scripts can run under plain Node; the app reaches it only through
// src/lib/data and other server-only modules.
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * False on a frontend-only deployment (a Vercel preview without a database): the public pages then read
 * the content bundled in src/content (lib/data/bundled.ts) and the features that store data are off.
 */
export const hasDatabase = Boolean(process.env.DATABASE_URL);

export function createDb(url = process.env.DATABASE_URL) {
  if (!url) throw new Error("DATABASE_URL is not set");
  const pool = new Pool({ connectionString: url, max: 10 });
  return { db: drizzle(pool, { schema, casing: "snake_case" }), pool };
}

export type Db = ReturnType<typeof createDb>["db"];

// One pool per server process; reused across hot reloads in development.
const globalForDb = globalThis as unknown as { __db?: Db };

export const db: Db = new Proxy({} as Db, {
  get(_, prop) {
    globalForDb.__db ??= createDb().db;
    return Reflect.get(globalForDb.__db, prop);
  },
});

export { schema };
