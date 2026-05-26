import { browserApiRequest } from "@/lib/api-client";
import {
  calendarResponseSchema,
  getCalendarQuerySchema,
  type GetCalendarQuery,
  type CalendarResponse,
} from "@/model/calendar";

export async function getCalendar(query: GetCalendarQuery): Promise<CalendarResponse> {
  const parsedQuery = getCalendarQuerySchema.parse(query);
  const rawResponse = await browserApiRequest<unknown>("/calendar", undefined, {
    params: {
      from: parsedQuery.from,
      to: parsedQuery.to,
      includePersonal: parsedQuery.includePersonal,
      teamIds: parsedQuery.teamIds?.length ? parsedQuery.teamIds.join(",") : undefined,
    }
  });
  
  return calendarResponseSchema.parse(rawResponse);
}
