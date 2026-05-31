'use client';

import 'temporal-polyfill/global';

import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
  type CalendarEvent,
} from '@schedule-x/calendar';
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import {
  ScheduleXCalendar as ReactScheduleXCalendar,
  useCalendarApp,
} from '@schedule-x/react';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useRef } from 'react';

import { CALENDAR_STATUS_IDS } from '@/lib/constants/calendar';

type ScheduleXCalendarProps = {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: string) => void;
  onRangeUpdate?: (range: { start: string; end: string }) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
};

function getTodayString() {
  return Temporal.Now.plainDateISO();
}

function InnerCalendar({
  isDark,
  events,
  onEventClick,
  onDateClick,
  onRangeUpdate,
  onEventUpdate,
}: ScheduleXCalendarProps & { isDark: boolean }) {
  const eventsService = useMemo(() => createEventsServicePlugin(), []);
  const dragAndDrop = useMemo(() => createDragAndDropPlugin(), []);
  const plugins = useMemo(
    () => [eventsService, dragAndDrop],
    [eventsService, dragAndDrop],
  );

  const isDragging = useRef(false);

  const calendar = useCalendarApp(
    {
      isDark,
      selectedDate: getTodayString(),
      views: [
        createViewDay(),
        createViewWeek(),
        createViewMonthGrid(),
        createViewMonthAgenda(),
      ],
      defaultView: 'week',
      events,
      callbacks: {
        onEventClick(calendarEvent) {
          onEventClick?.(calendarEvent);
        },
        onClickDate(date) {
          onDateClick?.(date.toString());
        },
        onRangeUpdate(range) {
          onRangeUpdate?.({
            start: range.start.toString(),
            end: range.end.toString(),
          });
        },
        onEventUpdate(updatedEvent) {
          isDragging.current = true;
          onEventUpdate?.(updatedEvent);
          // Clear flag after mutation resolves (give it a tick for React Query to settle)
          setTimeout(() => { isDragging.current = false; }, 1500);
        },
      },
      calendars: {
        [CALENDAR_STATUS_IDS.scheduled]: {
          colorName: CALENDAR_STATUS_IDS.scheduled,
          lightColors: {
            main: '#8b5cf6',
            container: 'rgba(139, 92, 246, 0.15)',
            onContainer: '#4c1d95',
          },
          darkColors: {
            main: '#a78bfa',
            container: 'rgba(139, 92, 246, 0.25)',
            onContainer: '#ede9fe',
          },
        },
        [CALENDAR_STATUS_IDS.completed]: {
          colorName: CALENDAR_STATUS_IDS.completed,
          lightColors: {
            main: '#10b981',
            container: 'rgba(16, 185, 129, 0.15)',
            onContainer: '#064e3b',
          },
          darkColors: {
            main: '#34d399',
            container: 'rgba(16, 185, 129, 0.25)',
            onContainer: '#d1fae5',
          },
        },
        [CALENDAR_STATUS_IDS.missed]: {
          colorName: CALENDAR_STATUS_IDS.missed,
          lightColors: {
            main: '#f59e0b',
            container: 'rgba(245, 158, 11, 0.15)',
            onContainer: '#78350f',
          },
          darkColors: {
            main: '#fbbf24',
            container: 'rgba(245, 158, 11, 0.25)',
            onContainer: '#fef3c7',
          },
        },
        [CALENDAR_STATUS_IDS.cancelled]: {
          colorName: CALENDAR_STATUS_IDS.cancelled,
          lightColors: {
            main: '#ef4444',
            container: 'rgba(239, 68, 68, 0.15)',
            onContainer: '#7f1d1d',
          },
          darkColors: {
            main: '#f87171',
            container: 'rgba(239, 68, 68, 0.25)',
            onContainer: '#fee2e2',
          },
        },
      },
    },
    plugins,
  );

  useEffect(() => {
    if (!calendar) return;
    if (isDragging.current) return; // Don't reset events while a drag mutation is in flight
    eventsService.set(events);
  }, [calendar, events, eventsService]);

  if (!calendar) return null;

  return <ReactScheduleXCalendar calendarApp={calendar} />;
}

export function ScheduleXCalendar(props: ScheduleXCalendarProps) {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className="sx-react-calendar-wrapper"
      data-testid="calendar-sx-wrapper"
    >
      <InnerCalendar
        key={isDark ? 'dark' : 'light'}
        isDark={isDark}
        {...props}
      />
    </div>
  );
}
