import { z } from "zod";
import { appointmentStatusSchema, dateTimeStringSchema } from "./appointments";

// --- Enums ---
export const participantSelectionModeSchema = z.enum(["ALL", "CUSTOM"]);
export const participationTypeSchema = z.enum(["REQUIRED", "OPTIONAL"]);

export type ParticipantSelectionMode = z.infer<typeof participantSelectionModeSchema>;
export type ParticipationType = z.infer<typeof participationTypeSchema>;

// --- Requests ---
export const checkTeamAppointmentConflictsRequestSchema = z.object({
  startAt: dateTimeStringSchema,
  endAt: dateTimeStringSchema,
  participantUserIds: z.array(z.string().uuid()).min(1),
});

export const createTeamAppointmentRequestSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  location: z.string().max(255).optional(),
  startAt: dateTimeStringSchema,
  endAt: dateTimeStringSchema,
  participantSelectionMode: participantSelectionModeSchema.optional(),
  participantUserIds: z.array(z.string().uuid()).optional(),
}).superRefine((value, ctx) => {
  if (new Date(value.startAt).getTime() < Date.now()) {
    ctx.addIssue({
      code: "custom",
      path: ["startAt"],
      message: "startAt cannot be in the past.",
    });
  }
  if (new Date(value.startAt).getTime() >= new Date(value.endAt).getTime()) {
    ctx.addIssue({
      code: "custom",
      path: ["endAt"],
      message: "endAt must be greater than startAt.",
    });
  }
});

export const updateTeamAppointmentRequestSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  location: z.string().max(255).nullable().optional(),
  startAt: dateTimeStringSchema.optional(),
  endAt: dateTimeStringSchema.optional(),
  status: appointmentStatusSchema.optional(),
  participantUserIds: z.array(z.string().uuid()).optional(),
});

export const getTeamAppointmentsQuerySchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  from: dateTimeStringSchema.optional(),
  to: dateTimeStringSchema.optional(),
});

// --- Responses ---
export const teamAppointmentParticipantSchema = z.object({
  userId: z.string().uuid(),
  participationType: participationTypeSchema,
});

export const teamAppointmentConflictSchema = z.object({
  userId: z.string().uuid(),
  conflictWith: z.enum(["PERSONAL_APPOINTMENT", "TEAM_APPOINTMENT"]),
  startAt: z.string().datetime().or(z.date()),
  endAt: z.string().datetime().or(z.date()),
  displayName: z.string().optional(),
  summary: z.string().optional(),
});

export const teamAppointmentResponseSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  organizerId: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  startAt: z.string().datetime().or(z.date()),
  endAt: z.string().datetime().or(z.date()),
  status: appointmentStatusSchema,
  participants: z.array(teamAppointmentParticipantSchema),
  hasConflict: z.boolean().optional(),
  conflicts: z.array(teamAppointmentConflictSchema).optional(),
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()),
});

export const teamAppointmentListItemSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  organizerId: z.string().uuid(),
  title: z.string(),
  startAt: z.string().datetime().or(z.date()),
  endAt: z.string().datetime().or(z.date()),
  status: appointmentStatusSchema,
  participantCount: z.number(),
});

export const teamAppointmentListResponseSchema = z.object({
  items: z.array(teamAppointmentListItemSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
});

export const deleteTeamAppointmentResponseSchema = z.object({
  success: z.boolean(),
  deletedId: z.string().uuid(),
});

export const availabilityParticipantSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string(),
});

export const suggestedSlotSchema = z.object({
  startAt: z.string().datetime().or(z.date()),
  endAt: z.string().datetime().or(z.date()),
});

export const checkTeamAppointmentConflictsResponseSchema = z.object({
  teamId: z.string().uuid(),
  startAt: z.string().datetime().or(z.date()),
  endAt: z.string().datetime().or(z.date()),
  hasConflict: z.boolean(),
  availableParticipants: z.array(availabilityParticipantSchema),
  busyParticipants: z.array(availabilityParticipantSchema),
  conflicts: z.array(teamAppointmentConflictSchema),
  suggestedSlots: z.array(suggestedSlotSchema),
});

// --- Types ---
export type CheckTeamAppointmentConflictsRequest = z.infer<typeof checkTeamAppointmentConflictsRequestSchema>;
export type CreateTeamAppointmentRequest = z.infer<typeof createTeamAppointmentRequestSchema>;
export type UpdateTeamAppointmentRequest = z.infer<typeof updateTeamAppointmentRequestSchema>;
export type GetTeamAppointmentsQuery = z.infer<typeof getTeamAppointmentsQuerySchema>;

export type TeamAppointmentParticipant = z.infer<typeof teamAppointmentParticipantSchema>;
export type TeamAppointmentConflict = z.infer<typeof teamAppointmentConflictSchema>;
export type TeamAppointmentResponse = z.infer<typeof teamAppointmentResponseSchema>;
export type TeamAppointmentListItem = z.infer<typeof teamAppointmentListItemSchema>;
export type TeamAppointmentListResponse = z.infer<typeof teamAppointmentListResponseSchema>;
export type DeleteTeamAppointmentResponse = z.infer<typeof deleteTeamAppointmentResponseSchema>;
export type AvailabilityParticipant = z.infer<typeof availabilityParticipantSchema>;
export type SuggestedSlot = z.infer<typeof suggestedSlotSchema>;
export type CheckTeamAppointmentConflictsResponse = z.infer<typeof checkTeamAppointmentConflictsResponseSchema>;
