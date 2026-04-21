import type { AuthUser } from "@/services/auth.service";
import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";

export type LoginActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: {
    email?: string[];
    password?: string[];
  };
  accessToken: string | null;
  user: AuthUser | null;
  redirectTo: string;
};

export type SessionActionResult =
  | {
      status: "authenticated";
      accessToken: string;
      user: AuthUser;
    }
  | {
      status: "unauthenticated";
    };

export const initialLoginActionState: LoginActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  accessToken: null,
  user: null,
  redirectTo: AUTH_ROUTE_PATHS.dashboard,
};
