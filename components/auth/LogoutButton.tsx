"use client";

import { useTransition } from "react";
import type { VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";

import { logoutAction } from "@/features/auth/server/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { clear } from "@/lib/auth-store";
import { clearRegisteredFcmToken, getRegisteredFcmToken } from "@/lib/firebase-messaging";
import { cn } from "@/lib/utils";
import { unregisterNotificationDevice } from "@/services/notification.service";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
type ButtonSize = VariantProps<typeof buttonVariants>["size"];

type LogoutButtonProps = {
  className?: string;
  label?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  "data-testid"?: string;
};

export function LogoutButton({
  className,
  label = "Sign out",
  size = "default",
  variant = "destructive",
  "data-testid": dataTestId,
}: LogoutButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={() => {
        startTransition(async () => {
          const registeredFcmToken = getRegisteredFcmToken();

          if (registeredFcmToken) {
            try {
              await unregisterNotificationDevice(registeredFcmToken);
            } catch {
              // Ignore unregister errors to avoid blocking user sign-out.
            } finally {
              clearRegisteredFcmToken();
            }
          }

          clear();
          const result = await logoutAction();
          router.replace(result.redirectTo);
          router.refresh();
        });
      }}
      className={cn("w-full", className)}
    >
      <Button
        type="submit"
        variant={variant}
        size={size}
        className="w-full justify-start"
        disabled={pending}
        data-testid={dataTestId}
      >
        {pending ? "Signing out..." : label}
      </Button>
    </form>
  );
}
