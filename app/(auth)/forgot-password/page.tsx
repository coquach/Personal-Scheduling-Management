"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/backend-api";
import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";
import { useForgotPasswordMutation } from "@/query/auth-hooks";
import {
  forgotPasswordRequestSchema,
  type ForgotPasswordRequestDto,
} from "@/lib/validation/auth";

export default function ForgotPasswordPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const forgotPasswordMutation = useForgotPasswordMutation();
  const form = useForm<ForgotPasswordRequestDto>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await forgotPasswordMutation.mutateAsync({
        email: values.email,
      });
      setSuccessMessage(
        "If the account exists, reset instructions have been sent to the registered email.",
      );
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to send recovery email. Please try again.",
        ),
      );
    }
  });

  return (
    <div data-testid="forgot-password-page" className="space-y-6">
      <div className="space-y-3">
        <p className="inline-flex items-center rounded-full border border-border/80 bg-accent/55 px-3 py-1 text-[11px] font-semibold tracking-[0.07em] text-accent-foreground uppercase">
          Account recovery
        </p>
        <h1 className="text-[2.25rem] leading-[1.02] font-bold tracking-[-0.045em] text-foreground">
          Forgot password
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Enter your email and we&apos;ll send recovery instructions.
        </p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <Input
          type="email"
          placeholder="registered.user@example.com"
          data-testid="forgot-password-email-input"
          autoComplete="email"
          className="h-11 rounded-xl border-border/80 bg-background/75"
          {...form.register("email", {
            onChange: () => setErrorMessage(null),
          })}
        />
        {form.formState.errors.email ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        ) : null}
        <Button
          className="h-11 w-full rounded-xl text-sm font-semibold shadow-[0_10px_20px_rgba(26,115,232,0.24)]"
          type="submit"
          data-testid="forgot-password-submit"
          disabled={forgotPasswordMutation.isPending}
        >
          {forgotPasswordMutation.isPending ? "Sending..." : "Send recovery email"}
        </Button>
        {successMessage ? (
          <Alert data-testid="forgot-password-success">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : null}
        {errorMessage ? (
          <Alert variant="destructive" data-testid="forgot-password-error">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
        <Button
          variant="ghost"
          className="rounded-full"
          render={<Link href={AUTH_ROUTE_PATHS.login} />}
        >
          Back to login
        </Button>
      </form>
    </div>
  );
}
