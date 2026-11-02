// Admin requests: keep search engines out and send visitors without a session cookie to the login page.
// The cookie check is only a shortcut; pages and actions verify the session on the server themselves.
import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_ADMIN = ["/admin/login", "/admin/recuperar", "/admin/acceso"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
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

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/auth/:path*"],
};
