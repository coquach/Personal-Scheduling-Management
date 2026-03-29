"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { resetPassword } from "@/api/auth";
import {
  resetPasswordFormSchema,
  verifyEmailRequestSchema,
  type ResetPasswordFormDto,
} from "@/api/auth/dto";
import { getApiErrorMessage } from "@/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const tokenValidation = verifyEmailRequestSchema.safeParse({ token });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
      await resetPassword({
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
    <div data-testid="reset-password-page">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="px-2">
          <CardTitle className="text-[2.15rem] leading-[1.04] font-bold tracking-[-0.05em]">
            Reset password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-2">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <p className="text-sm leading-6 text-muted-foreground">
              Opened from email link. Token status:{" "}
              <span className="font-medium text-foreground">
                {token ? "ready" : "missing-token"}
              </span>
            </p>
            <Input
              type="password"
              placeholder="New password"
              data-testid="reset-password-new-input"
              autoComplete="new-password"
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
              className="w-full"
              type="submit"
              data-testid="reset-password-submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Updating..." : "Update password"}
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
            <Button variant="ghost" render={<Link href="/auth" />}>
              Back to login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
