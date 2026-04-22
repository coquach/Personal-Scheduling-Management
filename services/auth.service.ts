import "server-only";

import { backendApi, toBackendApiError } from "@/lib/backend-api";
import { AUTH_API_PATHS } from "@/lib/constants/auth";
import { type LoginPayload } from "@/lib/validation/auth";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
  roles: string[];
};

type ProfileResponse = {
  id: string;
  email: string;
  displayName: string | null;
  roles?: string[];
};

type AuthTokenBundle = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};

export type LoginResponse = AuthTokenBundle & {
  refreshToken: string;
  refreshTokenExpiresIn?: number;
  user: AuthUser;
};

export type RefreshResponse = AuthTokenBundle & {
  refreshToken?: string;
  refreshTokenExpiresIn?: number;
  user: AuthUser;
};

type LogoutPayload = {
  refreshToken: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

function unwrapApiEnvelope<T>(payload: T | ApiEnvelope<T>) {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    "success" in payload
  ) {
    return payload.data as T;
  }

  return payload as T;
}

export async function login(payload: LoginPayload) {
  try {
    const response = await backendApi.post<LoginResponse | ApiEnvelope<LoginResponse>>(
      AUTH_API_PATHS.login,
      payload,
    );
    return unwrapApiEnvelope(response.data);
  } catch (error) {
    throw toBackendApiError(error, "Unable to sign in. Please try again.");
  }
}

export async function refreshSession(refreshToken: string) {
  try {
    const response = await backendApi.post<RefreshResponse | ApiEnvelope<RefreshResponse>>(
      AUTH_API_PATHS.refresh,
      { refreshToken },
    );
    return unwrapApiEnvelope(response.data);
  } catch (error) {
    throw toBackendApiError(error, "Your session has expired. Please sign in again.");
  }
}

export async function logout(payload: LogoutPayload) {
  try {
    await backendApi.post(AUTH_API_PATHS.logout, payload);
  } catch (error) {
    throw toBackendApiError(error, "Unable to sign out cleanly.");
  }
}

export async function getCurrentUser(accessToken: string) {
  try {
    const response = await backendApi.get<
      ProfileResponse | ApiEnvelope<ProfileResponse>
    >(AUTH_API_PATHS.currentUser, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = unwrapApiEnvelope(response.data);

    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.displayName,
      roles: profile.roles ?? [],
    } satisfies AuthUser;
  } catch (error) {
    throw toBackendApiError(error, "Unable to load the current user.");
  }
}
