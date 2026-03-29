"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  login,
  register,
  resendVerificationEmail,
} from "@/api/auth";
import {
  loginRequestSchema,
  registerRequestSchema,
  type LoginRequestDto,
  type RegisterRequestDto,
} from "@/api/auth/dto";
import { ApiError, getApiErrorMessage } from "@/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type TabValue = "login" | "register";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") ?? "/calendar";

  const [activeTab, setActiveTab] = useState<TabValue>("login");
  const [resendPending, setResendPending] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const loginForm = useForm<LoginRequestDto>({
    resolver: zodResolver(loginRequestSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const registerForm = useForm<RegisterRequestDto>({
    resolver: zodResolver(registerRequestSchema),
    mode: "onChange",
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleLogin = loginForm.handleSubmit(async (values) => {
    setLoginError(null);
    setResendMessage(null);
    setUnverifiedEmail(null);

    try {
      await login({
        email: values.email.trim(),
        password: values.password,
      });
      window.location.assign(redirectTarget);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to sign in. Please try again.",
      );
      setLoginError(message);

      if (error instanceof ApiError && error.status === 403) {
        setUnverifiedEmail(values.email.trim());
      }
    }
  });

  const handleRegister = registerForm.handleSubmit(async (values) => {
    setRegisterError(null);
    setRegisterSuccess(null);
    setResendMessage(null);

    try {
      await register({
        displayName: values.displayName.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      setRegisterSuccess(
        "Account created successfully. Check your inbox and click the verification link to activate your account.",
      );
      registerForm.reset({
        displayName: values.displayName.trim(),
        email: values.email.trim(),
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to create your account. Please try again.",
      );

      if (error instanceof ApiError && error.status === 409) {
        registerForm.setError("email", {
          type: "server",
          message,
        });
      } else {
        setRegisterError(message);
      }
    }
  });

  async function handleResendVerification(email: string) {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return;
    }

    setResendPending(true);
    setResendMessage(null);

    try {
      await resendVerificationEmail(trimmedEmail);
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
  }

  return (
    <div data-testid="auth-page">
      <Card className="border-0 bg-transparent shadow-none">
        <CardContent className="space-y-6 px-2 pt-2">
          <div className="space-y-2">
            <h1 className="text-[2.35rem] leading-[1.02] font-bold tracking-[-0.055em] text-foreground">
              Access your planning workspace
            </h1>
            <p className="text-[0.98rem] leading-7 text-muted-foreground">
              Sign in with your PSMS account or register a new one, then confirm
              your email before the first login.
            </p>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabValue)}
            className="gap-5"
          >
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1">
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="flex-1"
                data-testid="auth-tab-register"
              >
                Register
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form className="space-y-4" onSubmit={handleLogin} noValidate>
                <Input
                  type="email"
                  placeholder="Email"
                  data-testid="login-email-input"
                  autoComplete="email"
                  {...loginForm.register("email", {
                    onChange: () => setLoginError(null),
                  })}
                />
                {loginForm.formState.errors.email ? (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                ) : null}
                <Input
                  type="password"
                  placeholder="Password"
                  data-testid="login-password-input"
                  autoComplete="current-password"
                  {...loginForm.register("password", {
                    onChange: () => setLoginError(null),
                  })}
                />
                {loginForm.formState.errors.password ? (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                ) : null}
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="submit"
                    data-testid="login-submit"
                    disabled={loginForm.formState.isSubmitting || !loginForm.formState.isValid}
                    className={cn(buttonVariants({ variant: "default" }), "flex-1")}
                  >
                    {loginForm.formState.isSubmitting ? "Signing in..." : "Sign in"}
                  </button>
                  <Button
                    variant="ghost"
                    render={<Link href="/forgot-password" />}
                    data-testid="forgot-password-link"
                  >
                    Forgot password
                  </Button>
                </div>
                <Alert data-testid="login-success-banner">
                  <AlertDescription>
                    Use your registered email and password to access the workspace.
                  </AlertDescription>
                </Alert>
                {loginError ? (
                  <Alert variant="destructive" data-testid="login-error-banner">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                ) : null}
                {unverifiedEmail ? (
                  <Alert>
                    <AlertTitle>Email verification required</AlertTitle>
                    <AlertDescription>
                      Your account exists but is not verified yet. Send a new
                      verification email and then open the link from your inbox.
                    </AlertDescription>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        disabled={resendPending}
                        type="button"
                        onClick={() => handleResendVerification(unverifiedEmail)}
                      >
                        {resendPending
                          ? "Sending verification..."
                          : "Resend verification email"}
                      </Button>
                    </div>
                  </Alert>
                ) : null}
                {resendMessage ? (
                  <Alert>
                    <AlertDescription>{resendMessage}</AlertDescription>
                  </Alert>
                ) : null}
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form className="space-y-4" onSubmit={handleRegister} noValidate>
                <Input
                  placeholder="Full name"
                  data-testid="register-name-input"
                  autoComplete="name"
                  {...registerForm.register("displayName", {
                    onChange: () => setRegisterError(null),
                  })}
                />
                {registerForm.formState.errors.displayName ? (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.displayName.message}
                  </p>
                ) : null}
                <Input
                  type="email"
                  placeholder="Email"
                  data-testid="register-email-input"
                  autoComplete="email"
                  {...registerForm.register("email", {
                    onChange: () => {
                      setRegisterError(null);
                      registerForm.clearErrors("email");
                    },
                  })}
                />
                {registerForm.formState.errors.email ? (
                  <p
                    className="text-sm text-destructive"
                    data-testid="register-email-error"
                  >
                    {registerForm.formState.errors.email.message}
                  </p>
                ) : null}
                <Input
                  type="password"
                  placeholder="Password"
                  data-testid="register-password-input"
                  autoComplete="new-password"
                  {...registerForm.register("password", {
                    onChange: () => setRegisterError(null),
                  })}
                />
                {registerForm.formState.errors.password ? (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.password.message}
                  </p>
                ) : null}
                <Input
                  type="password"
                  placeholder="Confirm password"
                  data-testid="register-confirm-password-input"
                  autoComplete="new-password"
                  {...registerForm.register("confirmPassword", {
                    onChange: () => setRegisterError(null),
                  })}
                />
                {registerForm.formState.errors.confirmPassword ? (
                  <p
                    className="text-sm text-destructive"
                    data-testid="register-confirm-error"
                  >
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                ) : null}
                <Button
                  className="w-full"
                  type="submit"
                  data-testid="register-submit"
                  disabled={registerForm.formState.isSubmitting || !registerForm.formState.isValid}
                >
                  {registerForm.formState.isSubmitting
                    ? "Creating account..."
                    : "Create account"}
                </Button>
                {registerError ? (
                  <Alert variant="destructive">
                    <AlertDescription>{registerError}</AlertDescription>
                  </Alert>
                ) : null}
                {registerSuccess ? (
                  <Alert data-testid="register-success-banner">
                    <AlertTitle>Verification email sent</AlertTitle>
                    <AlertDescription>{registerSuccess}</AlertDescription>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        disabled={resendPending}
                        type="button"
                        onClick={() =>
                          handleResendVerification(registerForm.getValues("email"))
                        }
                      >
                        {resendPending
                          ? "Sending verification..."
                          : "Resend verification email"}
                      </Button>
                    </div>
                  </Alert>
                ) : null}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
