"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/query/keys";
import { createInvalidatingMutation, type MutationCallbacks } from "@/query/utils";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  getAppointmentSeries,
  updateAppointment,
  updateAppointmentStatus,
  type AppointmentStatus,
} from "@/services/appointments.service";

export type { MutationCallbacks };

export function useAppointmentsListQuery(input?: { page?: number; limit?: number; fromDate?: string; toDate?: string; seriesId?: string }) {
  const page = input?.page ?? 1;
  const limit = input?.limit ?? 10;
  const fromDate = input?.fromDate;
  const toDate = input?.toDate;
  const seriesId = input?.seriesId;

  return useQuery({
    queryKey: [...queryKeys.appointments.list({
      page: String(page),
      limit: String(limit),
      seriesId
    }), fromDate, toDate, seriesId],
    queryFn: () => getAppointments({ page, limit, fromDate, toDate, seriesId }),
  });
}

export function useAppointmentSeriesListQuery(input?: { page?: number; limit?: number; recurrenceType?: "ONETIME" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" }) {
  const page = input?.page ?? 1;
  const limit = input?.limit ?? 10;
  const recurrenceType = input?.recurrenceType;

  return useQuery({
    queryKey: [...queryKeys.appointments.list({
      page: String(page),
      limit: String(limit),
    }), "series", recurrenceType],
    queryFn: () => getAppointmentSeries({ page, limit, recurrenceType }),
  });
}

export const useCreateAppointmentMutation = createInvalidatingMutation(
  createAppointment,
  [queryKeys.appointments.all],
  { delayMs: 1000 }
);

export const useUpdateAppointmentMutation = createInvalidatingMutation(
  ({ id, payload }: { id: string; payload: Parameters<typeof updateAppointment>[1] }) =>
    updateAppointment(id, payload),
  [queryKeys.appointments.all],
  { delayMs: 1000 }
);

export const useDeleteAppointmentMutation = createInvalidatingMutation(
  (seriesId: string) => deleteAppointment(seriesId),
  [queryKeys.appointments.all],
  { delayMs: 1000 }
);

export const useUpdateAppointmentStatusMutation = createInvalidatingMutation(
  ({ appointmentId, status }: { appointmentId: string; status: AppointmentStatus }) =>
    updateAppointmentStatus(appointmentId, status),
  [queryKeys.appointments.all],
  { delayMs: 1000 }
);



