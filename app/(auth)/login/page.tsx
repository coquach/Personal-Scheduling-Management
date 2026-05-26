import Link from "next/link";

import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="space-y-8" data-testid="login-page">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to access the workspace
        </p>
      </div>
      <LoginForm />
      <div className="text-center text-sm" data-testid="auth-tab-register">
        <span className="text-muted-foreground">Don&apos;t have an account? </span>
        <Link href={AUTH_ROUTE_PATHS.register} className="font-medium text-primary hover:underline">
          Create account
        </Link>
      </div>
    </div>
  );
}
