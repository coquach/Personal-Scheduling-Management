"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { MouseEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [registerFeedbackVisible, setRegisterFeedbackVisible] = useState(false);
  const redirectTarget = searchParams.get("redirect") ?? "/calendar";
  const enterHref = `/auth/enter?redirect=${encodeURIComponent(redirectTarget)}`;
  const handleForgotPassword = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.location.href = "/forgot-password";
  };

  return (
    <div data-testid="auth-page">
      <Card className="border-0 bg-transparent shadow-none">
        <CardContent className="space-y-6 px-2 pt-2">
          <div className="space-y-2">
            <h1 className="text-[2.35rem] leading-[1.02] font-bold tracking-[-0.055em] text-foreground">
              Access your planning workspace
            </h1>
            <p className="text-[0.98rem] leading-7 text-muted-foreground">
              Sign in to enter the scheduling workspace. During UI review, any credentials can be
              used to continue.
            </p>
          </div>
          <Tabs defaultValue="login" className="gap-5">
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1" data-testid="auth-tab-register">
                Register
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4">
              <Input type="email" placeholder="Email" data-testid="login-email-input" />
              <Input type="password" placeholder="Password" data-testid="login-password-input" />
              <div className="flex items-center justify-between gap-3">
                <a
                  href={enterHref}
                  data-testid="login-submit"
                  className={cn(buttonVariants({ variant: "default" }), "flex-1")}
                >
                  Sign in
                </a>
                <a
                  href="/forgot-password"
                  data-testid="forgot-password-link"
                  onClick={handleForgotPassword}
                  className={cn(buttonVariants({ variant: "ghost" }))}
                >
                  Forgot password
                </a>
              </div>
              <Alert data-testid="login-success-banner">
                Any credentials are accepted for now so the UI flow can be reviewed end to end.
              </Alert>
            </TabsContent>
            <TabsContent value="register" className="space-y-4">
              <Input placeholder="Full name" data-testid="register-name-input" />
              <Input type="email" placeholder="Email" data-testid="register-email-input" />
              <Input type="password" placeholder="Password" data-testid="register-password-input" />
              <Input
                type="password"
                placeholder="Confirm password"
                data-testid="register-confirm-password-input"
              />
              <Button
                className="w-full"
                data-testid="register-submit"
                onClick={() => setRegisterFeedbackVisible(true)}
              >
                Create account
              </Button>
              {registerFeedbackVisible ? (
                <Alert data-testid="register-success-banner">
                  Registration form is available for UI review.
                </Alert>
              ) : null}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
