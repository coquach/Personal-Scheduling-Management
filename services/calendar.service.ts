import { browserApiRequest } from "@/lib/api-client";
import {
  calendarResponseSchema,
  getCalendarQuerySchema,
  type CalendarResponse,
  type GetCalendarQuery,
} from "@/model/validation/calendar";

export async function getCalendar(query: GetCalendarQuery): Promise<CalendarResponse> {
  const parsedQuery = getCalendarQuerySchema.parse(query);
  const searchParams = new URLSearchParams();

  searchParams.set("from", parsedQuery.from);
  searchParams.set("to", parsedQuery.to);
  searchParams.set("includePersonal", String(parsedQuery.includePersonal));

  if (parsedQuery.teamIds && parsedQuery.teamIds.length > 0) {
    searchParams.set("teamIds", parsedQuery.teamIds.join(","));
  }

  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  const rawResponse = await browserApiRequest<unknown>(`/calendar${suffix}`);
  
  return calendarResponseSchema.parse(rawResponse);
}
