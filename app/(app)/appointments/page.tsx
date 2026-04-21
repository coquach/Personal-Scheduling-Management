"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClockIcon,
  PencilLineIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  type Appointment,
  updateAppointment,
} from "@/services/appointments.service";
import { PageSection } from "@/components/layout/page-section";
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
import { queryKeys } from "@/query/keys";

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
  isAllDay: false,
};

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const appointmentsQuery = useQuery({
    queryKey: queryKeys.appointments.list({ page: "1", limit: "50" }),
    queryFn: () => getAppointments({ page: 1, limit: 50 }),
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [dateFromValue, setDateFromValue] = useState("");
  const [dateToValue, setDateToValue] = useState("");
  const [formState, setFormState] = useState(defaultFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const invalidateAppointments = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.appointments.all,
    });

  const createMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: async () => {
      await invalidateAppointments();
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

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateAppointment>[1];
    }) => updateAppointment(id, payload),
    onSuccess: async () => {
      await invalidateAppointments();
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

  const deleteMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: async () => {
      setDeleteError(null);
      await invalidateAppointments();
    },
    onError: (error) => {
      setDeleteError(
        getApiErrorMessage(error, "Unable to delete appointment."),
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
      isAllDay: false,
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

  function handleDelete(id: string) {
    deleteMutation.mutate(id);
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
      isAllDay: formState.isAllDay,
      scope: "single" as const,
    };

    if (editingAppointment) {
      updateMutation.mutate({
        id: editingAppointment.id,
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
            {deleteError ? (
              <Alert variant="destructive">
                <AlertDescription>{deleteError}</AlertDescription>
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
                          disabled
                        >
                          <CalendarClockIcon />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          data-testid="appointment-delete-trigger"
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(row.id)}
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
                Status changes and tag assignment will be enabled after the
                corresponding backend endpoints are available.
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
