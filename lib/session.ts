import "server-only";

import { cookies } from "next/headers";
import { AUTH_REFRESH_TOKEN_COOKIE_NAME } from "@/lib/constants/auth";

export const REFRESH_TOKEN_COOKIE_NAME = AUTH_REFRESH_TOKEN_COOKIE_NAME;

const DEFAULT_REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function getRefreshCookieMaxAge(maxAge?: number) {
  if (typeof maxAge === "number" && Number.isFinite(maxAge) && maxAge > 0) {
    return Math.floor(maxAge);
  }

  const envValue = Number(process.env.AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS);

  if (Number.isFinite(envValue) && envValue > 0) {
    return Math.floor(envValue);
  }

  return DEFAULT_REFRESH_COOKIE_MAX_AGE;
}

export async function getRefreshTokenCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value ?? null;
}

export async function setRefreshTokenCookie(
  refreshToken: string,
  maxAge?: number,
) {
  const cookieStore = await cookies();

  cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getRefreshCookieMaxAge(maxAge),
  });
}

export async function clearRefreshTokenCookie() {
  const cookieStore = await cookies();

  cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
