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

export const appointmentSchema = z.object({
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

export type Appointment = z.infer<typeof appointmentSchema>;
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;
export type RecurrenceType = z.infer<typeof recurrenceTypeSchema>;
export type AppointmentTag = z.infer<typeof appointmentTagSchema>;

export const appointmentListResponseSchema = z.object({
  items: z.array(appointmentSchema),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
});

export type AppointmentListResponse = z.infer<typeof appointmentListResponseSchema>;

export const deleteAppointmentScopeSchema = z.enum(["single", "series"]);

export type DeleteAppointmentScopeInput = z.infer<typeof deleteAppointmentScopeSchema>;

export const deleteAppointmentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  deletedCount: z.number().int().min(0).optional(),
});

export const getAppointmentsInputSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  fromDate: dateTimeStringSchema.optional(),
  toDate: dateTimeStringSchema.optional(),
});

export type GetAppointmentsInput = z.infer<typeof getAppointmentsInputSchema>;

export const createAppointmentInputSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().max(5000).optional(),
  startAt: dateTimeStringSchema,
  endAt: dateTimeStringSchema,
  recurrenceType: recurrenceTypeSchema.optional(),
  weeklyDay: z.array(weekdaySchema).optional(),
  monthlyDay: z.number().int().min(1).max(31).nullable().optional(),
  yearlyDay: z.number().int().min(1).max(31).nullable().optional(),
  yearlyMonth: z.number().int().min(1).max(12).nullable().optional(),
  seriesTimezone: z.string().min(1).max(64).optional(),
  tagIds: z.array(uuidSchema).optional(),
}).superRefine((value, ctx) => {
  if (!isEndAfterStart(value.startAt, value.endAt)) {
    ctx.addIssue({
      code: "custom",
      path: ["endAt"],
      message: "endAt must be greater than startAt.",
    });
  }
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentInputSchema>;

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

export type UpdateAppointmentInput = z.infer<typeof updateAppointmentInputSchema>;

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

export const idResponseSchema = z.object({
  id: uuidSchema,
});

export const updateAppointmentStatusInputSchema = z.object({
  status: appointmentStatusSchema,
});

export const updateAppointmentStatusResponseSchema = z
  .union([z.object({}).loose(), z.null(), z.undefined()])
  .optional();

export type CreateSeriesRequest = z.infer<typeof createSeriesRequestSchema>;
export type UpdateSeriesRequest = z.infer<typeof updateSeriesRequestSchema>;
export type DeleteAppointmentScope = z.infer<typeof deleteAppointmentScopeSchema>;
