"use client";

import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <div data-testid="forgot-password-page">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="px-2">
          <CardTitle className="text-[2.15rem] leading-[1.04] font-bold tracking-[-0.05em]">
            Forgot password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-2">
          <p className="text-sm leading-6 text-muted-foreground">
            Enter your email and we&apos;ll send recovery instructions.
          </p>
          <Input
            type="email"
            placeholder="registered.user@example.com"
            data-testid="forgot-password-email-input"
          />
          <Button className="w-full" data-testid="forgot-password-submit">
            Send recovery email
          </Button>
          <Alert data-testid="forgot-password-success">
            Recovery email sent. Check your inbox for the reset link.
          </Alert>
          <Button variant="ghost" render={<Link href="/auth" />}>
            Back to login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
