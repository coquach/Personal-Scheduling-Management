import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AUTH_ROUTE_PATHS } from "@/lib/constants/auth";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="space-y-6" data-testid="register-page">
      <div className="space-y-3">
        <p className="inline-flex items-center rounded-full border border-border/80 bg-accent/55 px-3 py-1 text-[11px] font-semibold tracking-[0.07em] text-accent-foreground uppercase">
          New account
        </p>
        <h1 className="text-[2.25rem] leading-[1.02] font-bold tracking-[-0.045em] text-foreground">
          Create your scheduling account
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Register with your email to start using calendar, reminders, and workspace
          features.
        </p>
      </div>
      <div className="flex items-center justify-end border-t border-border/70 pt-3">
        <Button
          variant="ghost"
          className="rounded-full px-3 text-sm"
          render={<Link href={AUTH_ROUTE_PATHS.login} />}
        >
          Already have an account?
        </Button>
      </div>
      <RegisterForm />
    </div>
  );
}
