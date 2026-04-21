export const AUTH_REFRESH_TOKEN_COOKIE_NAME = "psms-refresh-token";
export const AUTH_BYPASS_ROUTE_GUARD_ENV = "AUTH_BYPASS_ROUTE_GUARD";

export const AUTH_ROUTE_PATHS = {
  alias: "/auth",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  calendar: "/calendar",
} as const;

export const AUTH_ROUTE_MATCHER_PATHS = [
  AUTH_ROUTE_PATHS.alias,
  `${AUTH_ROUTE_PATHS.alias}/`,
  AUTH_ROUTE_PATHS.login,
  AUTH_ROUTE_PATHS.register,
  AUTH_ROUTE_PATHS.forgotPassword,
  AUTH_ROUTE_PATHS.resetPassword,
  AUTH_ROUTE_PATHS.verifyEmail,
] as const;

export const AUTH_PUBLIC_PAGE_PATHS = new Set<string>([
  AUTH_ROUTE_PATHS.login,
  AUTH_ROUTE_PATHS.register,
  AUTH_ROUTE_PATHS.forgotPassword,
  AUTH_ROUTE_PATHS.resetPassword,
  AUTH_ROUTE_PATHS.verifyEmail,
]);

export const AUTH_API_PATHS = {
  login: "/auth/login",
  register: "/auth/register",
  refresh: "/auth/refresh",
  logout: "/auth/logout",
  verifyEmail: "/auth/verify-email",
  resendVerificationEmail: "/auth/resend-verification-email",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  currentUser: "/profile",
} as const;
