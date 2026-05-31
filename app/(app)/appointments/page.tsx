"use client";

import {
  CalendarClockIcon,
  CalendarX2,
  PencilLineIcon,
  PlusIcon,
  Search,
  Trash2Icon
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiErrorMessage } from "@/lib/api-core";
import {
  useAppointmentsListQuery,
  useDeleteAppointmentMutation,
  useUpdateAppointmentStatusMutation,
} from "@/query/appointments-hooks";
import { 
  useGetTeamAppointments,
  useDeleteTeamAppointment,
  useUpdateTeamAppointment 
} from "@/query/team-appointments-hooks";
import { type TeamAppointmentListItem } from "@/model/team-appointments";
import { useGetTeams } from "@/query/team-hooks";
import {
  type Appointment,
  type AppointmentStatus,
} from "@/services/appointments.service";

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
  const [page, setPage] = useState(1);
  const appointmentsQuery = useAppointmentsListQuery({ page, limit: 10 });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  // Delete confirmation state
  const [deleteSeriesId, setDeleteSeriesId] = useState<string | null>(null);
  
  // Delete confirmation state for Team
  const [deleteTeamAppointmentId, setDeleteTeamAppointmentId] = useState<string | null>(null);
  const [editingTeamAppointment, setEditingTeamAppointment] = useState<TeamAppointmentListItem | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [dateFromValue, setDateFromValue] = useState("");
  const [dateToValue, setDateToValue] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Team Appointments State
  const [activeTab, setActiveTab] = useState("personal");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("all");
  const [teamPage, setTeamPage] = useState(1);
  
  const teamsQuery = useGetTeams({ page: 1, limit: 100 });
  const teams = teamsQuery.data?.items ?? [];

  const teamAppointmentsQuery = useGetTeamAppointments(
    selectedTeamId !== "all" ? selectedTeamId : "",
    { page: teamPage, limit: 10 }
  );

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

  const deleteTeamMutation = useDeleteTeamAppointment(selectedTeamId !== "all" ? selectedTeamId : "");
  const updateTeamStatusMutation = useUpdateTeamAppointment(selectedTeamId !== "all" ? selectedTeamId : "");

  function openCreateDialog() {
    setEditingAppointment(null);
    setEditingTeamAppointment(null);
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

  function openEditTeamDialog(appointment: TeamAppointmentListItem) {
    setEditingTeamAppointment(appointment);
    setIsDialogOpen(true);
  }

  function confirmTeamDelete(id: string) {
    setDeleteTeamAppointmentId(id);
  }

  function handleTeamDeleteConfirm() {
    if (deleteTeamAppointmentId) {
      deleteTeamMutation.mutate(deleteTeamAppointmentId, {
        onSuccess: () => setDeleteTeamAppointmentId(null),
        onError: (err) => {
          setActionError(getApiErrorMessage(err, "Unable to delete team appointment."));
          setDeleteTeamAppointmentId(null);
        }
      });
    }
  }

  const totalPages = Math.ceil((appointmentsQuery.data?.total ?? 0) / 10);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const teamTotalPages = Math.ceil((teamAppointmentsQuery.data?.total ?? 0) / 10);
  const teamHasNextPage = teamPage < teamTotalPages;
  const teamHasPrevPage = teamPage > 1;

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
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="personal">My Appointments</TabsTrigger>
            <TabsTrigger value="team">Team Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-0 space-y-4">
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
                    <div key={i} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 p-4 items-start md:items-center">
                      <div className="w-full md:col-span-5 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <div className="hidden md:block col-span-3">
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <div className="hidden md:block col-span-2">
                        <Skeleton className="h-5 w-20 rounded-md" />
                      </div>
                      <div className="flex w-full md:w-auto md:col-span-2 justify-end gap-2 mt-2 md:mt-0">
                        <Skeleton className="size-8 rounded-md" />
                        <Skeleton className="size-8 rounded-md" />
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {filteredAppointments.map((row) => (
                      <div key={row.id} className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 p-4 items-start md:items-center hover:bg-muted/30 transition-colors group relative">
                        <div className="w-full md:col-span-5 flex flex-col">
                          <div className="flex items-center justify-between w-full md:w-auto pr-10 md:pr-0">
                            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                              {row.title}
                            </span>
                            <Badge 
                              variant="outline" 
                              className="md:hidden text-[10px] font-medium uppercase tracking-wider bg-primary/5 text-primary border-primary/20 shrink-0"
                            >
                              {row.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="w-full md:w-auto md:flex flex-col md:col-span-4 text-xs text-muted-foreground font-mono mt-1 md:mt-0">
                          <span className="flex items-center gap-1.5 md:hidden text-muted-foreground/80 mb-1">
                            <CalendarClockIcon className="w-3.5 h-3.5" />
                            {formatDateTime(row.startAt as string)} - {formatDateTime(row.endAt as string)}
                          </span>
                          <div className="hidden md:flex flex-col">
                            <span>{formatDateTime(row.startAt as string)}</span>
                            <span className="opacity-70">to {formatDateTime(row.endAt as string)}</span>
                          </div>
                        </div>
                        <div className="hidden md:flex col-span-2 items-center">
                          <Badge 
                            variant="outline" 
                            className="text-[10px] font-medium uppercase tracking-wider bg-primary/5 text-primary border-primary/20"
                          >
                            {row.status}
                          </Badge>
                        </div>
                        <div className="absolute top-2 right-2 md:relative md:top-auto md:right-auto md:col-span-2 flex justify-end items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          
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
                            disabled={row.isRecurringInstance}
                            title={row.isRecurringInstance ? "Editing recurring appointments is not supported yet." : "Edit"}
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
                          We couldn&apos;t find any appointments matching your current filters.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                  Showing page {page} of {totalPages}
                </p>
                <Pagination className="justify-end w-auto mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (hasPrevPage && !appointmentsQuery.isLoading) setPage((p) => p - 1);
                        }}
                        className={!hasPrevPage || appointmentsQuery.isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        {page}
                      </PaginationLink>
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (hasNextPage && !appointmentsQuery.isLoading) setPage((p) => p + 1);
                        }}
                        className={!hasNextPage || appointmentsQuery.isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </TabsContent>

          <TabsContent value="team" className="mt-0 space-y-4">
            <div className="flex items-center gap-4 bg-muted/30 border border-border/50 rounded-xl p-4">
              <span className="text-sm font-medium">Select Team:</span>
              <Select value={selectedTeamId} onValueChange={(val) => { setSelectedTeamId(val ?? ""); setTeamPage(1); }}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" disabled>-- Choose a Team --</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTeamId === "all" ? (
              <div className="border border-border/40 rounded-xl bg-card/50 backdrop-blur-sm py-16 px-4 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <CalendarX2 className="w-8 h-8 text-muted-foreground/70" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">Select a team</h3>
                <p className="text-sm text-muted-foreground max-w-[280px]">
                  Please choose a team from the dropdown above to view its appointments.
                </p>
              </div>
            ) : (
              <div className="border border-border/40 rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 gap-4 p-3 px-4 border-b border-border/40 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-8 md:col-span-6">Details</div>
                  <div className="hidden md:block col-span-3">Time Range</div>
                  <div className="hidden md:block col-span-2 text-center">Status</div>
                  <div className="hidden md:flex col-span-1 justify-end">Actions</div>
                </div>
                
                <div className="divide-y divide-border/40">
                  {teamAppointmentsQuery.isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 p-4 items-start md:items-center">
                        <div className="w-full md:col-span-6 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <div className="hidden md:block col-span-4">
                          <Skeleton className="h-4 w-full" />
                        </div>
                        <div className="hidden md:flex col-span-2 justify-end">
                          <Skeleton className="h-5 w-20 rounded-md" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      {teamAppointmentsQuery.data?.items.map((row) => (
                        <div key={row.id} className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 p-4 items-start md:items-center hover:bg-muted/30 transition-colors">
                          <div className="w-full md:col-span-6 flex flex-col">
                            <div className="flex items-center justify-between w-full md:w-auto pr-10 md:pr-0">
                              <span className="text-sm font-medium text-foreground">
                                {row.title}
                              </span>
                              <Badge 
                                variant="outline" 
                                className="md:hidden text-[10px] font-medium uppercase tracking-wider bg-primary/5 text-primary border-primary/20 shrink-0"
                              >
                                {row.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="w-full md:w-auto md:flex flex-col md:col-span-3 text-xs text-muted-foreground font-mono mt-1 md:mt-0">
                            <span className="flex items-center gap-1.5 md:hidden text-muted-foreground/80 mb-1">
                              <CalendarClockIcon className="w-3.5 h-3.5" />
                              {formatDateTime(row.startAt as string)} - {formatDateTime(row.endAt as string)}
                            </span>
                            <div className="hidden md:flex flex-col">
                              <span>{formatDateTime(row.startAt as string)}</span>
                              <span className="opacity-70">to {formatDateTime(row.endAt as string)}</span>
                            </div>
                          </div>
                          <div className="hidden md:flex col-span-2 justify-center items-center">
                            <Badge 
                              variant="outline" 
                              className="text-[10px] font-medium uppercase tracking-wider bg-primary/5 text-primary border-primary/20"
                            >
                              {row.status}
                            </Badge>
                          </div>
                          <div className="flex md:col-span-1 justify-end items-center gap-1 mt-2 md:mt-0 w-full md:w-auto border-t md:border-0 border-border/40 pt-2 md:pt-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors ml-auto md:ml-0"
                                >
                                  <div className="w-4 h-4 rounded-full border-[1.5px] border-current flex items-center justify-center opacity-70">
                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                  </div>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  Update Status
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {APPOINTMENT_STATUS_ORDER.map((status) => (
                                  <DropdownMenuItem
                                    key={status}
                                    className="text-sm cursor-pointer"
                                    onClick={() => updateTeamStatusMutation.mutate({ appointmentId: row.id, input: { status } })}
                                    disabled={row.status === status || updateTeamStatusMutation.isPending}
                                  >
                                    <span className={row.status === status ? "font-bold" : ""}>
                                      {status.charAt(0) + status.slice(1).toLowerCase()}
                                    </span>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                              onClick={() => openEditTeamDialog(row)}
                            >
                              <PencilLineIcon className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                              onClick={() => confirmTeamDelete(row.id)}
                            >
                              <Trash2Icon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {teamAppointmentsQuery.data?.items.length === 0 && (
                        <div className="col-span-12 py-16 px-4 flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                            <CalendarX2 className="w-8 h-8 text-muted-foreground/70" />
                          </div>
                          <h3 className="text-base font-semibold text-foreground mb-1">No appointments</h3>
                          <p className="text-sm text-muted-foreground mb-5 max-w-[280px]">
                            This team doesn&apos;t have any appointments scheduled yet.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Team Pagination Controls */}
            {teamTotalPages > 1 && selectedTeamId !== "all" && (
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                  Showing page {teamPage} of {teamTotalPages}
                </p>
                <Pagination className="justify-end w-auto mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (teamHasPrevPage && !teamAppointmentsQuery.isLoading) setTeamPage((p) => p - 1);
                        }}
                        className={!teamHasPrevPage || teamAppointmentsQuery.isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        {teamPage}
                      </PaginationLink>
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (teamHasNextPage && !teamAppointmentsQuery.isLoading) setTeamPage((p) => p + 1);
                        }}
                        className={!teamHasNextPage || teamAppointmentsQuery.isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {isDialogOpen && (
        <AppointmentModal
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingAppointment={editingAppointment}
          editingTeamAppointment={editingTeamAppointment}
          defaultTab={activeTab === "team" ? "team" : "personal"}
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
      
      {/* Team Appointment Delete Confirmation Dialog */}
      <Dialog open={!!deleteTeamAppointmentId} onOpenChange={(open) => !open && setDeleteTeamAppointmentId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this team appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteTeamAppointmentId(null)} disabled={deleteTeamMutation.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleTeamDeleteConfirm} disabled={deleteTeamMutation.isPending}>
              {deleteTeamMutation.isPending ? "Deleting..." : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
