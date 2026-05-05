export type { ApiEnvelope } from "@/model/common.model";

export type NotificationType = "REMINDER" | "SYSTEM";

export type NotificationItem = {
  id: string;
  userId: string;
  appointmentId: string | null;
  reminderId: string | null;
  type: NotificationType;
  message: string;
  triggeredAt: string | null;
  // Derived field for UI convenience; backend does not send this directly.
  status: "UNREAD" | "READ";
  createdAt: string;
  readAt: string | null;
};

export type NotificationListResponse = NotificationItem[];

export type RegisterDevicePayload = {
  fcmToken: string;
  deviceName?: string;
  platform?: string;
};

export type UserDevice = {
  id: string;
  fcmToken: string;
  deviceName: string | null;
  platform: string | null;
  lastActiveAt: string;
};
