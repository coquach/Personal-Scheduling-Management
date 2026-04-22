"use client";

import axios, { AxiosHeaders, type Method } from "axios";

import { clear, getAccessToken, setAccessToken } from "@/lib/auth-store";
import { createBackendApiInstance, toBackendApiError } from "@/lib/backend-api";
import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

type BrowserApiOptions = {
  auth?: boolean;
};

type EnvelopeLike<T> = ApiEnvelope<T> | null | undefined | string;
type BrowserApiRequestConfig = {
  _retry?: boolean;
  _skipAuth?: boolean;
};

const browserApi = createBackendApiInstance();
let refreshAccessTokenPromise: Promise<string | null> | null = null;

function extractEnvelopeData<T>(payload: EnvelopeLike<T>) {
  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    return undefined;
  }

  return payload.data as T;
}

function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  const redirectTarget =
    window.location.pathname + window.location.search + window.location.hash;
  window.location.assign(
    `${AUTH_ROUTE_PATHS.login}?redirect=${encodeURIComponent(redirectTarget)}`,
  );
}

async function refreshAccessToken() {
  if (!refreshAccessTokenPromise) {
    refreshAccessTokenPromise = import("@/features/auth/server/actions")
      .then(({ refreshSessionAction }) => refreshSessionAction())
      .then((response) => {
        if (response.status !== "authenticated") {
          clear();
          return null;
        }

        setAccessToken(response.accessToken);
        return response.accessToken;
      })
      .catch(() => {
        clear();
        return null;
      })
      .finally(() => {
        refreshAccessTokenPromise = null;
      });
  }

  return refreshAccessTokenPromise;
}

browserApi.interceptors.request.use(async (config) => {
  const headers = AxiosHeaders.from(config.headers);
  const skipAuth = headers.get("x-psms-skip-auth") === "1";
  const requestConfig = config as typeof config & BrowserApiRequestConfig;

  requestConfig._skipAuth = skipAuth;
  headers.delete("x-psms-skip-auth");

  if (!skipAuth) {
    let accessToken = getAccessToken();

    if (!accessToken) {
      accessToken = await refreshAccessToken();
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

browserApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as typeof error.config & BrowserApiRequestConfig;

    if (error.response?.status !== 401 || originalRequest._skipAuth) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clear();
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();

      if (!accessToken) {
        clear();
        redirectToLogin();
        return Promise.reject(error);
      }

      const headers = AxiosHeaders.from(originalRequest.headers);
      headers.set("Authorization", `Bearer ${accessToken}`);
      originalRequest.headers = headers;

      return browserApi.request(originalRequest);
    } catch (refreshError) {
      clear();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  },
);

export async function browserApiRequest<T>(
  path: string,
  init?: RequestInit,
  options: BrowserApiOptions = {},
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
    const response = await browserApi.request<EnvelopeLike<T>>({
      url: path,
      method: (init?.method as Method | undefined) ?? "GET",
      headers: Object.fromEntries(headers.entries()),
      data: init?.body,
    });

    return extractEnvelopeData(response.data) as T;
  } catch (error) {
    throw toBackendApiError(error, "API request failed.");
  }
}
