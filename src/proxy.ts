// Runs before every page request:
//   • admin: keep search engines out and send visitors without a session cookie to the login page
//     (only a shortcut; pages and actions verify the session on the server themselves);
//   • public site: end a preview of drafts once the admin session cookie is gone (signed out), and
//     apply the redirects managed under Redirecciones (old Wix URLs and any added later).
import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { PREVIEW_COOKIE } from "@/lib/preview";
import { findRedirect } from "@/lib/redirects";

const PUBLIC_ADMIN = ["/admin/login", "/admin/recuperar", "/admin/acceso"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/auth")) {
    const isPublic = PUBLIC_ADMIN.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    let response: NextResponse;
    if (pathname.startsWith("/admin") && !isPublic && !getSessionCookie(request, { cookiePrefix: "ti" })) {
      const login = new URL("/admin/login", request.url);
      if (pathname !== "/admin") login.searchParams.set("next", pathname + search);
      response = NextResponse.redirect(login);
    } else response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  if (request.cookies.has(PREVIEW_COOKIE) && !getSessionCookie(request, { cookiePrefix: "ti" })) {
    const response = NextResponse.redirect(request.nextUrl);
    response.cookies.delete(PREVIEW_COOKIE);
    return response;
  }

  const target = await findRedirect(pathname);
  if (target) {
    const url = new URL(target.to, request.url);
    // Keep campaign tags and other query parameters from the old link.
    if (!url.search && search) url.search = search;
    return NextResponse.redirect(url, target.status);
  }
  return NextResponse.next();
}

export const config = {
  // Every page and the auth API; not Next's assets, other API routes or files with an extension.
  matcher: ["/((?!_next/|api/(?!auth)|.*\\.[a-zA-Z0-9]+$).*)"],
};
