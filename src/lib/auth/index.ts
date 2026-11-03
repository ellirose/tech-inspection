// Admin authentication (design document §14.4) with Better Auth: email and password hashed with
// argon2id, TOTP second factor with backup codes, database sessions in httpOnly cookies.
// On top of the library:
//   • no public sign-up: accounts are created by a super-admin (or `npm run admin:invite`) and
//     activated through a one-time link, which is Better Auth's password-reset token;
//   • lockout after repeated wrong passwords, per account (the two-factor plugin does the same for codes);
//   • deactivated accounts cannot open sessions;
//   • sign-ins and account changes go to the audit log.
// Not marked server-only so the admin scripts can use it; it is only imported by server code.
import { hash, verify } from "@node-rs/argon2";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { audit, requestIp } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { hit, visitorKey } from "@/lib/rate-limit";
import { accessLinkEmail } from "./emails";

export const LOCKOUT = { maxFailures: 5, minutes: 15 };
export const COOKIE_PREFIX = "ti";
const SITE = process.env.AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Scripts set this to also print access links, for the first super-admin before email works. */
export const accessLinks = { print: false };

const findUser = (where: ReturnType<typeof eq>) =>
  db
    .select({ id: schema.user.id, active: schema.user.active, lockedUntil: schema.user.lockedUntil, twoFactorEnabled: schema.user.twoFactorEnabled })
    .from(schema.user)
    .where(where)
    .then((rows) => rows[0]);

const normaliseEmail = (value: unknown) => (typeof value === "string" ? value.trim().toLowerCase() : "");

