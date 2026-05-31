import "temporal-polyfill/global";

import type { CalendarEvent } from "@schedule-x/calendar";

import { CALENDAR_STATUS_IDS } from "@/lib/constants/calendar";
import type { Appointment } from "@/services/appointments.service";
import type { AppointmentStatus } from "@/model/appointments";

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

/**
 * Schedule-X v3 requires dates as "YYYY-MM-DD HH:mm" strings in LOCAL time.
 * We convert the ISO 8601 UTC string from the backend into that format using
 * the Temporal API for correct timezone handling.
 */
function toScheduleXDateTime(isoDateTime: string): string {
  const instant = Temporal.Instant.from(isoDateTime);
  const timezone = Temporal.Now.timeZoneId();
  const zdt = instant.toZonedDateTimeISO(timezone);
  // Zero-pad each component to match "YYYY-MM-DD HH:mm"
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${zdt.year}-${pad(zdt.month)}-${pad(zdt.day)}` +
    ` ${pad(zdt.hour)}:${pad(zdt.minute)}`
  );
}

export function mapAppointmentToCalendarEvent(
  appointment: Appointment,
): CalendarEvent {
  return {
    id: appointment.seriesId ?? appointment.id,
    title: appointment.title,
    description: appointment.description ?? undefined,
    start: toScheduleXDateTime(appointment.startAt),
    end: toScheduleXDateTime(appointment.endAt),
    calendarId: statusToCalendarId(appointment.status),
  };
}

export function mapAppointmentsToCalendarEvents(
  appointments: Appointment[],
): CalendarEvent[] {
  return appointments.map(mapAppointmentToCalendarEvent);
}
