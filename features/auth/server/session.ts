import "server-only";

import { redirect } from "next/navigation";
import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";

import {
  clearRefreshTokenCookie,
  getRefreshTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/session";
import {
  getCurrentUser,
  refreshSession,
  type AuthUser,
} from "@/services/auth.service";

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

export async function resolveSessionFromRefreshCookie(options?: {
  persistCookie?: boolean;
}): Promise<AuthSession | null> {
  const refreshToken = await getRefreshTokenCookie();

  if (!refreshToken) {
    return null;
  }

  try {
    const refreshedSession = await refreshSession(refreshToken);

    if (options?.persistCookie && refreshedSession.refreshToken) {
      await setRefreshTokenCookie(
        refreshedSession.refreshToken,
        refreshedSession.refreshTokenExpiresIn,
      );
    }

    const user =
      refreshedSession.user ?? (await getCurrentUser(refreshedSession.accessToken));

    return {
      accessToken: refreshedSession.accessToken,
      user,
    };
  } catch {
    if (options?.persistCookie) {
      await clearRefreshTokenCookie();
    }

    return null;
  }
}

export async function requireUser(redirectTo = AUTH_ROUTE_PATHS.dashboard) {
  // During an RSC render we can read the refresh cookie, but cookie mutation is
  // not reliable there. That means refresh-token rotation should be finalized
  // inside explicit Server Actions such as refreshSessionAction/loginAction.
  const session = await resolveSessionFromRefreshCookie({ persistCookie: false });

  if (!session) {
    redirect(`${AUTH_ROUTE_PATHS.login}?redirect=${encodeURIComponent(redirectTo)}`);
  }

  return session.user;
}

export async function requireRole(role: string, redirectTo = AUTH_ROUTE_PATHS.dashboard) {
  const user = await requireUser(redirectTo);

  if (!user.roles.includes(role)) {
    redirect(AUTH_ROUTE_PATHS.dashboard);
  }

  return user;
}
