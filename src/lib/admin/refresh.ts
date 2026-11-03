// After an admin change: clear the affected public pages in every language, then request them in the
// background so they are rebuilt before anyone visits. updateTag alone refreshes the data, but a
// prerendered page is still served once from its old copy, and a page cached as "not found" (a draft
// someone opened) would stay that way after publishing.
import "server-only";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { after } from "next/server";
import { locales } from "@/i18n/config";

/** `paths` without the language prefix: "" is the home page, "/servicios/tuberia" a service. */
export async function refreshPublicPages(paths: string[]) {
  const full = [...new Set(paths)].flatMap((p) => locales.map((l) => `/${l}${p}`));
  for (const p of full) revalidatePath(p);
  const h = await headers();
  const host = h.get("host");
  if (!host) return;
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${host}`;
  after(async () => {
    for (const p of full) await fetch(origin + p, { cache: "no-store", signal: AbortSignal.timeout(15_000) }).catch(() => {});
  });
}
