'use client';

import { useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';

import { mapAppointmentsToCalendarEvents } from '@/lib/calendar-adapter';
import { CALENDAR_QUERY_DEFAULTS } from '@/lib/constants/calendar';
import { queryKeys } from '@/query/keys';
import { getAppointments } from '@/services/appointments.service';
import { useGetTeams } from '@/query/team-hooks';
import { getTeamAppointments } from '@/services/team-appointments.service';
import type { Appointment } from '@/services/appointments.service';

type CalendarAppointmentsInput = {
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
};

export function useCalendarAppointments(input: CalendarAppointmentsInput = {}) {
  const page = input.page ?? CALENDAR_QUERY_DEFAULTS.page;
  const limit = input.limit ?? CALENDAR_QUERY_DEFAULTS.limit;

  const appointmentsQuery = useQuery({
    queryKey: queryKeys.appointments.calendar({
      page: String(page),
      limit: String(limit),
      fromDate: input.fromDate,
      toDate: input.toDate,
      mode: 'live',
    }),
    queryFn: () =>
      getAppointments({
        page,
        limit,
        fromDate: input.fromDate,
        toDate: input.toDate,
      }),
    enabled: !!input.fromDate && !!input.toDate,
  });

  const teamsQuery = useGetTeams({ page: 1, limit: 100 });
  const teams = useMemo(() => teamsQuery.data?.items ?? [], [teamsQuery.data?.items]);

  const teamAppointmentsQueries = useQueries({
    queries: teams.map((team) => ({
      queryKey: [
        'teamAppointments',
        team.id,
        { fromDate: input.fromDate, toDate: input.toDate },
      ],
      queryFn: () =>
        getTeamAppointments(team.id, {
          page: 1,
          limit: 100,
          from: input.fromDate,
          to: input.toDate,
        }),
      enabled: !!team.id && !!input.fromDate && !!input.toDate,
    })),
  });

  const teamAppointmentsQueriesData = useMemo(
    () => teamAppointmentsQueries.map(q => q.data?.items),
    [teamAppointmentsQueries]
  );

  const appointments = useMemo(() => {
    const personal = appointmentsQuery.data?.items ?? [];

    const teamApps: Appointment[] = [];
    teamAppointmentsQueriesData.forEach((items, index) => {
      const team = teams[index];
      if (items) {
        items.forEach((ta) => {
          // Map TeamAppointment to Appointment format for Calendar
          teamApps.push({
            id: ta.id,
            title: `[${team.name}] ${ta.title}`,
            description: null,
            startAt: ta.startAt,
            endAt: ta.endAt,
            status: ta.status,
            isRecurringInstance: false, // Team appointments don't recur right now
            seriesId: undefined,
            tags: [{ id: 'team-app', name: team.name, color: '#8b5cf6' }], // Purple color for team events
          } as unknown as Appointment);
        });
      }
    });

    return [...personal, ...teamApps];
  }, [appointmentsQuery.data?.items, teamAppointmentsQueriesData, teams]);

  const calendarEvents = useMemo(
    () => mapAppointmentsToCalendarEvents(appointments),
    [appointments],
  );

  const isLoading =
    appointmentsQuery.isLoading ||
    teamsQuery.isLoading ||
    teamAppointmentsQueries.some((q) => q.isLoading);
  const isError =
    appointmentsQuery.isError ||
    teamsQuery.isError ||
    teamAppointmentsQueries.some((q) => q.isError);
  const error =
    appointmentsQuery.error ||
    teamsQuery.error ||
    teamAppointmentsQueries.find((q) => q.error)?.error;

  return {
    isLoading,
    isError,
    error,
    refetch: () => {
      appointmentsQuery.refetch();
      teamsQuery.refetch();
      teamAppointmentsQueries.forEach((q) => q.refetch());
    },
    appointments,
    calendarEvents,
  };
}
