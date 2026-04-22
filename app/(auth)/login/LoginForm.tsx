"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  loginAction,
} from "@/features/auth/server/actions";
import { initialLoginActionState } from "@/features/auth/server/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";
import { setAccessToken } from "@/lib/auth-store";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? AUTH_ROUTE_PATHS.calendar;
  const hasNavigatedRef = useRef(false);
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialLoginActionState,
  );

  useEffect(() => {
    if (state.status !== "success" || !state.accessToken) {
      return;
    }

    if (hasNavigatedRef.current) {
      return;
    }
    hasNavigatedRef.current = true;

    setAccessToken(state.accessToken);
    router.replace(state.redirectTo || redirectTo);
  }, [redirectTo, router, state.accessToken, state.redirectTo, state.status]);

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
          className="h-11 rounded-xl border-border/80 bg-background/75"
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
          className="h-11 rounded-xl border-border/80 bg-background/75"
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
        className="h-11 w-full rounded-xl text-sm font-semibold shadow-[0_10px_20px_rgba(26,115,232,0.24)]"
        disabled={pending}
        data-testid="login-submit"
      >
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
