import { z } from "zod";

import type { NotificationListResponse } from "@/model/notification.model";
import { uuidSchema } from "@/model/validation/appointments";

const isoDateTimeSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid datetime value.",
  });

export const notificationTypeSchema = z.enum(["REMINDER", "SYSTEM"]);

export const notificationItemSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  appointmentId: uuidSchema.nullable(),
  reminderId: uuidSchema.nullable(),
  type: notificationTypeSchema,
  message: z.string().trim().min(1).max(5000),
  triggeredAt: isoDateTimeSchema.nullable(),
  createdAt: isoDateTimeSchema,
  readAt: isoDateTimeSchema.nullable(),
});

export const notificationListResponseSchema = z.array(notificationItemSchema);

export const registerDevicePayloadSchema = z.object({
  fcmToken: z.string().trim().min(1),
  deviceName: z.string().trim().min(1).max(255).optional(),
  platform: z.string().trim().min(1).max(32).optional(),
});

export const markReadInputSchema = z.object({
  notificationId: uuidSchema,
});

export const userDeviceSchema = z.object({
  id: uuidSchema,
  fcmToken: z.string().trim().min(1),
  deviceName: z.string().trim().min(1).max(255).nullable(),
  platform: z.string().trim().min(1).max(32).nullable(),
  lastActiveAt: isoDateTimeSchema,
});

export const markAllReadResponseSchema = z.object({
  count: z.number().int().min(0),
});

export const unregisterDevicePayloadSchema = z.object({
  fcmToken: z.string().trim().min(1),
});

export type NotificationListDto = NotificationListResponse;
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type NotificationItemDto = z.infer<typeof notificationItemSchema>;
export type RegisterDevicePayloadDto = z.infer<typeof registerDevicePayloadSchema>;
export type MarkReadInput = z.infer<typeof markReadInputSchema>;
export type UserDeviceDto = z.infer<typeof userDeviceSchema>;
export type UnregisterDevicePayloadDto = z.infer<typeof unregisterDevicePayloadSchema>;
