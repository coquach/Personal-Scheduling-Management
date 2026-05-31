import { useState, useMemo } from "react";
import type { CalendarEvent } from "@schedule-x/calendar";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-core";
import { useCalendarAppointments } from "@/query/calendar-hooks";
import { useUpdateAppointmentMutation } from "@/query/appointments-hooks";
import type { Appointment } from "@/services/appointments.service";

function getInitialDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { fromDate: start.toISOString(), toDate: end.toISOString() };
}

export function useCalendarAdapter() {
  const [dateRange, setDateRange] = useState<{ fromDate?: string; toDate?: string }>(getInitialDateRange);
  
  const appointmentsQuery = useCalendarAppointments({
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    limit: 100, // Fetch up to 100 events within this date range (max allowed by API)
  });
  
  const updateMutation = useUpdateAppointmentMutation({
    onSuccess: () => {
      toast.success("Appointment updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update appointment."));
      appointmentsQuery.refetch();
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [clickedDate, setClickedDate] = useState<string | null>(null);
  
  // Drag-and-drop confirmation state (currently reserved for future recurring event support)
  const [confirmDragEvent, setConfirmDragEvent] = useState<{
    calendarEvent: CalendarEvent;
    originalAppointment: Appointment;
  } | null>(null);

  const handleRangeUpdate = (range: { start: string; end: string }) => {
    // Schedule-X emits dates as "2026-06-01" or "2026-06-01 00:00" – not valid ISO 8601.
    // Always parse through Date constructor then toISOString() to guarantee backend compatibility.
    const toISO = (d: string): string | undefined => {
      // Replace space separator so "2026-06-01 00:00" becomes "2026-06-01T00:00"
      const normalized = d.replace(" ", "T");
      const parsed = new Date(normalized);
      if (Number.isNaN(parsed.getTime())) return undefined;
      return parsed.toISOString();
    };

    const safeStart = toISO(range.start);
    const safeEnd = toISO(range.end);

    if (!safeStart || !safeEnd) return;

    setDateRange((prev) => {
      if (prev.fromDate === safeStart && prev.toDate === safeEnd) return prev;
      return { fromDate: safeStart, toDate: safeEnd };
    });
  };

  const handleCreateNew = () => {
    setEditingAppointment(null);
    setClickedDate(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    // Find the original appointment data by ID
    const appointment = appointmentsQuery.appointments.find((app) => app.seriesId === event.id || app.id === event.id);
    if (appointment) {
      if (appointment.isRecurringInstance) {
        toast.info("Editing recurring appointments is not supported yet.");
        return;
      }
      setEditingAppointment(appointment);
      setIsModalOpen(true);
    }
  };

  const handleDateClick = (date: string) => {
    setEditingAppointment(null);
    setClickedDate(date);
    setIsModalOpen(true);
  };

  const executeDragUpdate = (calendarEvent: CalendarEvent, appointment: Appointment) => {
    // Convert Schedule-X date to string and ensure ISO 8601 format (replace space with 'T')
    const startAt = new Date(calendarEvent.start.toString().replace(" ", "T")).toISOString();
    const endAt = new Date(calendarEvent.end.toString().replace(" ", "T")).toISOString();
    
    if (appointment.seriesId) {
      updateMutation.mutate({
        id: appointment.seriesId,
        payload: { startAt, endAt, recurrenceType: "ONETIME" },
      });
    }
  };

  const handleEventUpdate = (event: CalendarEvent) => {
    const appointment = appointmentsQuery.appointments.find((app) => app.seriesId === event.id || app.id === event.id);
    if (!appointment) return;

    if (appointment.isRecurringInstance) {
      toast.info("Moving recurring appointments is not supported yet.");
      appointmentsQuery.refetch(); // Revert visual drag in Schedule-X
    } else {
      executeDragUpdate(event, appointment);
    }
  };

  const handleCancelDrag = () => {
    setConfirmDragEvent(null);
    appointmentsQuery.refetch(); // Revert visual drag in Schedule-X
  };

  const handleConfirmDrag = () => {
    if (confirmDragEvent) {
      executeDragUpdate(confirmDragEvent.calendarEvent, confirmDragEvent.originalAppointment);
      setConfirmDragEvent(null);
    }
  };

  const todayDate = new Date().toISOString().slice(0, 10);
  const todayAppointments = useMemo(() => {
    const items = appointmentsQuery.appointments;
    const currentDayItems = items.filter(
      (appointment) => appointment.startAt.slice(0, 10) === todayDate,
    );

    return currentDayItems.length > 0 ? currentDayItems : items.slice(0, 4);
  }, [appointmentsQuery.appointments, todayDate]);

  return {
    appointmentsQuery,
    todayAppointments,
    isModalOpen,
    setIsModalOpen,
    editingAppointment,
    clickedDate,
    setClickedDate,
    confirmDragEvent,
    handlers: {
      handleRangeUpdate,
      handleCreateNew,
      handleEventClick,
      handleDateClick,
      handleEventUpdate,
      handleCancelDrag,
      handleConfirmDrag,
    }
  };
}
