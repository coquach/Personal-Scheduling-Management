"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/query/keys";
import { createInvalidatingMutation, type MutationCallbacks } from "@/query/utils";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  updateAppointment,
  updateAppointmentStatus,
  type AppointmentStatus,
} from "@/services/appointments.service";

export type { MutationCallbacks };

export function useAppointmentsListQuery(input?: { page?: number; limit?: number; fromDate?: string; toDate?: string }) {
  const page = input?.page ?? 1;
  const limit = input?.limit ?? 10;
  const fromDate = input?.fromDate;
  const toDate = input?.toDate;

  return useQuery({
    queryKey: [...queryKeys.appointments.list({
      page: String(page),
      limit: String(limit),
    }), fromDate, toDate],
    queryFn: () => getAppointments({ page, limit, fromDate, toDate }),
  });
}

export const useCreateAppointmentMutation = createInvalidatingMutation(
  createAppointment,
  [queryKeys.appointments.all]
);

export const useUpdateAppointmentMutation = createInvalidatingMutation(
  ({ id, payload }: { id: string; payload: Parameters<typeof updateAppointment>[1] }) =>
    updateAppointment(id, payload),
  [queryKeys.appointments.all]
);

export const useDeleteAppointmentMutation = createInvalidatingMutation(
  (seriesId: string) => deleteAppointment(seriesId),
  [queryKeys.appointments.all]
);

export const useUpdateAppointmentStatusMutation = createInvalidatingMutation(
  ({ appointmentId, status }: { appointmentId: string; status: AppointmentStatus }) =>
    updateAppointmentStatus(appointmentId, status),
  [queryKeys.appointments.all]
);
