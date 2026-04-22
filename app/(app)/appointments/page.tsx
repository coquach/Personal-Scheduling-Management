"use client";

import { useMemo, useState } from "react";
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
  useCreateAppointmentMutation,
  useDeleteAppointmentMutation,
  useUpdateAppointmentMutation,
  useUpdateAppointmentStatusMutation,
} from "@/query/appointments-hooks";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/backend-api";

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

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 16);
}

const defaultFormState = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
};

const APPOINTMENT_STATUS_ORDER: AppointmentStatus[] = [
  "SCHEDULED",
  "COMPLETED",
  "MISSED",
  "CANCELLED",
];

export default function AppointmentsPage() {
  const appointmentsQuery = useAppointmentsListQuery({ page: 1, limit: 10 });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [dateFromValue, setDateFromValue] = useState("");
  const [dateToValue, setDateToValue] = useState("");
  const [formState, setFormState] = useState(defaultFormState);
  const [formError, setFormError] = useState<string | null>(null);
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

  const createMutation = useCreateAppointmentMutation({
    onSuccess: () => {
      closeDialog();
    },
    onError: (error) => {
      setFormError(
        getApiErrorMessage(
          error,
          "Unable to create appointment. Please check the values and try again.",
        ),
      );
    },
  });

  const updateMutation = useUpdateAppointmentMutation({
    onSuccess: () => {
      closeDialog();
    },
    onError: (error) => {
      setFormError(
        getApiErrorMessage(
          error,
          "Unable to update appointment. Please check the values and try again.",
        ),
      );
    },
  });

  const deleteMutation = useDeleteAppointmentMutation({
    onSuccess: () => {
      setActionError(null);
    },
    onError: (error) => {
      setActionError(
        getApiErrorMessage(error, "Unable to delete appointment."),
      );
    },
  });

  const updateStatusMutation = useUpdateAppointmentStatusMutation({
    onSuccess: () => {
      setActionError(null);
    },
    onError: (error) => {
      setActionError(
        getApiErrorMessage(error, "Unable to update appointment status."),
      );
    },
  });

  function openCreateDialog() {
    setEditingAppointment(null);
    setFormState(defaultFormState);
    setFormError(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(appointment: Appointment) {
    setEditingAppointment(appointment);
    setFormState({
      title: appointment.title,
      description: appointment.description ?? "",
      startTime: toDateTimeLocalValue(appointment.startTime),
      endTime: toDateTimeLocalValue(appointment.endTime),
    });
    setFormError(null);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setEditingAppointment(null);
    setFormState(defaultFormState);
    setFormError(null);
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

  function handleSaveAppointment() {
    setFormError(null);

    if (!formState.title.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!formState.startTime || !formState.endTime) {
      setFormError("Start time and end time are required.");
      return;
    }

    const payload = {
      title: formState.title.trim(),
      description: formState.description.trim() || undefined,
      startTime: new Date(formState.startTime).toISOString(),
      endTime: new Date(formState.endTime).toISOString(),
    };

    if (editingAppointment) {
      if (!editingAppointment.seriesId) {
        setFormError("This appointment cannot be edited because seriesId is missing.");
        return;
      }

      updateMutation.mutate({
        id: editingAppointment.seriesId,
        payload,
      });
      return;
    }

    createMutation.mutate(payload);
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isConflictError = formError?.toLowerCase().includes("overlapping");
  const isTimeError = Boolean(
    formError &&
      (formError.toLowerCase().includes("time") ||
        formError.toLowerCase().includes("past") ||
        formError.toLowerCase().includes("start") ||
        formError.toLowerCase().includes("end")),
  );

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
            {appointmentsQuery.isLoading ? (
              <Alert>
                <AlertDescription>Loading appointments...</AlertDescription>
              </Alert>
            ) : null}
            {appointmentsQuery.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {getApiErrorMessage(
                    appointmentsQuery.error,
                    "Unable to load appointments.",
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
                {!appointmentsQuery.isLoading &&
                filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      data-testid="appointment-empty-state"
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No appointments match the current filters.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </PageSection>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsDialogOpen(true);
            return;
          }

          closeDialog();
        }}
      >
        <DialogContent data-testid="appointment-form-modal">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? "Edit appointment" : "Create appointment"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              data-testid="appointment-title-input"
              placeholder="Title"
              value={formState.title}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
            <Textarea
              data-testid="appointment-description-input"
              placeholder="Description"
              value={formState.description}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                data-testid="appointment-start-input"
                type="datetime-local"
                value={formState.startTime}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    startTime: event.target.value,
                  }))
                }
              />
              <Input
                data-testid="appointment-end-input"
                type="datetime-local"
                value={formState.endTime}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    endTime: event.target.value,
                  }))
                }
              />
            </div>
            {isConflictError ? (
              <Alert data-testid="appointment-conflict-alert">
                <AlertTitle>Time conflict detected</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
            {formError && !isConflictError ? (
              <Alert
                variant="destructive"
                data-testid={
                  isTimeError ? "appointment-time-error" : "appointment-error-banner"
                }
              >
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
            <Alert>
              <AlertDescription>
                Tag assignment will be enabled after the corresponding backend
                endpoints are available.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              data-testid="appointment-save"
              disabled={isSaving}
              onClick={handleSaveAppointment}
            >
              {isSaving ? "Saving..." : "Save appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
