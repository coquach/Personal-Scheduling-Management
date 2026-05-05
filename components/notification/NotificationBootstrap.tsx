"use client";

import { useEffect } from "react";
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
    void onForegroundMessage(() => {
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

  return null;
}
