import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  getFirebaseMessagingToken,
  getRegisteredFcmToken,
  setRegisteredFcmToken,
  clearRegisteredFcmToken,
} from "@/lib/firebase-messaging";
import {
  registerNotificationDevice,
  unregisterNotificationDevice,
} from "@/services/notification.service";

export function usePushNotification() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isRegisteringPush, setIsRegisteringPush] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushEnabled(
        Notification.permission === "granted" && !!getRegisteredFcmToken(),
      );
    }
  }, []);

  const togglePushNotification = useCallback(async () => {
    if (pushEnabled) {
      setIsRegisteringPush(true);
      try {
        const token = getRegisteredFcmToken();
        if (token) {
          await unregisterNotificationDevice(token);
          clearRegisteredFcmToken();
        }
        setPushEnabled(false);
        toast.success("Push notifications disabled for this device.");
      } catch (error) {
        toast.error("Failed to disable push notifications.");
      } finally {
        setIsRegisteringPush(false);
      }
      return;
    }

    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "denied"
    ) {
      toast.error(
        "Notifications are blocked by your browser. Please enable them in your site settings.",
      );
      return;
    }

    setIsRegisteringPush(true);
    try {
      const fcmToken = await getFirebaseMessagingToken();
      // fcmToken is guaranteed to be a string now, because getFirebaseMessagingToken throws if it fails.

      if (getRegisteredFcmToken() !== fcmToken) {
        const deviceName = navigator.userAgent.slice(0, 255);
        const platform =
          (navigator as Navigator & { userAgentData?: { platform: string } })
            .userAgentData?.platform || navigator.platform;
        await registerNotificationDevice({ fcmToken, deviceName, platform });
        setRegisteredFcmToken(fcmToken);
      }

      setPushEnabled(true);
      toast.success("Push notifications enabled!");
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Failed to setup push notifications.";
      toast.error(msg);
      setPushEnabled(false);
    } finally {
      setIsRegisteringPush(false);
    }
  }, [pushEnabled]);

  return {
    enabled: pushEnabled,
    toggle: togglePushNotification,
    isRegistering: isRegisteringPush,
  };
}
