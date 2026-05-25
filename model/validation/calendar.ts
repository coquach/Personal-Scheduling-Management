import { z } from "zod";

export const getCalendarQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  teamIds: z.array(z.string().uuid()).optional(),
  includePersonal: z.boolean().default(true),
});

export const calendarItemTypeSchema = z.enum(["PERSONAL", "TEAM"]);

export const calendarItemSchema = z.object({
  id: z.string().uuid(),
  type: calendarItemTypeSchema,
  title: z.string(),
  startAt: z.string().datetime().or(z.date()),
  endAt: z.string().datetime().or(z.date()),
  teamId: z.string().uuid().nullable(),
});

export const calendarResponseSchema = z.object({
  items: z.array(calendarItemSchema),
});

export type GetCalendarQuery = z.infer<typeof getCalendarQuerySchema>;
export type CalendarItemType = z.infer<typeof calendarItemTypeSchema>;
export type CalendarItem = z.infer<typeof calendarItemSchema>;
export type CalendarResponse = z.infer<typeof calendarResponseSchema>;
