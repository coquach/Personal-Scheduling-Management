import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
  "/calendar",
  "/appointments",
  "/tags",
  "/reminders",
  "/notifications",
  "/statistics",
  "/export",
  "/profile",
];

export function proxy(request: NextRequest) {
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("psms-session")?.value;

  if (sessionCookie === "authenticated") {
    return NextResponse.next();
  }

  const redirectUrl = new URL("/auth", request.url);
  redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
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
