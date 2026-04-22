import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
