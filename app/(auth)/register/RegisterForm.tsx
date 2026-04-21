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
import { useRegisterMutation } from "@/query/auth-hooks";
import {
  registerFormSchema,
  type RegisterFormDto,
} from "@/lib/validation/auth";

export function RegisterForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const registerMutation = useRegisterMutation();

  const form = useForm<RegisterFormDto>({
    resolver: zodResolver(registerFormSchema),
    mode: "onChange",
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await registerMutation.mutateAsync({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
      });

      form.reset({
        displayName: values.displayName.trim(),
        email: values.email.trim(),
        password: "",
        confirmPassword: "",
      });
      setSuccessMessage(
        "Registration successful. Please check your email to verify your account.",
      );
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Unable to register. Please try again."),
      );
    }
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      noValidate
      data-testid="register-form"
    >
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="displayName">
          Display name
        </label>
        <Input
          id="displayName"
          type="text"
          placeholder="Jane Planner"
          data-testid="register-name-input"
          autoComplete="name"
          className="h-11 rounded-xl border-border/80 bg-background/75"
          {...form.register("displayName", {
            onChange: () => setErrorMessage(null),
          })}
        />
        {form.formState.errors.displayName ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.displayName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          data-testid="register-email-input"
          autoComplete="email"
          className="h-11 rounded-xl border-border/80 bg-background/75"
          {...form.register("email", {
            onChange: () => setErrorMessage(null),
          })}
        />
        {form.formState.errors.email ? (
          <p className="text-sm text-destructive" data-testid="register-email-error">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="password">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Create a secure password"
          data-testid="register-password-input"
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
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="confirmPassword">
          Confirm password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter password"
          data-testid="register-confirm-password-input"
          autoComplete="new-password"
          className="h-11 rounded-xl border-border/80 bg-background/75"
          {...form.register("confirmPassword", {
            onChange: () => setErrorMessage(null),
          })}
        />
        {form.formState.errors.confirmPassword ? (
          <p className="text-sm text-destructive" data-testid="register-confirm-error">
            {form.formState.errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        className="h-11 w-full rounded-xl text-sm font-semibold shadow-[0_10px_20px_rgba(26,115,232,0.24)]"
        disabled={registerMutation.isPending || !form.formState.isValid}
        data-testid="register-submit"
      >
        {registerMutation.isPending ? "Registering..." : "Create account"}
      </Button>

      {successMessage ? (
        <Alert data-testid="register-success-banner">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert variant="destructive">
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
  );
}
