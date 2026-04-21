import axios, { type AxiosError } from "axios";
import type { CreateAxiosDefaults } from "axios";

type BackendErrorPayload = {
  message?: string | string[];
  error?: string;
};

export class BackendApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
  }
}

export const apiBaseUrl =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_PSMS_API_URL ??
  "http://localhost:4000/api/v1";

export const defaultBackendHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "1",
} as const;

export function createBackendApiInstance(config: CreateAxiosDefaults = {}) {
  return axios.create({
    baseURL: apiBaseUrl,
    timeout: 10_000,
    headers: {
      ...defaultBackendHeaders,
      ...config.headers,
    },
    ...config,
  });
}

export const backendApi = createBackendApiInstance({
  baseURL:
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_PSMS_API_URL ??
    "http://localhost:4000/api/v1",
});

export function parseBackendErrorMessage(
  error: unknown,
  fallback = "Request failed. Please try again.",
) {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as BackendErrorPayload | string | undefined;

    if (typeof payload === "string" && payload.trim()) {
      return payload;
    }

    if (payload && typeof payload === "object" && Array.isArray(payload.message)) {
      return payload.message.join(", ");
    }

    if (
      payload &&
      typeof payload === "object" &&
      typeof payload.message === "string" &&
      payload.message.trim()
    ) {
      return payload.message;
    }

    if (
      payload &&
      typeof payload === "object" &&
      typeof payload.error === "string" &&
      payload.error.trim()
    ) {
      return payload.error;
    }

    if (error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function toBackendApiError(
  error: unknown,
  fallback = "Request failed. Please try again.",
) {
  if (error instanceof BackendApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<BackendErrorPayload | string>;
    return new BackendApiError(
      parseBackendErrorMessage(axiosError, fallback),
      axiosError.response?.status ?? 500,
    );
  }

  return new BackendApiError(parseBackendErrorMessage(error, fallback));
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (error instanceof BackendApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
