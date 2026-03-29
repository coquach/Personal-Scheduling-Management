import axios, { AxiosHeaders, type Method } from "axios";

import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAuthSession,
  type AuthSession,
} from "@/api/auth/session";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ApiClientOptions = {
  auth?: boolean;
};

type EnvelopeLike<T> = ApiEnvelope<T> | null | undefined | string;
type ApiRequestConfig = {
  _retry?: boolean;
  _skipAuth?: boolean;
};

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_PSMS_API_URL ?? "http://localhost:4000/api/v1";

const defaultHeaders = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "1",
};

const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  headers: defaultHeaders,
  timeout: 10000,
});

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  headers: defaultHeaders,
  timeout: 10000,
});

let refreshSessionPromise: Promise<AuthSession | null> | null = null;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function extractEnvelopeData<T>(payload: EnvelopeLike<T>) {
  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    return undefined;
  }

  return payload.data as T;
}

function toApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { message?: string | string[] }
      | string
      | undefined;
    const message =
      typeof payload === "string"
        ? payload
        : Array.isArray(payload?.message)
          ? payload.message.join(", ")
          : payload?.message ?? error.message ?? "API request failed";

    return new ApiError(message, error.response?.status ?? 500);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500);
  }

  return new ApiError("API request failed", 500);
}

function redirectToAuth() {
  if (typeof window === "undefined") {
    return;
  }

  const redirectTarget =
    window.location.pathname + window.location.search + window.location.hash;
  window.location.assign(`/auth?redirect=${encodeURIComponent(redirectTarget)}`);
}

async function refreshSession() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  if (!refreshSessionPromise) {
    refreshSessionPromise = refreshClient
      .post<ApiEnvelope<AuthSession>>("/auth/refresh", { refreshToken })
      .then((response) => response.data.data ?? null)
      .finally(() => {
        refreshSessionPromise = null;
      });
  }

  return refreshSessionPromise;
}

axiosClient.interceptors.request.use(async (config) => {
  const headers = AxiosHeaders.from(config.headers);
  const skipAuth = headers.get("x-psms-skip-auth") === "1";
  const requestConfig = config as typeof config & ApiRequestConfig;

  requestConfig._skipAuth = skipAuth;

  headers.delete("x-psms-skip-auth");

  if (!skipAuth) {
    let accessToken = getAccessToken();

    if (!accessToken && getRefreshToken()) {
      try {
        const nextSession = await refreshSession();

        if (nextSession) {
          setAuthSession(nextSession);
          accessToken = nextSession.accessToken;
        } else {
          clearAuthSession();
        }
      } catch {
        clearAuthSession();
      }
    }

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    } else {
      headers.delete("Authorization");
    }
  }

  config.headers = headers;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
      _skipAuth?: boolean;
    };
    const status = error.response?.status;
    const refreshToken = getRefreshToken();

    if (status !== 401 || originalRequest._skipAuth) {
      return Promise.reject(error);
    }

    if (originalRequest._retry || !refreshToken) {
      clearAuthSession();
      redirectToAuth();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const nextSession = await refreshSession();

      if (!nextSession) {
        clearAuthSession();
        redirectToAuth();
        return Promise.reject(error);
      }

      setAuthSession(nextSession);

      const headers = AxiosHeaders.from(originalRequest.headers);
      headers.set("Authorization", `Bearer ${nextSession.accessToken}`);
      originalRequest.headers = headers;

      return axiosClient.request(originalRequest);
    } catch (refreshError) {
      clearAuthSession();
      redirectToAuth();
      return Promise.reject(refreshError);
    }
  },
);

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
  options: ApiClientOptions = {},
): Promise<T> {
  const headers = new Headers(init?.headers);
  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth === false) {
    headers.set("x-psms-skip-auth", "1");
  }

  try {
    const response = await axiosClient.request<EnvelopeLike<T>>({
      url: path,
      method: (init?.method as Method | undefined) ?? "GET",
      headers: Object.fromEntries(headers.entries()),
      data: init?.body,
    });

    return extractEnvelopeData(response.data) as T;
  } catch (error) {
    throw toApiError(error);
  }
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
