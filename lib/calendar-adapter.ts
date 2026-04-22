import "temporal-polyfill/global";

import type { CalendarEvent } from "@schedule-x/calendar";

import { CALENDAR_STATUS_IDS } from "@/lib/constants/calendar";
import type { Appointment } from "@/services/appointments.service";
import type { AppointmentStatus } from "@/lib/validation/appointments";

function statusToCalendarId(status: AppointmentStatus) {
  switch (status) {
    case "COMPLETED":
      return CALENDAR_STATUS_IDS.completed;
    case "MISSED":
      return CALENDAR_STATUS_IDS.missed;
    case "CANCELLED":
      return CALENDAR_STATUS_IDS.cancelled;
    case "SCHEDULED":
    default:
      return CALENDAR_STATUS_IDS.scheduled;
  }
}

function toZonedDateTime(isoDateTime: string) {
  const instant = Temporal.Instant.from(isoDateTime);
  const timezone = Temporal.Now.timeZoneId();
  return instant.toZonedDateTimeISO(timezone);
}

export function mapAppointmentToCalendarEvent(
  appointment: Appointment,
): CalendarEvent {
  return {
    id: appointment.id,
    title: appointment.title,
    description: appointment.description ?? undefined,
    start: toZonedDateTime(appointment.startTime),
    end: toZonedDateTime(appointment.endTime),
    calendarId: statusToCalendarId(appointment.status),
  };
}

export function mapAppointmentsToCalendarEvents(
  appointments: Appointment[],
): CalendarEvent[] {
  return appointments.map(mapAppointmentToCalendarEvent);
}
