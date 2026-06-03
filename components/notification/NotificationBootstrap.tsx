"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BellRingIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

import { queryKeys } from "@/query/keys";
import { getAccessToken, subscribe } from "@/lib/auth-store";
import {
  clearRegisteredFcmToken,
  getFirebaseMessagingToken,
  getRegisteredFcmToken,
  onForegroundMessage,
  setRegisteredFcmToken,
} from "@/lib/firebase-messaging";
import { registerNotificationDevice } from "@/services/notification.service";

function resolveNotificationLink(data: Record<string, unknown>) {
  const deepLink =
    typeof data.deepLink === "string"
      ? data.deepLink
      : typeof data.link === "string"
        ? data.link
        : null;
  if (deepLink && deepLink.trim()) {
    return deepLink;
  }

  const appointmentId =
    typeof data.appointmentId === "string" ? data.appointmentId : null;
  if (appointmentId) {
    return `/appointments/${appointmentId}`;
  }

  const teamInvitationId =
    typeof data.teamInvitationId === "string" ? data.teamInvitationId : null;
  if (teamInvitationId) {
    return `/teams`;
  }

  const teamAppointmentId =
    typeof data.teamAppointmentId === "string" ? data.teamAppointmentId : null;
  if (teamAppointmentId) {
    // If it's a team appointment event, navigate to calendar or teams.
    // For now we'll route to calendar since that's where appointments usually are.
    // Assuming team ID is also provided if we need it, but we can default to calendar or teams.
    // Actually, going to /calendar is standard for appointments.
    return `/calendar`;
  }

  return "/notifications";
}

function getBrowserContext() {
  if (typeof window === "undefined") {
    return {};
  }

  const deviceName = navigator.userAgent.slice(0, 255);
  const userAgentData = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform =
    typeof userAgentData.userAgentData?.platform === "string"
      ? userAgentData.userAgentData.platform
      : navigator.platform;

  return {
    deviceName,
    platform,
  };
}

export function NotificationBootstrap() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;

    const registerIfNeeded = async () => {
      if (cancelled || inFlight) {
        return;
      }

      const isTestOverride = typeof window !== "undefined" && !!(window as Window & { __PSMS_TEST_ACCESS_TOKEN__?: string }).__PSMS_TEST_ACCESS_TOKEN__;

      if (!getAccessToken() && !isTestOverride) {
        return;
      }

      inFlight = true;

      try {
        if (!isTestOverride && typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted") {
          return;
        }

        const fcmToken = await getFirebaseMessagingToken();

        if (!fcmToken || cancelled) {
          return;
        }

        if (!isTestOverride && getRegisteredFcmToken() === fcmToken) {
          return;
        }

        const context = getBrowserContext();
        await registerNotificationDevice({
          fcmToken,
          ...context,
        });
        setRegisteredFcmToken(fcmToken);
      } catch {
        clearRegisteredFcmToken();
      } finally {
        inFlight = false;
      }
    };

    void registerIfNeeded();
    const unsubscribeAuthStore = subscribe(() => {
      void registerIfNeeded();
    });

    let unsubscribeForeground: (() => void) | null = null;
    void onForegroundMessage((payload) => {
      const data = (payload.data ?? {}) as Record<string, unknown>;
      const title = payload.notification?.title?.trim() || "New notification";
      const messageFromData =
        typeof data.message === "string" ? data.message.trim() : "";
      const body = messageFromData || payload.notification?.body?.trim() || "";
      const link = resolveNotificationLink(data);

      toast.custom((t) => (
        <div data-testid="notification-popup" className="flex w-[356px] flex-col gap-3 rounded-2xl border border-primary/20 bg-card p-4 shadow-xl backdrop-blur-xl pointer-events-auto">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BellRingIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1 pt-1">
              <p className="font-semibold text-sm leading-none text-foreground">{title}</p>
              {body && <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5">{body}</p>}
            </div>
            <button 
              onClick={() => toast.dismiss(t)}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <XIcon className="size-4" />
            </button>
          </div>
          <div className="flex justify-end gap-2 mt-1">
            <Button
              data-testid="notification-popup-dismiss"
              variant="outline"
              size="sm"
              className="rounded-xl px-4 text-xs font-semibold h-8"
              onClick={() => toast.dismiss(t)}
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              className="rounded-xl px-4 text-xs font-semibold h-8"
              onClick={() => {
                toast.dismiss(t);
                router.push(link);
              }}
            >
              View details
            </Button>
          </div>
        </div>
      ), { duration: 6000 });
      queryClient.refetchQueries({ queryKey: queryKeys.notifications.all });
    }).then((unsubscribe) => {
      if (cancelled) {
        unsubscribe();
      } else {
        unsubscribeForeground = unsubscribe;
      }
    });

    return () => {
      cancelled = true;
      unsubscribeAuthStore();
      if (unsubscribeForeground) unsubscribeForeground();
    };
  }, [queryClient, router]);

  return null;
}
