import 'temporal-polyfill/global';

import type { CalendarEvent } from '@schedule-x/calendar';

import { CALENDAR_STATUS_IDS } from '@/lib/constants/calendar';
import type { Appointment } from '@/services/appointments.service';
import type { AppointmentStatus } from '@/model/appointments';

function statusToCalendarId(status: AppointmentStatus) {
  switch (status) {
    case 'COMPLETED':
      return CALENDAR_STATUS_IDS.completed;
    case 'MISSED':
      return CALENDAR_STATUS_IDS.missed;
    case 'CANCELLED':
      return CALENDAR_STATUS_IDS.cancelled;
    case 'SCHEDULED':
    default:
      return CALENDAR_STATUS_IDS.scheduled;
  }
}

export function mapAppointmentToCalendarEvent(
  appointment: Appointment,
): CalendarEvent {
  const startInstant = Temporal.Instant.from(appointment.startAt);
  const endInstant = Temporal.Instant.from(appointment.endAt);
  const timezone = Temporal.Now.timeZoneId();

  const startZdt = startInstant.toZonedDateTimeISO(timezone);
  const endZdt = endInstant.toZonedDateTimeISO(timezone);

  // Check if the event spans multiple days in the local timezone
  const isMultiDay =
    startZdt.toPlainDate().toString() !== endZdt.toPlainDate().toString();

  return {
    id: appointment.id,
    title: appointment.title,
    description: appointment.description ?? undefined,
    start: isMultiDay ? startZdt.toPlainDate() : startZdt,
    end: isMultiDay ? endZdt.toPlainDate() : endZdt,
    calendarId: statusToCalendarId(appointment.status),
    _appointment: appointment,
  } as CalendarEvent & { _appointment: Appointment };
}

export function mapAppointmentsToCalendarEvents(
  appointments: Appointment[],
): CalendarEvent[] {
  return appointments.map(mapAppointmentToCalendarEvent);
}
