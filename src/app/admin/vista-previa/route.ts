// Turns on the preview of drafts for this browser and opens the page to check.
// A GET because it is opened from a link in the editor (in a new tab); it only affects this browser.
import { draftMode } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { can, requiresTwoFactor } from "@/lib/auth/roles";
import { previewPath } from "@/lib/preview";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = previewPath(url.searchParams.get("ruta"));
  if (!path) notFound();
  const user = (await getSession())?.user;
  if (!user?.active) redirect(`/admin/login?next=${encodeURIComponent(url.pathname + url.search)}`);
  if (requiresTwoFactor(user.role) && !user.twoFactorEnabled) redirect("/admin/seguridad");
  if (!can(user.role, "content:read")) notFound();
  (await draftMode()).enable();
  redirect(path);
}
