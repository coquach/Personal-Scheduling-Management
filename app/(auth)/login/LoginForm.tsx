"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";
import {
  loginAction,
} from "@/features/auth/server/actions";
import { initialLoginActionState } from "@/features/auth/server/types";


export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? AUTH_ROUTE_PATHS.calendar;
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialLoginActionState,
  );

  return (
    <form
      action={formAction}
      className="space-y-5"
      noValidate
      data-testid="auth-login-form"
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          data-testid="login-email-input"
          aria-invalid={Boolean(state.fieldErrors.email?.length)}
          className="h-11 rounded-xl border-white/20 bg-input/50 backdrop-blur-md transition-colors hover:bg-input focus:bg-input"
        />
        {state.fieldErrors.email?.map((message) => (
          <p key={message} className="text-sm text-destructive">
            {message}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="password">
          Password
          </label>
          <a
            href={AUTH_ROUTE_PATHS.forgotPassword}
            className="text-xs font-medium text-primary hover:underline"
          >
            Forgot password?
          </a>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          data-testid="login-password-input"
          aria-invalid={Boolean(state.fieldErrors.password?.length)}
          className="h-11 rounded-xl border-white/20 bg-input/50 backdrop-blur-md transition-colors hover:bg-input focus:bg-input"
        />
        {state.fieldErrors.password?.map((message) => (
          <p key={message} className="text-sm text-destructive">
            {message}
          </p>
        ))}
      </div>

      {state.message ? (
        <Alert variant="destructive" data-testid="login-error-banner">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      {state.status === "success" ? (
        <Alert data-testid="login-success-banner">
          <AlertDescription>Signing you in and restoring the workspace...</AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        className="h-11 w-full rounded-xl text-sm font-semibold shadow-[0_8px_16px_rgba(139,92,246,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(139,92,246,0.35)]"
        disabled={pending}
        data-testid="login-submit"
      >
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
