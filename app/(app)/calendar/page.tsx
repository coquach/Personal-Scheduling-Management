"use client";

import { useMemo } from "react";
import { PlusIcon } from "lucide-react";

import { ScheduleXCalendar } from "@/components/calendar/ScheduleXCalendar";
import { PageSection } from "@/components/layout/page-section";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/backend-api";
import { useCalendarAppointments } from "@/query/calendar-hooks";

function formatTimeRange(startTime: string, endTime: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(startTime))} - ${formatter.format(new Date(endTime))}`;
}

export default function CalendarPage() {
  const appointmentsQuery = useCalendarAppointments();

  const todayDate = new Date().toISOString().slice(0, 10);
  const todayAppointments = useMemo(() => {
    const items = appointmentsQuery.appointments;
    const currentDayItems = items.filter(
      (appointment) => appointment.startTime.slice(0, 10) === todayDate,
    );

    return currentDayItems.length > 0 ? currentDayItems : items.slice(0, 4);
  }, [appointmentsQuery.appointments, todayDate]);

  return (
    <div data-testid="calendar-page" className="space-y-6">
      <PageSection
        title="Calendar"
        description="Schedule-X calendar synced with your appointment APIs."
        actions={
          <Button disabled>
            <PlusIcon />
            <span>Create event</span>
          </Button>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
          <Card>
            
            <CardContent>
              {appointmentsQuery.isLoading ? (
                <Alert>
                  <AlertDescription>Loading calendar events...</AlertDescription>
                </Alert>
              ) : null}
              {appointmentsQuery.isError ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    {getApiErrorMessage(
                      appointmentsQuery.error,
                      "Unable to load the calendar right now.",
                    )}
                  </AlertDescription>
                </Alert>
              ) : null}
              {!appointmentsQuery.isLoading && !appointmentsQuery.isError ? (
                <ScheduleXCalendar events={appointmentsQuery.calendarEvents} />
              ) : null}
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
                          appointment.startTime,
                          appointment.endTime,
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
    </div>
  );
}
