"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
} from "@/query/appointments-hooks";
import {
  createAppointmentInputSchema,
  type CreateAppointmentInput,
} from "@/model/validation/appointments";
import { type Appointment } from "@/services/appointments.service";
import { getApiErrorMessage } from "@/lib/api-core";

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
    formState: { errors },
  } = useForm<CreateAppointmentInput>({
    resolver: zodResolver(createAppointmentInputSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: "",
      endTime: "",
    },
  });

  useEffect(() => {
    if (open) {
      setApiError(null);
      setIsMoreOptionsOpen(false);
      if (editingAppointment) {
        reset({
          title: editingAppointment.title,
          description: editingAppointment.description ?? "",
          startTime: toDateTimeLocalValue(editingAppointment.startTime),
          endTime: toDateTimeLocalValue(editingAppointment.endTime),
        });
      } else {
        reset({
          title: "",
          description: "",
          startTime: "",
          endTime: "",
        });
      }
    }
  }, [open, editingAppointment, reset]);

  const onSubmit = (data: CreateAppointmentInput) => {
    setApiError(null);

    const payload = {
      ...data,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
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
      <DialogContent data-testid="appointment-form-modal">
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
                <Input
                  {...register("startTime")}
                  data-testid="appointment-start-input"
                  type="datetime-local"
                />
                {errors.startTime && (
                  <p className="text-sm text-destructive">{errors.startTime.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>End time</Label>
                <Input
                  {...register("endTime")}
                  data-testid="appointment-end-input"
                  type="datetime-local"
                />
                {errors.endTime && (
                  <p className="text-sm text-destructive">{errors.endTime.message}</p>
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

                <Alert>
                  <AlertDescription>
                    Tag and Recurrence assignment will be enabled after the corresponding
                    backend endpoints are available.
                  </AlertDescription>
                </Alert>
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
