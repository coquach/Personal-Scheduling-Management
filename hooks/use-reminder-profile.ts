import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getFirebaseMessagingToken, getRegisteredFcmToken, setRegisteredFcmToken, clearRegisteredFcmToken } from "@/lib/firebase-messaging";
import { registerNotificationDevice, unregisterNotificationDevice } from "@/services/notification.service";

export type ReminderRule = {
  id: string;
  offsetMinutes: number;
  channel: "push" | "email";
};

// Use local storage for rules as a stand-in for a backend profile
const getStoredRules = (): ReminderRule[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("psms_reminder_rules");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // ignore parse error
    }
  }
  return [
    { id: "1", offsetMinutes: 15, channel: "push" },
    { id: "2", offsetMinutes: 60, channel: "email" },
  ];
};

export function useReminderProfile() {
  const [rules, setRulesState] = useState<ReminderRule[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isRegisteringPush, setIsRegisteringPush] = useState(false);

  useEffect(() => {
    setRulesState(getStoredRules());
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushEnabled(Notification.permission === "granted" && !!getRegisteredFcmToken());
    }
  }, []);

  const setRules = useCallback((newRules: ReminderRule[]) => {
    setRulesState(newRules);
    if (typeof window !== "undefined") {
      localStorage.setItem("psms_reminder_rules", JSON.stringify(newRules));
    }
  }, []);

  const addRule = useCallback((rule: Omit<ReminderRule, "id">) => {
    setRules([...rules, { ...rule, id: Date.now().toString() }]);
    toast.success("Reminder rule added.");
  }, [rules, setRules]);

  const removeRule = useCallback((id: string) => {
    setRules(rules.filter(r => r.id !== id));
    toast.success("Reminder rule removed.");
  }, [rules, setRules]);

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

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "denied") {
      toast.error("Notifications are blocked by your browser. Please enable them in your site settings.");
      return;
    }

    setIsRegisteringPush(true);
    try {
      const fcmToken = await getFirebaseMessagingToken();
      if (!fcmToken) {
        setPushEnabled(false);
        toast.error("Notification permission was not granted.");
        return;
      }

      if (getRegisteredFcmToken() !== fcmToken) {
        const deviceName = navigator.userAgent.slice(0, 255);
        const platform = (navigator as Navigator & { userAgentData?: { platform: string } }).userAgentData?.platform || navigator.platform;
        await registerNotificationDevice({ fcmToken, deviceName, platform });
        setRegisteredFcmToken(fcmToken);
      }
      
      setPushEnabled(true);
      toast.success("Push notifications enabled!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to setup push notifications.");
      setPushEnabled(false);
    } finally {
      setIsRegisteringPush(false);
    }
  }, [pushEnabled]);

  return {
    rules,
    addRule,
    removeRule,
    channels: {
      push: {
        enabled: pushEnabled,
        toggle: togglePushNotification,
        isRegistering: isRegisteringPush
      },
      email: {
        enabled: false,
        toggle: () => toast.info("Email notifications coming soon."),
        isRegistering: false
      }
    }
  };
}
