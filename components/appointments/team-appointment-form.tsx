"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { AlertCircle, CalendarClock, Users, Trash2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";


import { useGetTeams, useGetTeamMembers } from "@/query/team-hooks";
import { useCreateTeamAppointment, useUpdateTeamAppointment, useDeleteTeamAppointment } from "@/query/team-appointments-hooks";
import { useTeamAvailability } from "@/hooks/use-team-availability";
import { 
  createTeamAppointmentRequestSchema,
  type CreateTeamAppointmentRequest,
  type TeamAppointmentListItem,
  type UpdateTeamAppointmentRequest
} from "@/model/team-appointments";
import { toast } from "sonner";

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function formatTimeOnly(dateString: string | Date) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    timeStyle: "short",
  }).format(date);
}

interface TeamAppointmentFormProps {
  onOpenChange: (open: boolean) => void;
  initialDate?: string | null;
  editingAppointment?: TeamAppointmentListItem | null;
}

export function TeamAppointmentForm({
  onOpenChange,
  initialDate,
  editingAppointment,
}: TeamAppointmentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateTeamAppointmentRequest>({
    resolver: zodResolver(createTeamAppointmentRequestSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: editingAppointment ? {
      title: editingAppointment.title,
      description: "",
      location: "",
      startAt: toDateTimeLocalValue(editingAppointment.startAt as string),
      endAt: toDateTimeLocalValue(editingAppointment.endAt as string),
      participantSelectionMode: "ALL",
      participantUserIds: [],
    } : {
      title: "",
      description: "",
      location: "",
      startAt: "",
      endAt: "",
      participantSelectionMode: "ALL",
      participantUserIds: [],
    },
  });

  const selectedStartAt = useWatch({ control, name: "startAt" });
  const selectedEndAt = useWatch({ control, name: "endAt" });
  const selectedMode = useWatch({ control, name: "participantSelectionMode" });
  const rawParticipantIds = useWatch({ control, name: "participantUserIds" });
  const selectedParticipantIds = useMemo(() => rawParticipantIds || [], [rawParticipantIds]);
  
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    editingAppointment ? editingAppointment.teamId : ""
  );

  const teamsQuery = useGetTeams({ page: 1, limit: 100 });
  const teams = teamsQuery.data?.items ?? [];

  const teamMembersQuery = useGetTeamMembers(selectedTeamId);
  const teamMembers = useMemo(() => teamMembersQuery.data?.items ?? [], [teamMembersQuery.data?.items]);

  const createMutation = useCreateTeamAppointment(selectedTeamId);
  const updateMutation = useUpdateTeamAppointment(selectedTeamId);
  const deleteMutation = useDeleteTeamAppointment(selectedTeamId);

  // Initialize dates
  useEffect(() => {
    if (initialDate) {
      const baseDate = initialDate.slice(0, 10);
      reset({
        title: "",
        description: "",
        location: "",
        startAt: `${baseDate}T09:00`,
        endAt: `${baseDate}T10:00`,
        participantSelectionMode: "ALL",
        participantUserIds: [],
      });
    }
  }, [initialDate, reset]);

  // Derived effective participants for the API
  const effectiveParticipantIds = useMemo(() => {
    if (!selectedTeamId || teamMembers.length === 0) return [];
    if (selectedMode === "ALL") {
      return teamMembers.map(m => m.userId);
    }
    return selectedParticipantIds;
  }, [selectedTeamId, teamMembers, selectedMode, selectedParticipantIds]);

  const { isChecking, hasConflicts, conflictData } = useTeamAvailability({
    teamId: selectedTeamId,
    startAt: selectedStartAt,
    endAt: selectedEndAt,
    participantIds: effectiveParticipantIds,
  });

  const onSubmit = (data: CreateTeamAppointmentRequest) => {
    if (!selectedTeamId) {
      toast.error("Please select a team first.");
      return;
    }

    if (hasConflicts) {
      toast.error("Cannot create appointment with time conflicts. Please resolve them first.");
      return;
    }

    const payload: CreateTeamAppointmentRequest = {
      ...data,
      startAt: new Date(data.startAt).toISOString(),
      endAt: new Date(data.endAt).toISOString(),
      // Send the appropriate participant data
      participantSelectionMode: data.participantSelectionMode,
      participantUserIds: data.participantSelectionMode === "CUSTOM" ? data.participantUserIds : undefined,
    };

    if (editingAppointment) {
      updateMutation.mutate(
        { appointmentId: editingAppointment.id, input: payload as UpdateTeamAppointmentRequest },
        {
          onSuccess: () => {
            toast.success("Team appointment updated successfully.");
            onOpenChange(false);
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Team appointment created successfully.");
          onOpenChange(false);
        },
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const APPOINTMENT_STATUS_ORDER = [
    "SCHEDULED",
    "COMPLETED",
    "MISSED",
    "CANCELLED",
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
      <div className="grid gap-4 py-4">
        {editingAppointment && (
          <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/50">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Status</Label>
              <p className="text-xs text-muted-foreground">Update the current status</p>
            </div>
            <Select
              value={editingAppointment.status}
              onValueChange={(val) => {
                updateMutation.mutate({
                  appointmentId: editingAppointment.id,
                  input: { status: val as "SCHEDULED" | "COMPLETED" | "MISSED" | "CANCELLED" },
                }, {
                  onSuccess: () => {
                    toast.success("Status updated successfully.");
                  }
                });
              }}
              disabled={updateMutation.isPending}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs font-medium" disabled={editingAppointment.status === s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Team Selection */}
        <div className="space-y-1">
          <Label>Select Team <span className="text-destructive">*</span></Label>
          <Select
            value={selectedTeamId}
            onValueChange={(val) => {
              setSelectedTeamId(val ?? "");
              setValue("participantSelectionMode", "ALL");
              setValue("participantUserIds", []);
            }}
          >
            <SelectTrigger className={!selectedTeamId ? "text-muted-foreground" : ""}>
              <SelectValue placeholder="Choose a team">
                {selectedTeamId ? (teams.find(t => t.id === selectedTeamId)?.name || "Loading team...") : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Input
            {...register("title")}
            placeholder="Appointment Title"
            disabled={!selectedTeamId}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Start time <span className="text-destructive">*</span></Label>
            <Controller
              control={control}
              name="startAt"
              render={({ field }) => (
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select start time"
                  isInvalid={!!errors.startAt}
                />
              )}
            />
            {errors.startAt && (
              <p className="text-sm text-destructive">{errors.startAt.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>End time <span className="text-destructive">*</span></Label>
            <Controller
              control={control}
              name="endAt"
              render={({ field }) => (
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select end time"
                  isInvalid={!!errors.endAt}
                />
              )}
            />
            {errors.endAt && (
              <p className="text-sm text-destructive">{errors.endAt.message}</p>
            )}
          </div>
        </div>

        {/* Location & Description */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Input
              {...register("location")}
              placeholder="Location (Optional)"
              disabled={!selectedTeamId}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Textarea
              {...register("description")}
              placeholder="Description (Optional)"
              disabled={!selectedTeamId}
            />
          </div>
        </div>

        {/* Participants & Availability Insight */}
        {selectedTeamId && (
          <div className="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4 text-primary" />
                Participants
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant={selectedMode === "ALL" ? "default" : "outline"} className="cursor-pointer" onClick={() => setValue("participantSelectionMode", "ALL")}>
                  All Members
                </Badge>
                <Badge variant={selectedMode === "CUSTOM" ? "default" : "outline"} className="cursor-pointer" onClick={() => setValue("participantSelectionMode", "CUSTOM")}>
                  Custom
                </Badge>
              </div>
            </div>

            {/* Custom Mode Member Selection */}
            {selectedMode === "CUSTOM" && (
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/30">
                {teamMembers.map((member) => (
                  <label key={member.userId} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded-md">
                    <Checkbox
                      checked={selectedParticipantIds.includes(member.userId)}
                      onCheckedChange={(checked) => {
                        const current = new Set(selectedParticipantIds);
                        if (checked) current.add(member.userId);
                        else current.delete(member.userId);
                        setValue("participantUserIds", Array.from(current));
                      }}
                    />
                    <span>{member.email}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Availability Insight Block */}
            {isChecking && (
              <p className="text-xs text-muted-foreground animate-pulse">Checking availability...</p>
            )}

            {!isChecking && conflictData && (
              <div className="space-y-3 mt-4 pt-4 border-t border-border/30">
                {hasConflicts ? (
                  <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Time Conflicts Detected</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      <p>The following members are busy:</p>
                      <ul className="list-disc list-inside mt-1 font-medium">
                        {conflictData.busyParticipants.map(bp => (
                          <li key={bp.userId}>{bp.displayName}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400">
                    <CalendarClock className="h-4 w-4 !text-emerald-600 dark:!text-emerald-400" />
                    <AlertTitle>Everyone is available</AlertTitle>
                    <AlertDescription className="text-xs">
                      All {conflictData.availableParticipants.length} selected participants are free at this time.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Suggestions */}
                {conflictData.suggestedSlots && conflictData.suggestedSlots.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Suggested Alternative Times:</Label>
                    <div className="flex flex-wrap gap-2">
                      {conflictData.suggestedSlots.map((slot, idx) => (
                        <Button
                          key={idx}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                          onClick={() => {
                            setValue("startAt", toDateTimeLocalValue(slot.startAt as string));
                            setValue("endAt", toDateTimeLocalValue(slot.endAt as string));
                          }}
                        >
                          {formatTimeOnly(slot.startAt)} - {formatTimeOnly(slot.endAt)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between gap-2 items-center">
        {editingAppointment ? (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              if (confirm("Are you sure you want to delete this team appointment?")) {
                deleteMutation.mutate(editingAppointment.id, {
                  onSuccess: () => {
                    toast.success("Team appointment deleted successfully.");
                    onOpenChange(false);
                  }
                });
              }
            }}
            disabled={deleteMutation.isPending}
          >
            <Trash2Icon className="w-4 h-4 mr-2" />
            Delete
          </Button>
        ) : (
          <div /> // Spacer
        )}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isChecking || hasConflicts || !selectedTeamId}
            isLoading={isSaving}
          >
            {isSaving ? "Saving..." : editingAppointment ? "Update Appointment" : "Create Appointment"}
          </Button>
        </div>
      </div>
    </form>
  );
}
