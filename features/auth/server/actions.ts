"use server";

import { revalidatePath } from "next/cache";
import { clearRefreshTokenCookie, getRefreshTokenCookie, setRefreshTokenCookie } from "@/lib/session";
import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";
import { loginPayloadSchema } from "@/lib/validation/auth";
import { sanitizeRedirectTarget } from "@/features/auth/server/redirect";
import {
  requireRole as requireRoleFromSession,
  requireUser as requireUserFromSession,
  resolveSessionFromRefreshCookie,
} from "@/features/auth/server/session";
import {
  type LoginActionState,
  type SessionActionResult,
} from "@/features/auth/server/types";
import {
  getCurrentUser,
  login,
  logout,
} from "@/services/auth.service";

export async function requireUser(redirectTo = AUTH_ROUTE_PATHS.calendar) {
  return requireUserFromSession(redirectTo);
}

export async function requireRole(
  role: string,
  redirectTo = AUTH_ROUTE_PATHS.calendar,
) {
  return requireRoleFromSession(role, redirectTo);
}

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const redirectTo = sanitizeRedirectTarget(formData.get("redirectTo"));
  const parsedPayload = loginPayloadSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedPayload.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: parsedPayload.error.flatten().fieldErrors,
      accessToken: null,
      user: null,
      redirectTo,
    };
  }

  try {
    const session = await login(parsedPayload.data);
    const user = session.user ?? (await getCurrentUser(session.accessToken));

    await setRefreshTokenCookie(
      session.refreshToken,
      session.refreshTokenExpiresIn,
    );

    revalidatePath("/", "layout");

    return {
      status: "success",
      message: null,
      fieldErrors: {},
      accessToken: session.accessToken,
      user,
      redirectTo,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to sign in.",
      fieldErrors: {},
      accessToken: null,
      user: null,
      redirectTo,
    };
  }
}

export async function logoutAction() {
  const refreshToken = await getRefreshTokenCookie();

  try {
    if (refreshToken) {
      await logout({ refreshToken });
    }
  } finally {
    await clearRefreshTokenCookie();
    revalidatePath("/", "layout");
  }

  return {
    status: "signed-out" as const,
    redirectTo: AUTH_ROUTE_PATHS.login,
  };
}

export async function refreshSessionAction(): Promise<SessionActionResult> {
  const session = await resolveSessionFromRefreshCookie({ persistCookie: true });

  if (!session) {
    return { status: "unauthenticated" };
  }

  return {
    status: "authenticated",
    accessToken: session.accessToken,
    user: session.user,
  };
}

export async function getCurrentUserAction(): Promise<SessionActionResult> {
  const session = await resolveSessionFromRefreshCookie({ persistCookie: true });

  if (!session) {
    return { status: "unauthenticated" };
  }

  return {
    status: "authenticated",
    accessToken: session.accessToken,
    user: session.user,
  };
}
