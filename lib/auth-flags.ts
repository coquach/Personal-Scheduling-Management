import { AUTH_BYPASS_ROUTE_GUARD_ENV } from "@/lib/constants/auth";

const TRUTHY_VALUES = new Set(["1", "true", "yes", "on"]);

export function isAuthRouteBypassEnabled() {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const rawValue = process.env[AUTH_BYPASS_ROUTE_GUARD_ENV];

  if (!rawValue) {
    return false;
  }

  return TRUTHY_VALUES.has(rawValue.trim().toLowerCase());
}
