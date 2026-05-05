"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
import { Button } from "@/components/ui/button";

type ForegroundToast = {
  id: string;
  title: string;
  body: string;
  link: string;
};

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
  const [toast, setToast] = useState<ForegroundToast | null>(null);
  const toastVisible = useMemo(() => Boolean(toast), [toast]);

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;

    const registerIfNeeded = async () => {
      if (cancelled || inFlight) {
        return;
      }

      const accessToken = getAccessToken();

      if (!accessToken) {
        return;
      }

      inFlight = true;

      try {
        const fcmToken = await getFirebaseMessagingToken();

        if (!fcmToken || cancelled) {
          return;
        }

        if (getRegisteredFcmToken() === fcmToken) {
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

    let unsubscribeForeground: () => void = () => {};
    void onForegroundMessage((payload) => {
      const title =
        payload.notification?.title?.trim() || "New notification";
      const body = payload.notification?.body?.trim() || "";
      const data = (payload.data ?? {}) as Record<string, unknown>;
      const link = resolveNotificationLink(data);

      setToast({
        id: `${Date.now()}`,
        title,
        body,
        link,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    }).then((unsubscribe) => {
      unsubscribeForeground = unsubscribe;
    });

    return () => {
      cancelled = true;
      unsubscribeAuthStore();
      unsubscribeForeground();
    };
  }, [queryClient]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  return toastVisible && toast ? (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 w-[min(360px,calc(100vw-2rem))]">
      <div className="pointer-events-auto rounded-xl border border-border bg-background p-4 shadow-lg">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        {toast.body ? (
          <p className="mt-1 text-sm text-muted-foreground">{toast.body}</p>
        ) : null}
        <div className="mt-3 flex items-center gap-2">
          <Button asChild size="sm" className="h-8">
            <Link href={toast.link}>Open</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setToast(null)}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  ) : null;
}
