"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-core";
import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";
import {
  useResendVerificationEmailMutation,
  useVerifyEmailMutation,
} from "@/query/auth-hooks";
import {
  resendVerificationEmailRequestSchema,
  verifyEmailRequestSchema,
  type ResendVerificationEmailRequestDto,
} from "@/model/validation/auth";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const hasAttemptedRef = useRef(false);
  const initialTokenValidation = verifyEmailRequestSchema.safeParse({ token });
  const verifyEmailMutation = useVerifyEmailMutation();
  const resendVerificationEmailMutation = useResendVerificationEmailMutation();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    initialTokenValidation.success ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    initialTokenValidation.success
      ? "Verifying your email address..."
      : "Verification token is missing or invalid.",
  );
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const resendForm = useForm<ResendVerificationEmailRequestDto>({
    resolver: zodResolver(resendVerificationEmailRequestSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (hasAttemptedRef.current) {
      return;
    }

    hasAttemptedRef.current = true;

    const tokenValidation = verifyEmailRequestSchema.safeParse({ token });

    if (!tokenValidation.success) {
      return;
    }

    void (async () => {
      try {
        await verifyEmailMutation.mutateAsync({
          token: tokenValidation.data.token,
        });
        setStatus("success");
        setMessage("Your email has been verified successfully.");
      } catch (error) {
        setStatus("error");
        setMessage(
          getApiErrorMessage(
            error,
            "Unable to verify email. Please request a new verification link.",
          ),
        );
      }
    })();
  }, [token, verifyEmailMutation]);

  const handleResend = resendForm.handleSubmit(async (values) => {
    setResendMessage(null);

    try {
      await resendVerificationEmailMutation.mutateAsync({
        email: values.email,
      });
      setResendMessage(
        "If the account exists and is not verified, a new verification email has been sent.",
      );
    } catch (error) {
      setResendMessage(
        getApiErrorMessage(
          error,
          "Unable to resend verification email. Please try again.",
        ),
      );
    }
  });

  return (
    <div data-testid="verify-email-page" className="space-y-8 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Verify email
        </h1>
        <p className="text-sm text-muted-foreground">
          Checking your verification token...
        </p>
      </div>

      {status === "loading" ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {status === "success" ? (
        <Alert data-testid="verify-email-success">
          <AlertTitle>Verification completed</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {status === "error" ? (
        <Alert variant="destructive" data-testid="verify-email-error">
          <AlertTitle>Verification failed</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {status === "error" ? (
        <form className="space-y-4" onSubmit={handleResend} noValidate>
          <Input
            data-testid="verify-email-resend-input"
            type="email"
            placeholder="Enter your email to resend verification"
            autoComplete="email"
            className="h-11 rounded-xl border-white/20 bg-input/50 backdrop-blur-md transition-colors hover:bg-input focus:bg-input text-left"
            {...resendForm.register("email", {
              onChange: () => setResendMessage(null),
            })}
          />
          {resendForm.formState.errors.email ? (
            <p className="text-sm text-destructive">
              {resendForm.formState.errors.email.message}
            </p>
          ) : null}
          <Button
            data-testid="verify-email-resend-submit"
            variant="outline"
            className="h-11 w-full rounded-xl bg-white/40 hover:bg-white/60 dark:bg-black/40 dark:hover:bg-black/60"
            type="submit"
            disabled={resendVerificationEmailMutation.isPending || !resendForm.formState.isValid}
          >
            {resendVerificationEmailMutation.isPending
              ? "Sending verification..."
              : "Resend verification email"}
          </Button>
          {resendMessage ? (
            <Alert data-testid="verify-email-resend-message">
              <AlertDescription>{resendMessage}</AlertDescription>
            </Alert>
          ) : null}
        </form>
      ) : null}
      <div className="pt-4">
        <Link href={AUTH_ROUTE_PATHS.login} className="font-medium text-primary hover:underline text-sm">
          Return to sign in
        </Link>
      </div>
    </div>
  );
}
