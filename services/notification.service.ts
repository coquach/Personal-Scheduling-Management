import { browserApiRequest } from "@/lib/api-client";
import { NOTIFICATION_API_PATHS } from "@/lib/constants/notification";
import type {
  NotificationItem,
  NotificationListResponse,
  RegisterDevicePayload,
  UserDevice,
} from "@/model/notification.model";
import {
  markAllReadResponseSchema,
  markReadInputSchema,
  notificationItemSchema,
  notificationListResponseSchema,
  registerDevicePayloadSchema,
  unregisterDevicePayloadSchema,
  userDeviceSchema,
} from "@/model/validation/notification";

function mapNotificationStatus(item: Omit<NotificationItem, "status">): NotificationItem {
  return {
    ...item,
    status: item.readAt ? "READ" : "UNREAD",
  };
}

export async function getNotifications() {
  const raw = await browserApiRequest<unknown>(NOTIFICATION_API_PATHS.list);
  const parsed = notificationListResponseSchema.parse(raw);

  return parsed.map(mapNotificationStatus) satisfies NotificationListResponse;
}

export async function markNotificationRead(notificationId: string) {
  const parsed = markReadInputSchema.parse({ notificationId });
  const raw = await browserApiRequest<unknown>(NOTIFICATION_API_PATHS.markRead(parsed.notificationId), {
    method: "PATCH",
  });

  return mapNotificationStatus(notificationItemSchema.parse(raw));
}

export async function markAllNotificationsRead() {
  const raw = await browserApiRequest<unknown>(NOTIFICATION_API_PATHS.markAllRead, {
    method: "PATCH",
  });

  return markAllReadResponseSchema.parse(raw);
}

export async function registerNotificationDevice(payload: RegisterDevicePayload) {
  const parsedPayload = registerDevicePayloadSchema.parse(payload);
  const raw = await browserApiRequest<unknown>(NOTIFICATION_API_PATHS.registerDevice, {
    method: "POST",
    body: JSON.stringify(parsedPayload),
  });

  return userDeviceSchema.parse(raw) satisfies UserDevice;
}

export async function listNotificationDevices() {
  const raw = await browserApiRequest<unknown>(NOTIFICATION_API_PATHS.listDevices);
  return userDeviceSchema.array().parse(raw) satisfies UserDevice[];
}

export async function unregisterNotificationDevice(fcmToken: string) {
  const parsed = unregisterDevicePayloadSchema.parse({ fcmToken });
  const raw = await browserApiRequest<unknown>(NOTIFICATION_API_PATHS.unregisterDevice, {
    method: "DELETE",
    body: JSON.stringify(parsed),
  });

  return userDeviceSchema.parse(raw) satisfies UserDevice;
}
