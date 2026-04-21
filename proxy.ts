import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  AUTH_PUBLIC_PAGE_PATHS,
  AUTH_REFRESH_TOKEN_COOKIE_NAME,
  AUTH_ROUTE_MATCHER_PATHS,
  AUTH_ROUTE_PATHS,
} from "@/lib/constants/auth";
import { isAuthRouteBypassEnabled } from "@/lib/auth-flags";

function sanitizeRedirectTarget(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return AUTH_ROUTE_PATHS.calendar;
  }

  return value;
}

function decodeJwtPayload(token: string) {
  const payloadPart = token.split(".")[1];

  if (!payloadPart) {
    return null;
  }

  try {
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { exp?: number };

    return payload;
  } catch {
    return null;
  }
}

function hasActiveAuthSession(request: NextRequest) {
  const refreshToken = request.cookies.get(AUTH_REFRESH_TOKEN_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return false;
  }

  const payload = decodeJwtPayload(refreshToken);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 > Date.now();
}

export function proxy(request: NextRequest) {
  if (isAuthRouteBypassEnabled()) {
    return NextResponse.next();
  }

  const { pathname, searchParams } = request.nextUrl;
  const authenticated = hasActiveAuthSession(request);
  const isAuthAlias =
    pathname === AUTH_ROUTE_PATHS.alias || pathname === `${AUTH_ROUTE_PATHS.alias}/`;
  const isAuthPage = AUTH_PUBLIC_PAGE_PATHS.has(pathname);
  const redirectTarget = sanitizeRedirectTarget(searchParams.get("redirect"));

  if (isAuthAlias) {
    if (authenticated) {
      return NextResponse.redirect(new URL(redirectTarget, request.url));
    }

    const loginUrl = new URL(AUTH_ROUTE_PATHS.login, request.url);
    const requestedRedirect = searchParams.get("redirect");

    if (requestedRedirect) {
      loginUrl.searchParams.set("redirect", redirectTarget);
    }

    return NextResponse.redirect(loginUrl);
  }

  if (authenticated && isAuthPage) {
    return NextResponse.redirect(new URL(redirectTarget, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: AUTH_ROUTE_MATCHER_PATHS,
};
