"use client";

import { useState, useMemo } from "react";
import type { CalendarEvent } from "@schedule-x/calendar";
import { PlusIcon } from "lucide-react";

import { ScheduleXCalendar } from "@/components/calendar/ScheduleXCalendar";
import AppointmentModal from "@/components/appointments/appointment-modal";
import { PageSection } from "@/components/layout/page-section";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api-core";
import { useCalendarAppointments } from "@/query/calendar-hooks";
import type { Appointment } from "@/services/appointments.service";

function formatTimeRange(startAt: string, endAt: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(startAt))} - ${formatter.format(new Date(endAt))}`;
}

export default function CalendarPage() {
  const appointmentsQuery = useCalendarAppointments();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const handleCreateNew = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    // Find the original appointment data by ID
    const appointment = appointmentsQuery.appointments.find((app) => app.seriesId === event.id || app.id === event.id);
    if (appointment) {
      setEditingAppointment(appointment);
      setIsModalOpen(true);
    }
  };

  const handleDateClick = () => {
    // Open create modal with pre-filled date. 
    // We can just open the modal. The modal doesn't currently take an initialDate param,
    // but at least we can trigger creation.
    setEditingAppointment(null);
    setIsModalOpen(true);
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
          <Card>
            
            <CardContent>
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
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upcoming appointments
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
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
                  className="rounded-[16px] border border-border bg-background p-4"
                  data-testid="calendar-slot"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {appointment.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatTimeRange(
                          appointment.startAt,
                          appointment.endAt,
                        )}
                      </p>
                    </div>
                    <Badge className="rounded-md border-0 px-2.5">
                      {appointment.status}
                    </Badge>
                  </div>
                  {appointment.description ? (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {appointment.description}
                    </p>
                  ) : null}
                </div>
              ))}
              {!appointmentsQuery.isLoading &&
              !appointmentsQuery.isError &&
              todayAppointments.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No appointments scheduled for today.
                  </AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </PageSection>

      <AppointmentModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingAppointment={editingAppointment}
      />
    </div>
  );
}
