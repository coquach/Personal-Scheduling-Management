"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTagsQuery } from "@/query/tags-hooks";

import { getApiErrorMessage } from "@/lib/api-core";
import {
  createAppointmentInputSchema,
  type CreateAppointmentInput,
} from "@/model/appointments";
import {
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
} from "@/query/appointments-hooks";
import { type Appointment } from "@/services/appointments.service";

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAppointment: Appointment | null;
}

export default function AppointmentModal({
  open,
  onOpenChange,
  editingAppointment,
}: AppointmentModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  // Derive state during render: Reset local states when modal transitions to open
  if (open && !prevOpen) {
    setPrevOpen(true);
    setApiError(null);
    setIsMoreOptionsOpen(false);
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  const createMutation = useCreateAppointmentMutation({
    onSuccess: () => {
      onOpenChange(false);
    },
    onError: (error) => {
      setApiError(
        getApiErrorMessage(
          error,
          "Unable to create appointment. Please check the values and try again."
        )
      );
    },
  });

  const updateMutation = useUpdateAppointmentMutation({
    onSuccess: () => {
      onOpenChange(false);
    },
    onError: (error) => {
      setApiError(
        getApiErrorMessage(
          error,
          "Unable to update appointment. Please check the values and try again."
        )
      );
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateAppointmentInput>({
    resolver: zodResolver(createAppointmentInputSchema),
    defaultValues: {
      title: "",
      description: "",
      startAt: "",
      endAt: "",
      recurrenceType: "ONETIME",
      tagIds: [],
    },
  });

  const selectedTagIds = watch("tagIds") || [];
  const selectedRecurrence = watch("recurrenceType");

  const tagsQuery = useTagsQuery();

  useEffect(() => {
    if (open) {
      if (editingAppointment) {
        reset({
          title: editingAppointment.title,
          description: editingAppointment.description ?? "",
          startAt: toDateTimeLocalValue(editingAppointment.startAt),
          endAt: toDateTimeLocalValue(editingAppointment.endAt),
          recurrenceType: "ONETIME", // Keep it simple for edit mode unless the API returns it
          tagIds: editingAppointment.tags?.map((t: { id: string }) => t.id) || [],
        });
      } else {
        reset({
          title: "",
          description: "",
          startAt: "",
          endAt: "",
          recurrenceType: "ONETIME",
          tagIds: [],
        });
      }
    }
  }, [open, editingAppointment, reset]);

  const onSubmit = (data: CreateAppointmentInput) => {
    setApiError(null);

    const payload = {
      ...data,
      startAt: new Date(data.startAt).toISOString(),
      endAt: new Date(data.endAt).toISOString(),
    };

    if (editingAppointment) {
      if (!editingAppointment.seriesId) {
        setApiError("This appointment cannot be edited because seriesId is missing.");
        return;
      }
      updateMutation.mutate({
        id: editingAppointment.seriesId,
        payload,
      });
      return;
    }

    createMutation.mutate(payload);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isConflictError = apiError?.toLowerCase().includes("overlapping");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="appointment-form-modal" className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? "Edit appointment" : "Create appointment"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Input
                {...register("title")}
                data-testid="appointment-title-input"
                placeholder="Title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Start time</Label>
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
                <Label>End time</Label>
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

            {/* Progressive Disclosure Toggle */}
            <button
              type="button"
              className="flex items-center text-sm font-medium text-primary hover:underline w-max"
              onClick={() => setIsMoreOptionsOpen((prev) => !prev)}
            >
              {isMoreOptionsOpen ? (
                <ChevronUpIcon className="mr-1 h-4 w-4" />
              ) : (
                <ChevronDownIcon className="mr-1 h-4 w-4" />
              )}
              {isMoreOptionsOpen ? "Hide options" : "More options"}
            </button>

            {/* Progressive Disclosure Content */}
            {isMoreOptionsOpen && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Textarea
                    {...register("description")}
                    data-testid="appointment-description-input"
                    placeholder="Add more details..."
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Recurrence</Label>
                  <Select
                    value={selectedRecurrence}
                    onValueChange={(val: any) => setValue("recurrenceType", val)} // eslint-disable-line @typescript-eslint/no-explicit-any
                  >
                    <SelectTrigger data-testid="appointment-recurrence-trigger">
                      <SelectValue placeholder="Select recurrence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONETIME">None (One-time)</SelectItem>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  {tagsQuery.isLoading && <p className="text-xs text-muted-foreground">Loading tags...</p>}
                  {!tagsQuery.isLoading && tagsQuery.data && tagsQuery.data.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tagsQuery.data.map((tag) => {
                        const isSelected = selectedTagIds.includes(tag.id);
                        const tagColor = tag.color || "var(--primary)";
                        return (
                          <Badge
                            key={tag.id}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer transition-colors"
                            onClick={() => {
                              const newTags = isSelected
                                ? selectedTagIds.filter((id) => id !== tag.id)
                                : [...selectedTagIds, tag.id];
                              setValue("tagIds", newTags);
                            }}
                            style={{
                              backgroundColor: isSelected ? tagColor : "transparent",
                              borderColor: tagColor,
                              color: isSelected ? "#fff" : tagColor,
                            }}
                          >
                            {tag.name}
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    !tagsQuery.isLoading && <p className="text-xs text-muted-foreground">No tags available.</p>
                  )}
                </div>
              </div>
            )}

            {isConflictError ? (
              <Alert variant="destructive" data-testid="appointment-conflict-alert">
                <AlertTitle>Time conflict detected</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            ) : null}
            {apiError && !isConflictError ? (
              <Alert variant="destructive" data-testid="appointment-error-banner">
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="appointment-save" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
