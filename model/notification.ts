import { z } from "zod";

import { uuidSchema } from "@/model/appointments";

const isoDateTimeSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid datetime value.",
  });

export const notificationTypeSchema = z.enum(["REMINDER", "SYSTEM", "TEAM_INVITATION", "TEAM_ACTIVITY"]);

export const notificationItemSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  actorUserId: uuidSchema.nullish().transform((v) => v ?? null),
  appointmentId: uuidSchema.nullish().transform((v) => v ?? null),
  teamInvitationId: uuidSchema.nullish().transform((v) => v ?? null),
  teamAppointmentId: uuidSchema.nullish().transform((v) => v ?? null),
  type: notificationTypeSchema,
  eventType: z.string().nullish().transform((v) => v ?? null),
  title: z.string().nullish().transform((v) => v ?? null),
  message: z.string().trim().min(1).max(5000),
  payload: z.any().nullish().transform((v) => v ?? null),
  createdAt: isoDateTimeSchema,
  readAt: isoDateTimeSchema.nullish().transform((v) => v ?? null),
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
  deviceName: z.string().trim().min(1).max(255).nullish().transform((v) => v ?? null),
  platform: z.string().trim().min(1).max(32).nullish().transform((v) => v ?? null),
  lastActiveAt: isoDateTimeSchema.nullish().transform((v) => v ?? null),
});

export const markAllReadResponseSchema = z.object({
  count: z.number().int().min(0),
});

export const unregisterDevicePayloadSchema = z.object({
  fcmToken: z.string().trim().min(1),
});

export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type RegisterDevicePayload = z.infer<typeof registerDevicePayloadSchema>;

export type NotificationItem = {
  id: string;
  userId: string;
  actorUserId: string | null;
  appointmentId: string | null;
  teamInvitationId: string | null;
  teamAppointmentId: string | null;
  type: NotificationType;
  eventType: string | null;
  title: string | null;
  message: string;
  payload: any | null;
  // Derived field for UI convenience; backend does not send this directly.
  status: "UNREAD" | "READ";
  createdAt: string;
  readAt: string | null;
};

export type NotificationListResponse = NotificationItem[];

export type UserDevice = {
  id: string;
  fcmToken: string;
  deviceName: string | null;
  platform: string | null;
  lastActiveAt: string | null;
};

export type MarkReadInput = z.infer<typeof markReadInputSchema>;
export type UserDeviceDto = z.infer<typeof userDeviceSchema>;
export type UnregisterDevicePayloadDto = z.infer<typeof unregisterDevicePayloadSchema>;
