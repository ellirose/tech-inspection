// Preview of drafts on the public site (Next.js draft mode). An editor opens /admin/vista-previa?ruta=…,
// which checks the session and sets Next's bypass cookie; the content getters then include drafts for
// that browser only. The proxy drops the cookie once the admin session cookie is gone.
import { locales } from "@/i18n/config";

/** Name of the cookie draftMode().enable() sets. */
export const PREVIEW_COOKIE = "__prerender_bypass";

const sitePath = new RegExp(`^/(${locales.join("|")})(/[a-z0-9-]+)*$`);

/** A public page path to preview or return to, or null: never another site or the admin. */
export const previewPath = (value: unknown) => (typeof value === "string" && sitePath.test(value) ? value : null);
