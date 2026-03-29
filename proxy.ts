import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_STATE_COOKIE_NAME } from "@/api/auth/session";

const protectedRoutes = [
  "/calendar",
  "/appointments",
  "/tags",
  "/reminders",
  "/notifications",
  "/statistics",
  "/export",
  "/profile",
];

const authRoutes = ["/auth", "/forgot-password", "/reset-password", "/verify-email"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isAuthenticated =
    request.cookies.get(AUTH_STATE_COOKIE_NAME)?.value === "1";

  if (isProtectedRoute && !isAuthenticated) {
    const authUrl = new URL("/auth", request.url);
    authUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(authUrl);
  }

  if (isAuthRoute && isAuthenticated && pathname === "/auth") {
    return NextResponse.redirect(new URL("/calendar", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/forgot-password/:path*",
    "/reset-password/:path*",
    "/verify-email/:path*",
    "/calendar/:path*",
    "/appointments/:path*",
    "/tags/:path*",
    "/reminders/:path*",
    "/notifications/:path*",
    "/statistics/:path*",
    "/export/:path*",
    "/profile/:path*",
  ],
};
