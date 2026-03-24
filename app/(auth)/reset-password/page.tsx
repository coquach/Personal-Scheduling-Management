import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password and continue planning."
      description="This page keeps the reset-token path stable for the future mocked password reset flow."
    >
      <Card className="w-full max-w-lg border-border/80 shadow-xl" data-testid="reset-password-page">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>Use the link from your email to finish the reset.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input data-testid="reset-password-new-input" type="password" placeholder="New password" />
          <Input
            data-testid="reset-password-confirm-input"
            type="password"
            placeholder="Confirm new password"
          />
          <Button data-testid="reset-password-submit" type="button" className="h-11">
            Reset password
          </Button>
          <p className="text-sm text-muted-foreground" data-testid="reset-password-error">
            Token validation and expiry handling will be wired to mocked auth responses in a later step.
          </p>
          <Link href="/auth" className="text-sm font-medium text-cyan-700 underline-offset-4 hover:underline">
            Return to login
          </Link>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
