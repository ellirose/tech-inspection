// Session checks for admin pages and server actions. Every page and action calls one of these itself:
// layouts render alongside their pages, so a check in a layout alone does not protect a page.
import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth, type AdminUser } from ".";
import { can, requiresTwoFactor, type Permission } from "./roles";

export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/**
 * The signed-in user, for admin pages. Sends visitors to the login page, super-admins without a
 * second factor to the security page, and answers 404 when the role lacks `permission`.
 */
export async function requireUser(permission?: Permission, options: { allowMissingTwoFactor?: boolean } = {}): Promise<AdminUser> {
  const session = await getSession();
  if (!session || !session.user.active) redirect("/admin/login");
  const { user } = session;
  if (requiresTwoFactor(user.role) && !user.twoFactorEnabled && !options.allowMissingTwoFactor) redirect("/admin/seguridad");
  if (permission && !can(user.role, permission)) notFound();
  return user;
}

/** The signed-in user, for server actions and route handlers: throws instead of redirecting. */
export async function authorize(permission: Permission): Promise<AdminUser> {
  const session = await getSession();
  const user = session?.user;
  if (!user?.active) throw new Error("UNAUTHENTICATED");
  if (requiresTwoFactor(user.role) && !user.twoFactorEnabled) throw new Error("TWO_FACTOR_REQUIRED");
  if (!can(user.role, permission)) throw new Error("FORBIDDEN");
  return user;
}
