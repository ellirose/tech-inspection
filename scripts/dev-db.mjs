// Local PostgreSQL 16 without Docker, for machines where `docker compose up` is not an option.
// Usage: npm run db:dev   (keeps running; Ctrl+C stops it)
// Data lives in .data/postgres and survives restarts. Connection: see DATABASE_URL in .env.example.
//
// The server is started through pg_ctl rather than embedded-postgres' own start(): on Windows,
// postgres.exe refuses to run under an administrator account, and pg_ctl drops those rights first.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";
import pg from "pg";

const PORT = Number(process.env.DEV_DB_PORT ?? 5433);
const DB = process.env.DEV_DB_NAME ?? "techinspection";
const dir = path.resolve(".data/postgres");
// embedded-postgres installs one binary package per platform, e.g. @embedded-postgres/windows-x64.
const platform = { win32: "windows", linux: "linux", darwin: "darwin" }[process.platform];
const { pg_ctl } = await import(`@embedded-postgres/${platform}-${process.arch}`);

if (!existsSync(path.join(dir, "PG_VERSION"))) {
  await new EmbeddedPostgres({ databaseDir: dir, user: "postgres", password: "postgres", port: PORT, onLog: () => {} }).initialise();
}

const ctl = (...args) => execFileSync(pg_ctl, ["-D", dir, ...args], { stdio: "inherit" });
ctl("-o", `-p ${PORT}`, "-l", path.join(dir, "server.log"), "-w", "start");

const admin = new pg.Client({ connectionString: `postgres://postgres:postgres@localhost:${PORT}/postgres` });
await admin.connect();
const { rowCount } = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [DB]);
if (!rowCount) await admin.query(`CREATE DATABASE "${DB}"`);
await admin.end();

console.log(`PostgreSQL ready: postgres://postgres:postgres@localhost:${PORT}/${DB}`);

const stop = () => {
  ctl("-m", "fast", "stop");
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
// Keep the process alive so Ctrl+C stops the server.
setInterval(() => {}, 1 << 30);
