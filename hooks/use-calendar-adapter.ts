import { useState, useMemo } from 'react';
import type { CalendarEvent } from '@schedule-x/calendar';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api-core';
import { useCalendarAppointments } from '@/query/calendar-hooks';
import { useUpdateAppointmentMutation } from '@/query/appointments-hooks';
import { updateTeamAppointment } from '@/services/team-appointments.service';
import { queryKeys } from '@/query/keys';
import type { Appointment } from '@/services/appointments.service';
import { useQueryClient, useMutation } from '@tanstack/react-query';

export type AdapterAppointment = { id: string; title: string; teamId?: string; seriesId?: string; [key: string]: unknown };

type CalendarEventWithAppointment = CalendarEvent & {
  _appointment?: AdapterAppointment;
};

function getAppointment(
  event: CalendarEvent,
  fallback: AdapterAppointment[],
): AdapterAppointment | undefined {
  const withData = event as CalendarEventWithAppointment;
  if (withData._appointment) return withData._appointment;
  return fallback.find((a) => a.id === event.id);
}

function getInitialDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { fromDate: start.toISOString(), toDate: end.toISOString() };
}

export type DragConfirmState = {
  calendarEvent: CalendarEvent;
  appointment: AdapterAppointment;
  startAt: string;
  endAt: string;
};

export function useCalendarAdapter() {
  const [dateRange, setDateRange] = useState<{
    fromDate?: string;
    toDate?: string;
  }>(getInitialDateRange);

  const appointmentsQuery = useCalendarAppointments({
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    limit: 100,
  });

  const updateMutation = useUpdateAppointmentMutation({
    onSuccess: () => {
      toast.success('Appointment updated.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update appointment.'));
      setTriggerReset((prev) => prev + 1);
    },
  });

  const queryClient = useQueryClient();
  const updateTeamMutation = useMutation({
    mutationFn: ({
      teamId,
      id,
      payload,
    }: {
      teamId: string;
      id: string;
      payload: Record<string, unknown>;
    }) => updateTeamAppointment(teamId, id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teamAppointments.all(variables.teamId),
      });
      toast.success('Team appointment updated.');
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Failed to update team appointment.'),
      );
      setTriggerReset((prev) => prev + 1);
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [clickedDate, setClickedDate] = useState<string | null>(null);

  // Set on drag-drop, cleared on confirm/cancel
  const [dragConfirm, setDragConfirm] = useState<DragConfirmState | null>(null);

  const [triggerReset, setTriggerReset] = useState(0);

  const handleRangeUpdate = (range: { start: string; end: string }) => {
    const toISO = (d: string): string | undefined => {
      const normalized = d.replace(' ', 'T');
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
    const appointment = getAppointment(event, appointmentsQuery.appointments);
    if (!appointment) return;
    setEditingAppointment(appointment as unknown as Appointment);
    setIsModalOpen(true);
  };

  const handleDateClick = (date: string) => {
    setEditingAppointment(null);
    setClickedDate(date);
    setIsModalOpen(true);
  };

  /**
   * Called by Schedule-X after drag-drop.
   * Opens a confirm dialog instead of silently mutating.
   */
  const handleEventUpdate = (event: CalendarEvent) => {
    const appointment = getAppointment(event, appointmentsQuery.appointments);
    if (!appointment) {
      appointmentsQuery.refetch();
      return;
    }

    const parseScheduleXDate = (dateStr: string) => {
      // If Temporal string like "2026-06-01T12:00:00+07:00[Asia/Ho_Chi_Minh]"
      let safeStr = dateStr.replace(/\[.*?\]$/, '');
      if (safeStr.includes(' ')) {
        safeStr = safeStr.replace(' ', 'T');
      }
      if (safeStr.length === 10) {
        safeStr += 'T00:00:00';
      }
      return new Date(safeStr).toISOString();
    };

    const startAt = parseScheduleXDate(event.start.toString());
    const endAt = parseScheduleXDate(event.end.toString());

    const startAtDate = new Date(startAt);
    const endAtDate = new Date(endAt);
    const durationMs = endAtDate.getTime() - startAtDate.getTime();
    if (durationMs > 24 * 60 * 60 * 1000) {
      toast.error('Appointment duration cannot exceed 24 hours');
      setTriggerReset((prev) => prev + 1);
      return;
    }

    const effectiveEndDate = new Date(endAtDate.getTime() - 1);
    if (
      startAtDate.getFullYear() !== effectiveEndDate.getFullYear() ||
      startAtDate.getMonth() !== effectiveEndDate.getMonth() ||
      startAtDate.getDate() !== effectiveEndDate.getDate()
    ) {
      toast.error('Appointments cannot span across multiple calendar days');
      setTriggerReset((prev) => prev + 1);
      return;
    }

    setDragConfirm({ calendarEvent: event, appointment, startAt, endAt });
  };

  const handleConfirmDrag = () => {
    if (!dragConfirm) return;
    const { appointment, startAt, endAt } = dragConfirm;

    if ('teamId' in appointment && appointment.teamId) {
      const team = appointmentsQuery.teams.find(
        (t) => t.id === appointment.teamId,
      );
      // Allow if OWNER or ADMIN
      if (!team || (team.role !== 'OWNER' && team.role !== 'ADMIN')) {
        toast.error("You don't have permission to move this team appointment.");
        setTriggerReset((prev) => prev + 1);
        setDragConfirm(null);
        return;
      }

      updateTeamMutation.mutate({
        teamId: appointment.teamId as string,
        id: appointment.id,
        payload: { startAt, endAt },
      });
      setDragConfirm(null);
      return;
    }

    if (!appointment.seriesId) {
      toast.error('Missing seriesId — cannot update.');
      return;
    }
    updateMutation.mutate({
      id: appointment.seriesId,
      payload: { startAt, endAt },
    });

    setDragConfirm(null);
  };

  const handleCancelDrag = () => {
    setDragConfirm(null);
    setTriggerReset((prev) => prev + 1);
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
    dragConfirm,
    triggerReset,
    handlers: {
      handleRangeUpdate,
      handleCreateNew,
      handleEventClick,
      handleDateClick,
      handleEventUpdate,
      handleCancelDrag,
      handleConfirmDrag,
    },
  };
}
