"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-core";
import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";
import { useResetPasswordMutation } from "@/query/auth-hooks";
import {
  resetPasswordFormSchema,
  verifyEmailRequestSchema,
  type ResetPasswordFormDto,
} from "@/model/auth";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const tokenValidation = verifyEmailRequestSchema.safeParse({ token });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const resetPasswordMutation = useResetPasswordMutation();
  const form = useForm<ResetPasswordFormDto>({
    resolver: zodResolver(resetPasswordFormSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
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
    <div data-testid="reset-password-page" className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Reset password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter a new secure password for your account
        </p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <Input
          type="password"
          placeholder="New password"
          data-testid="reset-password-new-input"
          autoComplete="new-password"
          className="h-11 rounded-xl border-white/20 bg-input/50 backdrop-blur-md transition-colors hover:bg-input focus:bg-input"
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
          className="h-11 rounded-xl border-white/20 bg-input/50 backdrop-blur-md transition-colors hover:bg-input focus:bg-input"
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
          className="h-11 w-full rounded-xl text-sm font-semibold shadow-[0_8px_16px_rgba(139,92,246,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(139,92,246,0.35)]"
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
        <div className="text-center text-sm pt-2">
          <Link href={AUTH_ROUTE_PATHS.login} className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
