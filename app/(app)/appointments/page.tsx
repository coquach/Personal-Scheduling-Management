"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  CalendarClockIcon,
  PencilLineIcon,
  PlusIcon,
  Trash2Icon,
  Search,
  CalendarX2,
  MoreHorizontal
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
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-core";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

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
  
  // Delete confirmation state
  const [deleteSeriesId, setDeleteSeriesId] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [dateFromValue, setDateFromValue] = useState("");
  const [dateToValue, setDateToValue] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredAppointments = useMemo(() => {
    const items = appointmentsQuery.data?.items ?? [];

    return items.filter((item) => {
      const appointmentDate = toDateInputValue(item.startAt);
      const matchesSearch =
        !searchValue ||
        item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchValue.toLowerCase());
      const matchesStatus =
        !statusValue ||
        item.status.toLowerCase().includes(statusValue.toLowerCase());
        
      const filterDateFrom = dateFromValue ? toDateInputValue(dateFromValue) : "";
      const filterDateTo = dateToValue ? toDateInputValue(dateToValue) : "";

      const matchesDateFrom =
        !filterDateFrom || appointmentDate >= filterDateFrom;
      const matchesDateTo = !filterDateTo || appointmentDate <= filterDateTo;

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
      setDeleteSeriesId(null);
    },
    onError: (error) => {
      setActionError(
        getApiErrorMessage(error, "Unable to delete appointment.")
      );
      setDeleteSeriesId(null);
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

  function confirmDelete(seriesId: string | null | undefined) {
    if (!seriesId) {
      setActionError("This appointment cannot be deleted because seriesId is missing.");
      return;
    }
    setDeleteSeriesId(seriesId);
  }

  function handleDeleteConfirm() {
    if (deleteSeriesId) {
      deleteMutation.mutate(deleteSeriesId);
    }
  }

  return (
    <div data-testid="appointments-page" className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your schedule, upcoming events, and personal tasks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Export</Button>
          <Button
            data-testid="appointment-create-trigger"
            onClick={openCreateDialog}
            onMouseEnter={loadAppointmentModal}
            onFocus={loadAppointmentModal}
            className="shadow-sm hover:-translate-y-0.5 transition-transform"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            <span>New appointment</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Filters Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-muted/30 border border-border/50 rounded-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by status..."
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
            />
          </div>
          <div>
            <DateTimePicker
              placeholder="From Date"
              value={dateFromValue}
              onChange={setDateFromValue}
            />
          </div>
          <div>
            <DateTimePicker
              placeholder="To Date"
              value={dateToValue}
              onChange={setDateToValue}
            />
          </div>
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

        {/* Linear Data-dense List */}
        <div className="border border-border/40 rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 gap-4 p-3 px-4 border-b border-border/40 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-8 md:col-span-5">Details</div>
            <div className="hidden md:block col-span-3">Time Range</div>
            <div className="hidden md:block col-span-2">Status</div>
            <div className="col-span-4 md:col-span-2 text-right">Actions</div>
          </div>
          
          <div className="divide-y divide-border/40">
            {appointmentsQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center">
                  <div className="col-span-8 md:col-span-5 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <div className="hidden md:block col-span-3">
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="hidden md:block col-span-2">
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </div>
                  <div className="col-span-4 md:col-span-2 flex justify-end gap-2">
                    <Skeleton className="size-8 rounded-md" />
                    <Skeleton className="size-8 rounded-md" />
                  </div>
                </div>
              ))
            ) : (
              <>
                {filteredAppointments.map((row) => (
                  <div key={row.id} className="grid grid-cols-12 gap-4 p-3 px-4 items-center hover:bg-muted/30 transition-colors group">
                    <div className="col-span-8 md:col-span-5 flex flex-col">
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {row.title}
                      </span>
                      {row.description && (
                        <span className="text-xs text-muted-foreground truncate max-w-[280px] mt-0.5">
                          {row.description}
                        </span>
                      )}
                    </div>
                    <div className="hidden md:flex flex-col col-span-3 text-xs text-muted-foreground font-mono">
                      <span>{formatDateTime(row.startAt)}</span>
                      <span className="opacity-70">to {formatDateTime(row.endAt)}</span>
                    </div>
                    <div className="hidden md:flex col-span-2 items-center">
                      <Badge 
                        variant="outline" 
                        className="text-[10px] font-medium uppercase tracking-wider bg-primary/5 text-primary border-primary/20"
                      >
                        {row.status}
                      </Badge>
                    </div>
                    <div className="col-span-4 md:col-span-2 flex justify-end items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger >
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted" 
                            disabled={updateStatusMutation.isPending}
                          >
                            <CalendarClockIcon size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel className="text-xs">Update Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {APPOINTMENT_STATUS_ORDER.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              disabled={row.status === status}
                              onClick={() => {
                                updateStatusMutation.mutate({
                                  appointmentId: row.id,
                                  status: status,
                                });
                              }}
                              className="text-xs"
                            >
                              {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                        data-testid="appointment-edit-trigger"
                        onMouseEnter={loadAppointmentModal}
                        onClick={() => openEditDialog(row)}
                      >
                        <PencilLineIcon size={14} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        data-testid="appointment-delete-trigger"
                        disabled={deleteMutation.isPending}
                        onClick={() => confirmDelete(row.seriesId)}
                      >
                        <Trash2Icon size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredAppointments.length === 0 && (
                  <div className="col-span-12 py-16 px-4 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <CalendarX2 className="w-8 h-8 text-muted-foreground/70" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1">No appointments found</h3>
                    <p className="text-sm text-muted-foreground mb-5 max-w-[280px]">
                      We couldn't find any appointments matching your current filters.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {isDialogOpen && (
        <AppointmentModal
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingAppointment={editingAppointment}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteSeriesId} onOpenChange={(open) => !open && setDeleteSeriesId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this appointment? This action cannot be undone.
              If this is a recurring appointment, the entire series will be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteSeriesId(null)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
