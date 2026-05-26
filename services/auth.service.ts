import "server-only";

import { backendApi, toBackendApiError, unwrapEnvelope } from "@/lib/api-core";
import { AUTH_API_PATHS } from "@/lib/constants/auth";
import { type LoginPayload } from "@/model/auth";
import type {
  AuthUser,
  LoginResponse,
  LogoutPayload,
  ProfileResponse,
  RefreshResponse,
} from "@/model/auth";
import type { ApiEnvelope } from "@/model/common";

export type { AuthUser, LoginResponse, RefreshResponse } from "@/model/auth";

export async function login(payload: LoginPayload) {
  try {
    const response = await backendApi.post<LoginResponse | ApiEnvelope<LoginResponse>>(
      AUTH_API_PATHS.login,
      payload,
    );
    return unwrapEnvelope(response.data) as LoginResponse;
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
    return unwrapEnvelope(response.data) as RefreshResponse;
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

    const profile = unwrapEnvelope(response.data) as ProfileResponse;

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
