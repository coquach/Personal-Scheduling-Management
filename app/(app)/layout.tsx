import type { ReactNode } from "react";

import { requireUser } from "@/actions/auth.actions";
import { SessionBootstrap } from "@/components/auth/SessionBootstrap";
import { AppShell } from "@/components/layout/app-shell";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await requireUser();

  return (
    <SessionBootstrap>
      <AppShell>{children}</AppShell>
    </SessionBootstrap>
  );
}
