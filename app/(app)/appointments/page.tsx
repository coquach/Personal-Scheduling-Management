"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  CalendarClockIcon,
  PencilLineIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import {
  type Appointment,
  type AppointmentStatus,
} from "@/services/appointments.service";
import { PageSection } from "@/components/layout/page-section";
import {
  useAppointmentsListQuery,
  useDeleteAppointmentMutation,
  useUpdateAppointmentStatusMutation,
} from "@/query/appointments-hooks";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-core";

function FilterInput({
  value,
  onChange,
  type = "text",
  placeholder,
  testId,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  testId: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      data-testid={testId}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-lg border border-border bg-input px-3.5 py-2 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/10"
    />
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function toDateInputValue(value: string) {
  return value.slice(0, 10);
}

const APPOINTMENT_STATUS_ORDER: AppointmentStatus[] = [
  "SCHEDULED",
  "COMPLETED",
  "MISSED",
  "CANCELLED",
];

// 1. Deferred Interactive Loading (ADR 0007)
const loadAppointmentModal = () => import("@/components/appointments/appointment-modal");
const AppointmentModal = dynamic(loadAppointmentModal, { ssr: false });

export default function AppointmentsPage() {
  const appointmentsQuery = useAppointmentsListQuery({ page: 1, limit: 10 });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [dateFromValue, setDateFromValue] = useState("");
  const [dateToValue, setDateToValue] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredAppointments = useMemo(() => {
    const items = appointmentsQuery.data?.items ?? [];

    return items.filter((item) => {
      const appointmentDate = toDateInputValue(item.startTime);
      const matchesSearch =
        !searchValue ||
        item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchValue.toLowerCase());
      const matchesStatus =
        !statusValue ||
        item.status.toLowerCase().includes(statusValue.toLowerCase());
      const matchesDateFrom =
        !dateFromValue || appointmentDate >= dateFromValue;
      const matchesDateTo = !dateToValue || appointmentDate <= dateToValue;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [
    appointmentsQuery.data?.items,
    dateFromValue,
    dateToValue,
    searchValue,
    statusValue,
  ]);

  const deleteMutation = useDeleteAppointmentMutation({
    onSuccess: () => {
      setActionError(null);
    },
    onError: (error) => {
      setActionError(
        getApiErrorMessage(error, "Unable to delete appointment.")
      );
    },
  });

  const updateStatusMutation = useUpdateAppointmentStatusMutation({
    onSuccess: () => {
      setActionError(null);
    },
    onError: (error) => {
      setActionError(
        getApiErrorMessage(error, "Unable to update appointment status.")
      );
    },
  });

  function openCreateDialog() {
    setEditingAppointment(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(appointment: Appointment) {
    setEditingAppointment(appointment);
    setIsDialogOpen(true);
  }

  function handleDelete(seriesId: string | null | undefined) {
    if (!seriesId) {
      setActionError("This appointment cannot be deleted because seriesId is missing.");
      return;
    }
    deleteMutation.mutate(seriesId);
  }

  function handleUpdateStatus(appointment: Appointment) {
    const currentIndex = APPOINTMENT_STATUS_ORDER.indexOf(appointment.status);
    const nextStatus =
      currentIndex === -1
        ? APPOINTMENT_STATUS_ORDER[0]
        : APPOINTMENT_STATUS_ORDER[(currentIndex + 1) % APPOINTMENT_STATUS_ORDER.length];

    updateStatusMutation.mutate({
      appointmentId: appointment.id,
      status: nextStatus,
    });
  }

  return (
    <div data-testid="appointments-page" className="space-y-6">
      <PageSection
        title="Appointments"
        description="Create, update and delete appointments with the current SE113 backend APIs."
        actions={
          <>
            <Button variant="outline">Export</Button>
            <Button
              data-testid="appointment-create-trigger"
              onClick={openCreateDialog}
              onMouseEnter={loadAppointmentModal} // 2. Hover-Intent Prefetching
              onFocus={loadAppointmentModal}
            >
              <PlusIcon />
              <span>New appointment</span>
            </Button>
          </>
        }
      >
        <Card>
          <CardContent className="space-y-5 pt-5">
            <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
              <FilterInput
                placeholder="Search appointments"
                value={searchValue}
                onChange={setSearchValue}
                testId="appointment-search-input"
              />
              <FilterInput
                placeholder="Filter by status"
                value={statusValue}
                onChange={setStatusValue}
                testId="filter-status"
              />
              <FilterInput
                type="date"
                value={dateFromValue}
                onChange={setDateFromValue}
                testId="filter-date-from"
              />
              <FilterInput
                type="date"
                value={dateToValue}
                onChange={setDateToValue}
                testId="filter-date-to"
              />
            </div>
            
            {appointmentsQuery.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {getApiErrorMessage(
                    appointmentsQuery.error,
                    "Unable to load appointments."
                  )}
                </AlertDescription>
              </Alert>
            ) : null}

            {actionError ? (
              <Alert variant="destructive">
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            ) : null}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Skeleton UI for Loading State (ADR 0007) */}
                {appointmentsQuery.isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-64" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-md" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="size-8 rounded-md" />
                          <Skeleton className="size-8 rounded-md" />
                          <Skeleton className="size-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <>
                    {filteredAppointments.map((row) => (
                      <TableRow key={row.id} data-testid="appointment-row">
                        <TableCell>{formatDateTime(row.startTime)}</TableCell>
                        <TableCell>{formatDateTime(row.endTime)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{row.title}</p>
                            {row.description ? (
                              <p className="text-xs text-muted-foreground">
                                {row.description}
                              </p>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="rounded-md">{row.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon-sm"
                              data-testid="appointment-edit-trigger"
                              onMouseEnter={loadAppointmentModal}
                              onClick={() => openEditDialog(row)}
                            >
                              <PencilLineIcon />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon-sm"
                              data-testid="appointment-status-trigger"
                              disabled={updateStatusMutation.isPending}
                              onClick={() => handleUpdateStatus(row)}
                              title={`Set status after ${row.status}`}
                            >
                              <CalendarClockIcon />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon-sm"
                              data-testid="appointment-delete-trigger"
                              disabled={deleteMutation.isPending}
                              onClick={() => handleDelete(row.seriesId)}
                            >
                              <Trash2Icon />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredAppointments.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          data-testid="appointment-empty-state"
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          No appointments match the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </PageSection>

      {isDialogOpen && (
        <AppointmentModal
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingAppointment={editingAppointment}
        />
      )}
    </div>
  );
}
