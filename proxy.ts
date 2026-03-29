import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

const authRoutes = ["/auth", "/forgot-password", "/reset-password"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isAuthenticated = request.cookies.get("psms-session")?.value === "authenticated";

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
