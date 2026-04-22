"use client";

import "temporal-polyfill/global";

import { useEffect, useMemo } from "react";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
  type CalendarEvent,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { ScheduleXCalendar as ReactScheduleXCalendar, useCalendarApp } from "@schedule-x/react";

import { CALENDAR_STATUS_IDS } from "@/lib/constants/calendar";

type ScheduleXCalendarProps = {
  events: CalendarEvent[];
};

function getTodayString() {
  return Temporal.Now.plainDateISO();
}

export function ScheduleXCalendar({ events }: ScheduleXCalendarProps) {
  const eventsService = useMemo(() => createEventsServicePlugin(), []);
  const calendar = useCalendarApp(
    {
      selectedDate: getTodayString(),
      views: [
        createViewDay(),
        createViewWeek(),
        createViewMonthGrid(),
        createViewMonthAgenda(),
      ],
      defaultView: "week",
      events,
      calendars: {
        [CALENDAR_STATUS_IDS.scheduled]: {
          colorName: CALENDAR_STATUS_IDS.scheduled,
          lightColors: {
            main: "#1a73e8",
            container: "#e8f0fe",
            onContainer: "#123a7c",
          },
        },
        [CALENDAR_STATUS_IDS.completed]: {
          colorName: CALENDAR_STATUS_IDS.completed,
          lightColors: {
            main: "#34a853",
            container: "#e7f6ec",
            onContainer: "#1d5f2f",
          },
        },
        [CALENDAR_STATUS_IDS.missed]: {
          colorName: CALENDAR_STATUS_IDS.missed,
          lightColors: {
            main: "#fbbc04",
            container: "#fff6dd",
            onContainer: "#6f5200",
          },
        },
        [CALENDAR_STATUS_IDS.cancelled]: {
          colorName: CALENDAR_STATUS_IDS.cancelled,
          lightColors: {
            main: "#ea4335",
            container: "#fde8e6",
            onContainer: "#7d1f18",
          },
        },
      },
    },
    [eventsService],
  );

  useEffect(() => {
    if (!calendar) {
      return;
    }

    eventsService.set(events);
  }, [calendar, events, eventsService]);

  if (!calendar) {
    return null;
  }

  return (
    <div className="sx-react-calendar-wrapper" data-testid="calendar-sx-wrapper">
      <ReactScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}
