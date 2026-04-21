"use client";

import { useLayoutEffect } from "react";

import { refreshSessionAction } from "@/actions/auth.actions";
import { clear, setAccessToken } from "@/lib/auth-store";

export function SessionBootstrap({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useLayoutEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await refreshSessionAction();

      if (cancelled) {
        return;
      }

      if (result.status === "authenticated") {
        setAccessToken(result.accessToken);
        return;
      }

      clear();
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return <>{children}</>;
}
