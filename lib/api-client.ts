"use client";

import axios, { type Method, type AxiosRequestConfig } from "axios";

import { clear, getAccessToken, setAccessToken } from "@/lib/auth-store";
import { createBackendApiInstance, toBackendApiError, unwrapEnvelope } from "@/lib/api-core";
import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";
import type { ApiEnvelope } from "@/model/common";

export type FullBrowserApiResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
};

type BrowserApiOptions = {
  auth?: boolean;
  responseType?: "arraybuffer" | "blob" | "document" | "json" | "text" | "stream";
  returnFullResponse?: boolean;
  params?: Record<string, string | number | boolean | null | undefined>;
};

type EnvelopeLike<T> = ApiEnvelope<T> | null | undefined | string;
type BrowserApiRequestConfig = {
  _retry?: boolean;
  _skipAuth?: boolean;
};

const browserApi = createBackendApiInstance();
let refreshAccessTokenPromise: Promise<string | null> | null = null;

function getTestAccessTokenOverride() {
  if (typeof window === "undefined") {
    return null;
  }

  const token = (
    window as Window & { __PSMS_TEST_ACCESS_TOKEN__?: string }
  ).__PSMS_TEST_ACCESS_TOKEN__;

  return token?.trim() ? token : null;
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
  const requestConfig = config as typeof config & BrowserApiRequestConfig;
  const skipAuth = requestConfig._skipAuth === true;

  if (!skipAuth) {
    let accessToken = getAccessToken();

    if (!accessToken) {
      const testAccessToken = getTestAccessTokenOverride();
      if (testAccessToken) {
        setAccessToken(testAccessToken);
        accessToken = testAccessToken;
      }
    }

    if (!accessToken) {
      accessToken = await refreshAccessToken();
    }

    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    } else {
      config.headers.delete("Authorization");
    }
  }

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
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await browserApi.request<EnvelopeLike<T>>({
      url: path,
      method: (init?.method as Method | undefined) ?? "GET",
      headers: Object.fromEntries(headers.entries()),
      data: init?.body,
      params: options.params,
      responseType: options.responseType,
      _skipAuth: options.auth === false,
    } as AxiosRequestConfig & BrowserApiRequestConfig);

    if (options.returnFullResponse) {
      return response as unknown as T;
    }

    if (options.responseType && options.responseType !== "json") {
      return response.data as unknown as T;
    }

    return unwrapEnvelope(response.data) as T;
  } catch (error) {
    throw toBackendApiError(error, "API request failed.");
  }
}
