import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  return (
    <AuthShell
      title="Plan faster. Miss less. Review what matters."
      description="This is the authentication skeleton for PSMS. The forms and selectors match the Step 1 test contract so the next steps can plug in real validation and mocked API flows without restructuring the screens."
    >
      <Card className="w-full max-w-xl border-border/80 shadow-xl" data-testid="auth-page">
        <CardHeader>
          <CardTitle>Access your workspace</CardTitle>
          <CardDescription>
            Login and registration flows are scaffolded first because the Playwright suite depends on stable entry points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="gap-5">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="auth-tab-login">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" data-testid="auth-tab-register">
                Register
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form className="grid gap-4" data-testid="auth-login-form">
                <Input data-testid="login-email-input" type="email" placeholder="Email address" />
                <Input data-testid="login-password-input" type="password" placeholder="Password" />
                <Button data-testid="login-submit" type="button" className="h-11">
                  Login
                </Button>
                <p className="text-sm text-muted-foreground" data-testid="login-error-banner">
                  Error states and server validation will be wired in Step 5.
                </p>
                <Link
                  href="/forgot-password"
                  data-testid="forgot-password-link"
                  className="text-sm font-medium text-cyan-700 underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form className="grid gap-4">
                <Input data-testid="register-name-input" placeholder="Full name" />
                <Input data-testid="register-email-input" type="email" placeholder="Email address" />
                <Input data-testid="register-password-input" type="password" placeholder="Password" />
                <Input
                  data-testid="register-confirm-password-input"
                  type="password"
                  placeholder="Confirm password"
                />
                <Button data-testid="register-submit" type="button" className="h-11">
                  Create account
                </Button>
                <p className="text-sm text-muted-foreground" data-testid="register-email-error">
                  Duplicate email and field-level validation will be connected to mocked APIs in the feature steps.
                </p>
                <p className="text-sm text-emerald-700" data-testid="register-success-banner">
                  Success banner placeholder: verify your email to activate the account.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
