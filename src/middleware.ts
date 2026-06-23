import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin-auth";

/**
 * Protects the control panel. Unauthenticated visitors to /admin are sent to
 * the login page; unauthenticated calls to /api/admin get a 401. The login
 * routes themselves stay open.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  if (isLoginPage || isLoginApi) return NextResponse.next();

  const authed = await isAuthed(req.cookies.get(ADMIN_COOKIE)?.value);
  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
