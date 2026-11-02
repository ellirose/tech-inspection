// Creates a panel account and sends it a one-time setup link (design document §14.5: no default passwords).
// The link is also printed here, for the first super-admin before outgoing email is configured.
//   npm run admin:invite -- --bootstrap                         first super-admin from ADMIN_BOOTSTRAP_EMAIL
//   npm run admin:invite -- --email ana@x.com --name "Ana Ruiz" --role sales
// Re-running for an existing account sends a fresh link without changing its role.
import { parseArgs } from "node:util";
import { eq } from "drizzle-orm";

if (!process.env.DATABASE_URL) process.loadEnvFile(".env.local");

async function main() {
  // Imported after the environment is loaded: the auth module reads it at import time.
  const { db, schema } = await import("../src/db");
  const { auth, accessLinks } = await import("../src/lib/auth");
  const { audit } = await import("../src/lib/audit");
  const { isRole, roles } = await import("../src/lib/auth/roles");

  const { values } = parseArgs({
    options: { bootstrap: { type: "boolean" }, email: { type: "string" }, name: { type: "string" }, role: { type: "string" } },
  });

  let email = values.email?.trim().toLowerCase();
  let role = values.role ?? "editor";
  let name = values.name?.trim();
  if (values.bootstrap) {
    email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
    if (!email) throw new Error("ADMIN_BOOTSTRAP_EMAIL is not set");
    role = "super_admin";
    const [existing] = await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.role, "super_admin")).limit(1);
    if (existing) {
      console.log("A super-admin already exists; nothing to do. Use --email to invite more people.");
      return;
    }
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Pass a valid --email (or --bootstrap)");
  if (!isRole(role)) throw new Error(`--role must be one of: ${roles.join(", ")}`);
  name ||= email.split("@")[0];

  const [found] = await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.email, email));
  if (!found) {
    const [created] = await db.insert(schema.user).values({ email, name, role }).returning({ id: schema.user.id });
    await audit({ action: "user_invited", entity: "user", entityId: created.id, diff: { email, role, via: "cli" } });
    console.log(`Created ${role} account for ${email}.`);
  } else console.log(`${email} already has an account; sending a new access link.`);

  accessLinks.print = true;
  await auth.api.requestPasswordReset({ body: { email } });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
