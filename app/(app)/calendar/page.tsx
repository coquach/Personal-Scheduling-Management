"use client";

import { useState, useMemo } from "react";
import type { CalendarEvent } from "@schedule-x/calendar";
import dynamic from "next/dynamic";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

const ScheduleXCalendar = dynamic(
  () => import("@/components/calendar/ScheduleXCalendar").then((mod) => mod.ScheduleXCalendar),
  { ssr: false }
);
import AppointmentModal from "@/components/appointments/appointment-modal";
import { PageSection } from "@/components/layout/page-section";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getApiErrorMessage } from "@/lib/api-core";
import { useCalendarAppointments } from "@/query/calendar-hooks";
import { useUpdateAppointmentMutation } from "@/query/appointments-hooks";
import type { Appointment } from "@/services/appointments.service";

function formatTimeRange(startAt: string, endAt: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(startAt))} - ${formatter.format(new Date(endAt))}`;
}

export default function CalendarPage() {
  const [dateRange, setDateRange] = useState<{ fromDate?: string; toDate?: string }>({});
  
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
  const [confirmDragEvent, setConfirmDragEvent] = useState<{
    calendarEvent: CalendarEvent;
    originalAppointment: Appointment;
  } | null>(null);

  const handleRangeUpdate = (range: { start: string; end: string }) => {
    // Only update if it actually changed to avoid infinite loops
    setDateRange((prev) => {
      if (prev.fromDate === range.start && prev.toDate === range.end) return prev;
      return { fromDate: range.start, toDate: range.end };
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

  return (
    <div data-testid="calendar-page" className="space-y-6">
      <PageSection
        actions={
          <Button onClick={handleCreateNew}>
            <PlusIcon className="mr-2 size-4" />
            <span>Create event</span>
          </Button>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
          {/* Calendar Bento */}
          <div className="rounded-[2rem] border border-white/20 bg-white/40 p-2 sm:p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-black/20">
              {appointmentsQuery.isLoading && (
                <div className="mb-4">
                  <Alert>
                    <AlertDescription>Loading calendar events...</AlertDescription>
                  </Alert>
                </div>
              )}
              {appointmentsQuery.isError && (
                <div className="mb-4">
                  <Alert variant="destructive">
                    <AlertDescription>
                      {getApiErrorMessage(
                        appointmentsQuery.error,
                        "Unable to load the calendar right now."
                      )}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              <ScheduleXCalendar 
                events={appointmentsQuery.calendarEvents} 
                onEventClick={handleEventClick}
                onDateClick={handleDateClick}
                onRangeUpdate={handleRangeUpdate}
                onEventUpdate={handleEventUpdate}
              />
          </div>

          {/* Today Agenda Bento */}
          <div className="rounded-[2rem] border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-2xl flex flex-col gap-6 dark:border-white/10 dark:bg-black/20 overflow-hidden relative">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Today</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Upcoming appointments
              </p>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none pr-1">
              {appointmentsQuery.isLoading ? (
                <Alert>
                  <AlertDescription>Loading today&apos;s agenda...</AlertDescription>
                </Alert>
              ) : null}
              {appointmentsQuery.isError ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    {getApiErrorMessage(
                      appointmentsQuery.error,
                      "Unable to load appointments for the calendar.",
                    )}
                  </AlertDescription>
                </Alert>
              ) : null}
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="group relative flex flex-col gap-2 rounded-[1.25rem] border border-white/20 bg-white/50 p-4 transition-colors hover:bg-white/70 shadow-sm dark:border-white/10 dark:bg-black/40 dark:hover:bg-black/60"
                  data-testid="calendar-slot"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground leading-tight">
                        {appointment.title}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <span>
                          {formatTimeRange(
                            appointment.startAt,
                            appointment.endAt,
                          )}
                        </span>
                      </div>
                    </div>
                    {appointment.tags && appointment.tags.length > 0 ? (
                      <span 
                        className="size-3 rounded-full shrink-0 shadow-sm" 
                        style={{ backgroundColor: appointment.tags[0].color || undefined }} 
                      />
                    ) : (
                      <Badge variant="secondary" className="rounded-md border-0 px-2 text-[10px] bg-white/50 dark:bg-black/50">
                        {appointment.status}
                      </Badge>
                    )}
                  </div>
                  {appointment.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {appointment.description}
                    </p>
                  ) : null}
                </div>
              ))}
              {!appointmentsQuery.isLoading &&
              !appointmentsQuery.isError &&
              todayAppointments.length === 0 ? (
                <div className="flex h-full min-h-[250px] flex-col items-center justify-center text-center opacity-80 px-4">
                  <div className="text-5xl mb-5 drop-shadow-sm">☕</div>
                  <h3 className="text-lg font-semibold text-foreground tracking-tight">Chill day ahead!</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    You have no appointments scheduled for today. Take a breather or create a new event.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </PageSection>

      <AppointmentModal 
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setTimeout(() => setClickedDate(null), 300);
        }}
        editingAppointment={editingAppointment}
        initialDate={clickedDate}
      />

      <Dialog open={!!confirmDragEvent} onOpenChange={(open) => !open && handleCancelDrag()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update recurring series?</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground leading-relaxed">
            You are moving a recurring appointment. This action will shift the <strong>entire series</strong> to the new time slot. Do you want to continue?
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDrag}>Cancel</Button>
            <Button onClick={handleConfirmDrag}>Yes, move series</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
