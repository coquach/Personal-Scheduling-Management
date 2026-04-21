import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";

export function sanitizeRedirectTarget(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string") {
    return AUTH_ROUTE_PATHS.calendar;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return AUTH_ROUTE_PATHS.calendar;
  }

  return value;
}
