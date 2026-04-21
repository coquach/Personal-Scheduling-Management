import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="space-y-6" data-testid="login-page">
      <div className="space-y-3">
        <p className="inline-flex items-center rounded-full border border-border/80 bg-accent/55 px-3 py-1 text-[11px] font-semibold tracking-[0.07em] text-accent-foreground uppercase">
          Welcome back
        </p>
        <h1 className="text-[2.25rem] leading-[1.02] font-bold tracking-[-0.045em] text-foreground">
          Sign in to your scheduling workspace
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Credentials are posted to a Server Action, the refresh token is stored
          in an HttpOnly cookie, and the access token stays in client memory only.
        </p>
      </div>
      <p data-testid="auth-page" className="text-xs text-muted-foreground">
        Authentication entry
      </p>
      <div className="flex items-center justify-end border-t border-border/70 pt-3">
        <Button
          variant="ghost"
          className="rounded-full px-3 text-sm"
          render={<Link href={AUTH_ROUTE_PATHS.register} />}
          data-testid="auth-tab-register"
        >
          Create account
        </Button>
      </div>
      <LoginForm />
    </div>
  );
}
