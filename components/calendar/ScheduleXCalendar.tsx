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
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: string) => void;
};

function getTodayString() {
  return Temporal.Now.plainDateISO();
}

export function ScheduleXCalendar({ events, onEventClick, onDateClick }: ScheduleXCalendarProps) {
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
      callbacks: {
        onEventClick(calendarEvent) {
          onEventClick?.(calendarEvent);
        },
        onClickDate(date) {
          onDateClick?.(date.toString());
        },
      },
      calendars: {
        [CALENDAR_STATUS_IDS.scheduled]: {
          colorName: CALENDAR_STATUS_IDS.scheduled,
          lightColors: {
            main: "#8b5cf6", // Violet 500
            container: "rgba(139, 92, 246, 0.15)",
            onContainer: "#4c1d95", // Violet 900
          },
          darkColors: {
            main: "#a78bfa",
            container: "rgba(139, 92, 246, 0.25)",
            onContainer: "#ede9fe",
          },
        },
        [CALENDAR_STATUS_IDS.completed]: {
          colorName: CALENDAR_STATUS_IDS.completed,
          lightColors: {
            main: "#10b981", // Emerald 500
            container: "rgba(16, 185, 129, 0.15)",
            onContainer: "#064e3b",
          },
          darkColors: {
            main: "#34d399",
            container: "rgba(16, 185, 129, 0.25)",
            onContainer: "#d1fae5",
          },
        },
        [CALENDAR_STATUS_IDS.missed]: {
          colorName: CALENDAR_STATUS_IDS.missed,
          lightColors: {
            main: "#f59e0b", // Amber 500
            container: "rgba(245, 158, 11, 0.15)",
            onContainer: "#78350f",
          },
          darkColors: {
            main: "#fbbf24",
            container: "rgba(245, 158, 11, 0.25)",
            onContainer: "#fef3c7",
          },
        },
        [CALENDAR_STATUS_IDS.cancelled]: {
          colorName: CALENDAR_STATUS_IDS.cancelled,
          lightColors: {
            main: "#ef4444", // Red 500
            container: "rgba(239, 68, 68, 0.15)",
            onContainer: "#7f1d1d",
          },
          darkColors: {
            main: "#f87171",
            container: "rgba(239, 68, 68, 0.25)",
            onContainer: "#fee2e2",
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
