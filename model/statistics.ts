import { z } from "zod";

export const getStatisticsInputSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  groupBy: z.enum(["day", "week"]).optional(),
  timezone: z.string().optional(),
});

export const statisticsTrendPointSchema = z.object({
  bucket: z.string(),
  total: z.number(),
  completed: z.number(),
});

export const statisticsSummaryResponseSchema = z.object({
  periodStart: z.string(),
  periodEnd: z.string(),
  totalAppointments: z.number(),
  completedAppointments: z.number(),
  completionRate: z.number(),
  mostProductiveSlot: z.string().nullable(),
  trend: z.array(statisticsTrendPointSchema),
});

export type GetStatisticsInput = z.infer<typeof getStatisticsInputSchema>;
export type StatisticsTrendPoint = z.infer<typeof statisticsTrendPointSchema>;
export type StatisticsSummaryResponse = z.infer<typeof statisticsSummaryResponseSchema>;

export const exportAppointmentsInputSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  tagId: z.string().uuid().optional(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "MISSED"]).optional(),
  query: z.string().max(255).optional(),
  timezone: z.string().optional(),
});

export type ExportAppointmentsInput = z.infer<typeof exportAppointmentsInputSchema>;
