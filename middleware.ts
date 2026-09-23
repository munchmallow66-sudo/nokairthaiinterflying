import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSessionToken } from "@/lib/session-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin Route Guard
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    const isValidSession = sessionCookie
      ? await verifyAdminSessionToken(sessionCookie)
      : null;

    // Protecting /admin and subroutes (except /admin/login)
    if (pathname !== "/admin/login") {
      if (!isValidSession) {
        const loginUrl = new URL("/admin/login", request.url);
        return NextResponse.redirect(loginUrl);
      }
    } else {
      // If already logged in, redirect /admin/login to /admin
      if (isValidSession) {
        const adminUrl = new URL("/admin", request.url);
        return NextResponse.redirect(adminUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
