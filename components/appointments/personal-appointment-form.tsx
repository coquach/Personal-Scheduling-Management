'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTagsQuery } from '@/query/tags-hooks';

import {
  createAppointmentInputSchema,
  type CreateAppointmentInput,
} from '@/model/appointments';
import {
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  useUpdateAppointmentStatusMutation,
} from '@/query/appointments-hooks';
import {
  type Appointment,
  type AppointmentStatus,
} from '@/services/appointments.service';
import { Trash2Icon } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/api-core';
import { toast } from 'sonner';

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

interface PersonalAppointmentFormProps {
  onOpenChange: (open: boolean) => void;
  editingAppointment: Appointment | null;
  initialDate?: string | null;
}

export function PersonalAppointmentForm({
  onOpenChange,
  editingAppointment,
  initialDate,
}: PersonalAppointmentFormProps) {
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const createMutation = useCreateAppointmentMutation({
    onSuccess: () => {
      toast.success('Appointment created successfully.');
      onOpenChange(false);
    },
  });

  const updateMutation = useUpdateAppointmentMutation({
    onSuccess: () => {
      toast.success('Appointment updated successfully.');
      onOpenChange(false);
    },
  });



  const deleteMutation = useDeleteAppointmentMutation({
    onSuccess: () => {
      toast.success('Appointment deleted successfully.');
      onOpenChange(false);
    },
  });

  const updateStatusMutation = useUpdateAppointmentStatusMutation({
    onSuccess: () => {
      toast.success('Status updated successfully.');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateAppointmentInput>({
    resolver: zodResolver(createAppointmentInputSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      title: '',
      description: '',
      startAt: '',
      endAt: '',
      recurrenceType: 'ONETIME',
      tagIds: [],
    },
  });

  const selectedTagIds = useWatch({ control, name: 'tagIds' }) || [];
  const selectedRecurrence = useWatch({ control, name: 'recurrenceType' });

  const tagsQuery = useTagsQuery();

  useEffect(() => {
    if (editingAppointment) {
      reset({
        title: editingAppointment.title,
        description: editingAppointment.description ?? '',
        startAt: toDateTimeLocalValue(editingAppointment.startAt as string),
        endAt: toDateTimeLocalValue(editingAppointment.endAt as string),
        recurrenceType: (editingAppointment as Appointment & { recurrenceType?: string }).recurrenceType || 'ONETIME',
        weeklyDay: (editingAppointment as Appointment & { weeklyDay?: string[] }).weeklyDay || [],
        monthlyDay: (editingAppointment as Appointment & { monthlyDay?: number }).monthlyDay || null,
        yearlyDay: (editingAppointment as Appointment & { yearlyDay?: number }).yearlyDay || null,
        yearlyMonth: (editingAppointment as Appointment & { yearlyMonth?: number }).yearlyMonth || null,
        tagIds: editingAppointment.tags?.map((t: { id: string }) => t.id) || [],
      });
    } else if (initialDate) {
      const baseDate = initialDate.slice(0, 10);
      reset({
        title: '',
        description: '',
        startAt: `${baseDate}T09:00`,
        endAt: `${baseDate}T10:00`,
        recurrenceType: 'ONETIME',
        tagIds: [],
      });
    } else {
      reset({
        title: '',
        description: '',
        startAt: '',
        endAt: '',
        recurrenceType: 'ONETIME',
        tagIds: [],
      });
    }
  }, [editingAppointment, initialDate, reset]);

  // Reset recurrence fields when recurrenceType changes
  useEffect(() => {
    switch (selectedRecurrence) {
      case 'ONETIME':
      case 'DAILY':
        setValue('weeklyDay', undefined);
        setValue('monthlyDay', undefined);
        setValue('yearlyDay', undefined);
        setValue('yearlyMonth', undefined);
        break;
      case 'WEEKLY':
        setValue('monthlyDay', undefined);
        setValue('yearlyDay', undefined);
        setValue('yearlyMonth', undefined);
        break;
      case 'MONTHLY':
        setValue('weeklyDay', undefined);
        setValue('yearlyDay', undefined);
        setValue('yearlyMonth', undefined);
        break;
      case 'YEARLY':
        setValue('weeklyDay', undefined);
        setValue('monthlyDay', undefined);
        break;
    }
  }, [selectedRecurrence, setValue]);

  const onSubmit = (data: CreateAppointmentInput) => {
    const startAtDate = new Date(data.startAt);
    const startAt = startAtDate.toISOString();
    const endAtDate = new Date(data.endAt);
    const endAt = endAtDate.toISOString();

    const effectiveEndDate = new Date(endAtDate.getTime() - 1);
    if (
      startAtDate.getFullYear() !== effectiveEndDate.getFullYear() ||
      startAtDate.getMonth() !== effectiveEndDate.getMonth() ||
      startAtDate.getDate() !== effectiveEndDate.getDate()
    ) {
      toast.error('Appointments cannot span across multiple calendar days');
      return;
    }

    const payload = { ...data, startAt, endAt };

    // Auto-populate recurrence fields based on startAt if they are missing from the form
    if (payload.recurrenceType === 'WEEKLY' && (!payload.weeklyDay || payload.weeklyDay.length === 0)) {
      const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
      payload.weeklyDay = [weekdays[startAtDate.getDay()]];
    }
    if (payload.recurrenceType === 'MONTHLY' && payload.monthlyDay == null) {
      payload.monthlyDay = startAtDate.getDate();
    }
    if (payload.recurrenceType === 'YEARLY' && (payload.yearlyDay == null || payload.yearlyMonth == null)) {
      payload.yearlyDay = startAtDate.getDate();
      payload.yearlyMonth = startAtDate.getMonth() + 1; // 1-12
    }

    if (editingAppointment) {
      if (!editingAppointment.seriesId) {
        toast.error(
          'This appointment cannot be edited because seriesId is missing.',
        );
        return;
      }
      updateMutation.mutate({
        id: editingAppointment.seriesId || editingAppointment.id,
        payload: payload,
      });
      return;
    }

    createMutation.mutate(payload);
  };

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending;

  const APPOINTMENT_STATUS_ORDER: AppointmentStatus[] = [
    'SCHEDULED',
    'COMPLETED',
    'MISSED',
    'CANCELLED',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
      <div className="grid gap-4 py-4">
        {editingAppointment && (
          <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/50">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Status</Label>
              <p className="text-xs text-muted-foreground">
                Update the current status
              </p>
            </div>
            <Select
              value={editingAppointment.status}
              onValueChange={(val) => {
                updateStatusMutation.mutate({
                  appointmentId: editingAppointment.id,
                  status: val as AppointmentStatus,
                });
              }}
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_STATUS_ORDER.map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                    className="text-xs font-medium"
                    disabled={editingAppointment.status === s}
                  >
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1">
          <Input
            {...register('title')}
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
                  data-testid="appointment-start-input"
                />
              )}
            />
            {errors.startAt && (
              <p className="text-sm text-destructive">
                {errors.startAt.message}
              </p>
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
                  data-testid="appointment-end-input"
                />
              )}
            />
            {errors.endAt && (
              <p className="text-sm text-destructive">{errors.endAt.message}</p>
            )}
          </div>
        </div>

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
          {isMoreOptionsOpen ? 'Hide options' : 'More options'}
        </button>

        {/* Progressive Disclosure Content */}
        {isMoreOptionsOpen && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                {...register('description')}
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
                onValueChange={(val: any) => setValue('recurrenceType', val)} // eslint-disable-line @typescript-eslint/no-explicit-any
              >
                <SelectTrigger data-testid="appointment-recurrence-toggle">
                  <SelectValue placeholder="Select recurrence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONETIME" data-testid="appointment-recurrence-pattern">None (One-time)</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              {tagsQuery.isLoading && (
                <p className="text-xs text-muted-foreground">Loading tags...</p>
              )}
              {!tagsQuery.isLoading &&
              tagsQuery.data &&
              tagsQuery.data.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tagsQuery.data.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    const tagColor = tag.color || 'var(--primary)';
                    return (
                      <Badge
                        key={tag.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer transition-colors"
                        onClick={() => {
                          const newTags = isSelected
                            ? selectedTagIds.filter((id) => id !== tag.id)
                            : [...selectedTagIds, tag.id];
                          setValue('tagIds', newTags);
                        }}
                        style={{
                          backgroundColor: isSelected
                            ? tagColor
                            : 'transparent',
                          borderColor: tagColor,
                          color: isSelected ? '#fff' : tagColor,
                        }}
                      >
                        {tag.name}
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                !tagsQuery.isLoading && (
                  <p className="text-xs text-muted-foreground">
                    No tags available.
                  </p>
                )
              )}
            </div>
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
              if (
                confirm('Are you sure you want to delete this appointment?')
              ) {
                if (editingAppointment.seriesId) {
                  deleteMutation.mutate(editingAppointment.seriesId);
                } else {
                  toast.error('Missing seriesId');
                }
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
            data-testid="appointment-save"
            isLoading={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save appointment'}
          </Button>
        </div>
      </div>
    </form>
  );
}
