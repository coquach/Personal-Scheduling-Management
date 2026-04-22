"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { mapAppointmentsToCalendarEvents } from "@/lib/calendar-adapter";
import { CALENDAR_QUERY_DEFAULTS } from "@/lib/constants/calendar";
import { queryKeys } from "@/query/keys";
import {
  getAppointments,
} from "@/services/appointments.service";

type CalendarAppointmentsInput = {
  page?: number;
  limit?: number;
};

export function useCalendarAppointments(input: CalendarAppointmentsInput = {}) {
  const page = input.page ?? CALENDAR_QUERY_DEFAULTS.page;
  const limit = input.limit ?? CALENDAR_QUERY_DEFAULTS.limit;

  const appointmentsQuery = useQuery({
    queryKey: queryKeys.appointments.calendar({
      page: String(page),
      limit: String(limit),
      mode: "live",
    }),
    queryFn: () => getAppointments({ page, limit }),
  });

  const appointments = useMemo(
    () => appointmentsQuery.data?.items ?? [],
    [appointmentsQuery.data?.items],
  );
  const calendarEvents = useMemo(
    () => mapAppointmentsToCalendarEvents(appointments),
    [appointments],
  );

  return {
    ...appointmentsQuery,
    appointments,
    calendarEvents,
  };
}
