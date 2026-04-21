"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/backend-api";
import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";
import { useResetPasswordMutation } from "@/query/auth-hooks";
import {
  resetPasswordFormSchema,
  verifyEmailRequestSchema,
  type ResetPasswordFormDto,
} from "@/lib/validation/auth";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const tokenValidation = verifyEmailRequestSchema.safeParse({ token });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const resetPasswordMutation = useResetPasswordMutation();
  const form = useForm<ResetPasswordFormDto>({
    resolver: zodResolver(resetPasswordFormSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!tokenValidation.success) {
      setErrorMessage("Reset token is missing.");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token: tokenValidation.data.token,
        newPassword: values.password,
      });
      setSuccessMessage(
        "Password updated successfully. You can sign in with the new password now.",
      );
      form.reset();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to reset password. Please request a new recovery email.",
        ),
      );
    }
  });

  return (
    <div data-testid="reset-password-page" className="space-y-6">
      <div className="space-y-3">
        <p className="inline-flex items-center rounded-full border border-border/80 bg-accent/55 px-3 py-1 text-[11px] font-semibold tracking-[0.07em] text-accent-foreground uppercase">
          Security update
        </p>
        <h1 className="text-[2.25rem] leading-[1.02] font-bold tracking-[-0.045em] text-foreground">
          Reset password
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Opened from email link. Token status:{" "}
          <span className="font-medium text-foreground">
            {token ? "ready" : "missing-token"}
          </span>
        </p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <Input
          type="password"
          placeholder="New password"
          data-testid="reset-password-new-input"
          autoComplete="new-password"
          className="h-11 rounded-xl border-border/80 bg-background/75"
          {...form.register("password", {
            onChange: () => setErrorMessage(null),
          })}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        ) : null}
        <Input
          type="password"
          placeholder="Confirm password"
          data-testid="reset-password-confirm-input"
          autoComplete="new-password"
          className="h-11 rounded-xl border-border/80 bg-background/75"
          {...form.register("confirmPassword", {
            onChange: () => setErrorMessage(null),
          })}
        />
        {form.formState.errors.confirmPassword ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.confirmPassword.message}
          </p>
        ) : null}
        <Button
          className="h-11 w-full rounded-xl text-sm font-semibold shadow-[0_10px_20px_rgba(26,115,232,0.24)]"
          type="submit"
          data-testid="reset-password-submit"
          disabled={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? "Updating..." : "Update password"}
        </Button>
        {successMessage ? (
          <Alert>
            <AlertTitle>Password updated</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : null}
        {errorMessage ? (
          <Alert variant="destructive" data-testid="reset-password-error">
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
