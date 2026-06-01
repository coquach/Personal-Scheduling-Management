"use client";

import { useAppointmentsListQuery, useUpdateAppointmentStatusMutation } from "@/query/appointments-hooks";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarClockIcon } from "lucide-react";
import type { AppointmentStatus } from "@/services/appointments.service";

function formatDateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const APPOINTMENT_STATUS_ORDER: AppointmentStatus[] = [
  "SCHEDULED",
  "COMPLETED",
  "MISSED",
  "CANCELLED",
];

export function SeriesOccurrences({ seriesId }: { seriesId: string }) {
  const { data, isLoading } = useAppointmentsListQuery({ seriesId, limit: 100 });
  
  const updateStatusMutation = useUpdateAppointmentStatusMutation();

  if (isLoading) {
    return <div className="p-4"><Skeleton className="h-20 w-full" /></div>;
  }

  const occurrences = data?.items ?? [];

  if (occurrences.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground">No occurrences found.</div>;
  }

  return (
    <div className="p-4 bg-muted/20 border-t border-border">
      <h4 className="text-sm font-medium mb-3 text-muted-foreground">Series Occurrences</h4>
      <div className="space-y-2">
        {occurrences.map((occ) => (
          <div key={occ.id} className="flex justify-between items-center bg-background p-3 rounded-md border text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-foreground">
                <CalendarClockIcon className="w-4 h-4 text-muted-foreground" />
                {formatDateTime(occ.startAt)} - {formatDateTime(occ.endAt)}
              </span>
              <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wider bg-primary/5 text-primary border-primary/20">
                {occ.status}
              </Badge>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground text-muted-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                  disabled={updateStatusMutation.isPending}
                >
                  <CalendarClockIcon size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs">Update Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {APPOINTMENT_STATUS_ORDER.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        disabled={occ.status === status}
                        onClick={() => {
                          updateStatusMutation.mutate({
                            appointmentId: occ.id,
                            status: status as "SCHEDULED" | "COMPLETED" | "MISSED" | "CANCELLED",
                          });
                        }}
                        className="text-xs"
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
