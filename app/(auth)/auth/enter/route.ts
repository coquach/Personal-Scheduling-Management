import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const redirectTarget = request.nextUrl.searchParams.get("redirect") ?? "/calendar";
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.host;
  const protocol =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "");
  const destination = new URL(redirectTarget, `${protocol}://${host}`);
  const response = NextResponse.redirect(destination);

  response.cookies.set("psms-session", "authenticated", {
    path: "/",
    sameSite: "lax",
  });

  return response;
}
