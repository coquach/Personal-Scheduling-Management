import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="space-y-8" data-testid="register-page">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Sign up to start using your scheduling workspace
        </p>
      </div>
      <RegisterForm />
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href={AUTH_ROUTE_PATHS.login} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