export const auth = betterAuth({
  appName: "Tech-Inspection",
  baseURL: SITE,
  secret: process.env.AUTH_SECRET,
  trustedOrigins: [SITE],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification, twoFactor: schema.twoFactor },
  }),
  advanced: {
    database: { generateId: "uuid" },
    cookiePrefix: COOKIE_PREFIX,
    ipAddress: { ipAddressHeaders: ["x-real-ip", "x-forwarded-for"] },
  },
  user: {
    additionalFields: {
      // Set by super-admins only (stage 4); never accepted from the request.
      role: { type: "string", required: false, defaultValue: "editor", input: false },
      active: { type: "boolean", required: false, defaultValue: true, input: false },
    },
  },
  // Holds one-time setup/reset tokens; stored hashed so a database copy cannot be used to log in.
  verification: { storeIdentifier: "hashed" },
  session: {
    expiresIn: 60 * 60 * 12,
    updateAge: 60 * 60,
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    password: {
      hash: (password) => hash(password),
      verify: ({ hash: stored, password }) => verify(stored, password),
    },
    resetPasswordTokenExpiresIn: 60 * 60 * 24,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, token }) => {
      const [credential] = await db
        .select({ id: schema.account.id })
        .from(schema.account)
        .where(sql`${schema.account.userId} = ${user.id} and ${schema.account.providerId} = 'credential'`);
      const url = `${SITE}/admin/acceso/${token}`;
      if (accessLinks.print) console.log(`\nAccess link for ${user.email} (valid 24 hours):\n${url}\n`);
      await sendEmail(accessLinkEmail({ name: user.name, email: user.email, url, kind: credential ? "reset" : "setup" }));
    },
    onPasswordReset: async ({ user }, request) => {
      await db.update(schema.user).set({ failedLoginCount: 0, lockedUntil: null, emailVerified: true }).where(eq(schema.user.id, user.id));
      await audit({ userId: user.id, action: "password_set", entity: "user", entityId: user.id, ip: requestIp(request?.headers) });
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 300, max: 10 },
      "/request-password-reset": { window: 3600, max: 5 },
      "/reset-password": { window: 600, max: 10 },
      "/two-factor/*": { window: 60, max: 10 },
    },
    // Shares the PostgreSQL counters used by the lead form; keys are hashed (they contain the IP).
    customStorage: {
      consume: async (key, rule) => {
        const result = await hit(visitorKey(key), [{ name: "auth", max: rule.max, windowSeconds: rule.window }]);
        return result.ok ? { allowed: true, retryAfter: null } : { allowed: false, retryAfter: result.retryAfter };
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const found = await findUser(eq(schema.user.id, session.userId));
          if (!found?.active) throw new APIError("FORBIDDEN", { code: "ACCOUNT_DISABLED", message: "Account disabled" });
        },
        after: async (session, ctx) => {
          // With two-factor on, the password step opens a session that the plugin discards at once; the
          // real sign-in is the one created after the code is verified.
          const found = await findUser(eq(schema.user.id, session.userId));
          if (ctx?.path === "/sign-in/email" && found?.twoFactorEnabled) return;
          await db.update(schema.user).set({ lastLoginAt: new Date() }).where(eq(schema.user.id, session.userId));
          await audit({ userId: session.userId, action: "login", entity: "session", ip: session.ipAddress });
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Recorded before the endpoint runs: afterwards the session no longer exists.
      if (ctx.path === "/sign-out") {
        const session = await getSessionFromCtx(ctx, { disableRefresh: true });
        if (session) await audit({ userId: session.user.id, action: "logout", entity: "session", ip: requestIp(ctx.request?.headers ?? ctx.headers) });
        return;
      }
      if (ctx.path !== "/sign-in/email") return;
      const found = await findUser(eq(schema.user.email, normaliseEmail(ctx.body?.email)));
      if (found?.lockedUntil && found.lockedUntil > new Date()) {
        throw new APIError("TOO_MANY_REQUESTS", { code: "ACCOUNT_LOCKED", message: "Account temporarily locked" });
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      const ip = requestIp(ctx.request?.headers ?? ctx.headers);
      const returned = ctx.context.returned;
      const failed = returned instanceof APIError;
      const userId = ctx.context.session?.user.id ?? null;

      if (ctx.path === "/sign-in/email") {
        const email = normaliseEmail(ctx.body?.email);
        if (failed && returned.statusCode === 401) {
          // Count the wrong password; at the limit, lock and start counting again after the lock.
          const [row] = await db
            .update(schema.user)
            .set({ failedLoginCount: sql`${schema.user.failedLoginCount} + 1` })
            .where(eq(schema.user.email, email))
            .returning({ id: schema.user.id, failures: schema.user.failedLoginCount });
          if (row && row.failures >= LOCKOUT.maxFailures) {
            await db
              .update(schema.user)
              .set({ failedLoginCount: 0, lockedUntil: new Date(Date.now() + LOCKOUT.minutes * 60_000) })
              .where(eq(schema.user.id, row.id));
            await audit({ userId: row.id, action: "account_locked", entity: "user", entityId: row.id, ip });
          }
          await audit({ userId: row?.id ?? null, action: "login_failed", entity: "session", diff: { email }, ip });
        } else if (!failed) {
          await db.update(schema.user).set({ failedLoginCount: 0, lockedUntil: null }).where(eq(schema.user.email, email));
        }
        return;
      }

      if (failed) return;
      const events: Record<string, string> = {
        "/change-password": "password_changed",
        "/two-factor/disable": "two_factor_disabled",
        "/two-factor/generate-backup-codes": "backup_codes_regenerated",
      };
      // Enabling two-factor finishes when the first code is verified while the user is signed in.
      if (ctx.path === "/two-factor/verify-totp" && userId && ctx.context.session?.user.twoFactorEnabled === false) {
        await audit({ userId, action: "two_factor_enabled", entity: "user", entityId: userId, ip });
      } else if (events[ctx.path] && userId) {
        await audit({ userId, action: events[ctx.path], entity: "user", entityId: userId, ip });
      }
    }),
  },
  disabledPaths: ["/change-email", "/update-user", "/delete-user", "/sign-in/social", "/link-social", "/unlink-account", "/two-factor/send-otp", "/two-factor/verify-otp"],
  plugins: [
    twoFactor({
      issuer: "Tech-Inspection",
      accountLockout: { maxFailedAttempts: LOCKOUT.maxFailures, durationSeconds: LOCKOUT.minutes * 60 },
    }),
    // Lets server actions set the session cookie; must stay last.
    nextCookies(),
  ],
});

export type AdminUser = typeof auth.$Infer.Session.user;
