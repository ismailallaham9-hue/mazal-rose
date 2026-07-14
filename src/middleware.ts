import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin-auth";

/**
 * Protects the control panel. Unauthenticated visitors to /admin are sent to
 * the login page; unauthenticated calls to /api/admin get a 401. The login
 * routes themselves stay open.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const noindex = (res: NextResponse) => {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return res;
  };

  if (
    pathname === "/contact" &&
    (req.nextUrl.searchParams.has("subject") ||
      req.nextUrl.searchParams.has("message"))
  ) {
    const cleanContactUrl = req.nextUrl.clone();
    cleanContactUrl.pathname = "/contact";
    cleanContactUrl.search = "";
    cleanContactUrl.hash = "review-form";
    return NextResponse.redirect(cleanContactUrl, 308);
  }
  if (pathname === "/contact") return NextResponse.next();

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  if (isLoginPage || isLoginApi) return noindex(NextResponse.next());

  const authed = await isAuthed(req.cookies.get(ADMIN_COOKIE)?.value);
  if (authed) return noindex(NextResponse.next());

  if (pathname.startsWith("/api/admin")) {
    return noindex(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return noindex(NextResponse.redirect(url));
}

export const config = {
  matcher: ["/contact", "/admin/:path*", "/api/admin/:path*"],
};
