import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset access without losing your schedule."
      description="The forgot-password flow is scaffolded before business logic so the real Playwright reset scenarios can plug straight into a stable screen contract."
    >
      <Card className="w-full max-w-lg border-border/80 shadow-xl" data-testid="forgot-password-page">
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>Enter the registered email to receive a reset link.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input
            data-testid="forgot-password-email-input"
            type="email"
            placeholder="john.doe@example.com"
          />
          <Button data-testid="forgot-password-submit" type="button" className="h-11">
            Send reset link
          </Button>
          <p className="text-sm text-emerald-700" data-testid="forgot-password-success">
            Success state placeholder: a reset email was sent to the entered address.
          </p>
          <p className="text-sm text-muted-foreground" data-testid="forgot-password-error">
            Unknown-email handling will be connected in the auth feature step.
          </p>
          <Link href="/auth" className="text-sm font-medium text-cyan-700 underline-offset-4 hover:underline">
            Back to login
          </Link>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
