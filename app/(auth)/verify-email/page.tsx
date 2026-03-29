"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  resendVerificationEmail,
  verifyEmail,
} from "@/api/auth";
import {
  resendVerificationEmailRequestSchema,
  verifyEmailRequestSchema,
  type ResendVerificationEmailRequestDto,
} from "@/api/auth/dto";
import { getApiErrorMessage } from "@/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const hasAttemptedRef = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your email address...");
  const [resendPending, setResendPending] = useState(false);
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
      setStatus("error");
      setMessage("Verification token is missing or invalid.");
      return;
    }

    void (async () => {
      try {
        await verifyEmail(tokenValidation.data.token);
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
  }, [token]);

  const handleResend = resendForm.handleSubmit(async (values) => {
    setResendPending(true);
    setResendMessage(null);

    try {
      await resendVerificationEmail(values.email.trim());
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
    } finally {
      setResendPending(false);
    }
  });

  return (
    <div data-testid="verify-email-page">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="px-2">
          <CardTitle className="text-[2.15rem] leading-[1.04] font-bold tracking-[-0.05em]">
            Verify email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-2">
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
                type="email"
                placeholder="Enter your email to resend verification"
                autoComplete="email"
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
                variant="outline"
                type="submit"
                disabled={resendPending || !resendForm.formState.isValid}
              >
                {resendPending
                  ? "Sending verification..."
                  : "Resend verification email"}
              </Button>
              {resendMessage ? (
                <Alert>
                  <AlertDescription>{resendMessage}</AlertDescription>
                </Alert>
              ) : null}
            </form>
          ) : null}
          <Button render={<Link href="/auth" />}>
            Back to login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
