"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-core";
import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";
import { useForgotPasswordMutation } from "@/query/auth-hooks";
import {
  forgotPasswordRequestSchema,
  type ForgotPasswordRequestDto,
} from "@/model/validation/auth";

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
    <div data-testid="forgot-password-page" className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Account recovery
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to receive reset instructions
        </p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <Input
          type="email"
          placeholder="registered.user@example.com"
          data-testid="forgot-password-email-input"
          autoComplete="email"
          className="h-11 rounded-xl border-white/20 bg-input/50 backdrop-blur-md transition-colors hover:bg-input focus:bg-input"
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
          className="h-11 w-full rounded-xl text-sm font-semibold shadow-[0_8px_16px_rgba(139,92,246,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(139,92,246,0.35)]"
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
        <div className="text-center text-sm pt-2">
          <Link href={AUTH_ROUTE_PATHS.login} className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
