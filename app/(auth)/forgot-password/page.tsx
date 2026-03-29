"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { forgotPassword } from "@/api/auth";
import {
  forgotPasswordRequestSchema,
  type ForgotPasswordRequestDto,
} from "@/api/auth/dto";
import { getApiErrorMessage } from "@/api/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
      await forgotPassword(values.email.trim());
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
    <div data-testid="forgot-password-page">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="px-2">
          <CardTitle className="text-[2.15rem] leading-[1.04] font-bold tracking-[-0.05em]">
            Forgot password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-2">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <p className="text-sm leading-6 text-muted-foreground">
              Enter your email and we&apos;ll send recovery instructions.
            </p>
            <Input
              type="email"
              placeholder="registered.user@example.com"
              data-testid="forgot-password-email-input"
              autoComplete="email"
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
              className="w-full"
              type="submit"
              data-testid="forgot-password-submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Sending..." : "Send recovery email"}
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
            <Button variant="ghost" render={<Link href="/auth" />}>
              Back to login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
