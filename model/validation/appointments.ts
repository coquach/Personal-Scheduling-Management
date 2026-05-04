import { z } from "zod";

export const uuidSchema = z.string().uuid();

const dateTimeStringSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid datetime value.",
  });

const weekdaySchema = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

function isEndAfterStart(start: string, end: string) {
  return new Date(end).getTime() > new Date(start).getTime();
}

export const appointmentStatusSchema = z.enum([
  "SCHEDULED",
  "COMPLETED",
  "MISSED",
  "CANCELLED",
]);

export const recurrenceTypeSchema = z.enum([
  "ONETIME",
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
]);

export const appointmentTagSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1),
  color: z.string().min(1),
});

export const appointmentBackendDtoSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  seriesId: uuidSchema,
  title: z.string().min(1),
  description: z.string().nullable(),
  startAt: dateTimeStringSchema,
  endAt: dateTimeStringSchema,
  isRecurringInstance: z.boolean(),
  status: appointmentStatusSchema,
  jobId: z.string().nullable(),
  tags: z.array(appointmentTagSchema).default([]),
}).superRefine((value, ctx) => {
  if (!isEndAfterStart(value.startAt, value.endAt)) {
    ctx.addIssue({
      code: "custom",
      path: ["endAt"],
      message: "endAt must be greater than startAt.",
    });
  }
});

export const appointmentListResponseSchema = z.object({
  items: z.array(appointmentBackendDtoSchema),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
});

export const getAppointmentsInputSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const createAppointmentInputSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().max(5000).optional(),
  startTime: dateTimeStringSchema,
  endTime: dateTimeStringSchema,
  recurrenceType: recurrenceTypeSchema.optional(),
  weeklyDay: z.array(weekdaySchema).optional(),
  monthlyDay: z.number().int().min(1).max(31).nullable().optional(),
  yearlyDay: z.number().int().min(1).max(31).nullable().optional(),
  yearlyMonth: z.number().int().min(1).max(12).nullable().optional(),
  seriesTimezone: z.string().min(1).max(64).optional(),
  tagIds: z.array(uuidSchema).optional(),
}).superRefine((value, ctx) => {
  if (!isEndAfterStart(value.startTime, value.endTime)) {
    ctx.addIssue({
      code: "custom",
      path: ["endTime"],
      message: "endTime must be greater than startTime.",
    });
  }
});

export const createSeriesRequestSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().max(5000).optional(),
  startAt: dateTimeStringSchema,
  endAt: dateTimeStringSchema,
  recurrenceType: recurrenceTypeSchema,
  weeklyDay: z.array(weekdaySchema).optional(),
  monthlyDay: z.number().int().min(1).max(31).nullable().optional(),
  yearlyDay: z.number().int().min(1).max(31).nullable().optional(),
  yearlyMonth: z.number().int().min(1).max(12).nullable().optional(),
  seriesTimezone: z.string().min(1).max(64).optional(),
  tagIds: z.array(uuidSchema),
}).superRefine((value, ctx) => {
  if (!isEndAfterStart(value.startAt, value.endAt)) {
    ctx.addIssue({
      code: "custom",
      path: ["endAt"],
      message: "endAt must be greater than startAt.",
    });
  }
});

export const updateAppointmentInputSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  startTime: dateTimeStringSchema.optional(),
  endTime: dateTimeStringSchema.optional(),
  recurrenceType: recurrenceTypeSchema.optional(),
  weeklyDay: z.array(weekdaySchema).optional(),
  monthlyDay: z.number().int().min(1).max(31).nullable().optional(),
  yearlyDay: z.number().int().min(1).max(31).nullable().optional(),
  yearlyMonth: z.number().int().min(1).max(12).nullable().optional(),
  seriesTimezone: z.string().min(1).max(64).optional(),
  tagIds: z.array(uuidSchema).optional(),
}).superRefine((value, ctx) => {
  if (value.startTime && value.endTime && !isEndAfterStart(value.startTime, value.endTime)) {
    ctx.addIssue({
      code: "custom",
      path: ["endTime"],
      message: "endTime must be greater than startTime.",
    });
  }
});

export const updateSeriesRequestSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  startAt: dateTimeStringSchema.optional(),
  endAt: dateTimeStringSchema.optional(),
  recurrenceType: recurrenceTypeSchema.optional(),
  weeklyDay: z.array(weekdaySchema).optional(),
  monthlyDay: z.number().int().min(1).max(31).nullable().optional(),
  yearlyDay: z.number().int().min(1).max(31).nullable().optional(),
  yearlyMonth: z.number().int().min(1).max(12).nullable().optional(),
  seriesTimezone: z.string().min(1).max(64).optional(),
  tagIds: z.array(uuidSchema).optional(),
}).superRefine((value, ctx) => {
  if (value.startAt && value.endAt && !isEndAfterStart(value.startAt, value.endAt)) {
    ctx.addIssue({
      code: "custom",
      path: ["endAt"],
      message: "endAt must be greater than startAt.",
    });
  }
});

export const deleteAppointmentScopeSchema = z.enum(["single", "series"]);

export const idResponseSchema = z.object({
  id: uuidSchema,
});

export const deleteAppointmentResponseSchema = z.object({
  message: z.string().min(1),
});

export const updateAppointmentStatusInputSchema = z.object({
  status: appointmentStatusSchema,
});

export const updateAppointmentStatusResponseSchema = z
  .union([z.object({}).loose(), z.null(), z.undefined()])
  .optional();

export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;
export type RecurrenceType = z.infer<typeof recurrenceTypeSchema>;
export type AppointmentTag = z.infer<typeof appointmentTagSchema>;
export type AppointmentBackendDto = z.infer<typeof appointmentBackendDtoSchema>;
export type AppointmentListBackendResponse = z.infer<
  typeof appointmentListResponseSchema
>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentInputSchema>;
export type CreateSeriesRequest = z.infer<typeof createSeriesRequestSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentInputSchema>;
export type UpdateSeriesRequest = z.infer<typeof updateSeriesRequestSchema>;
export type DeleteAppointmentScope = z.infer<typeof deleteAppointmentScopeSchema>;
