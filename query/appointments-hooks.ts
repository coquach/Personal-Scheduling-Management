"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/query/keys";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  updateAppointment,
  updateAppointmentStatus,
  type AppointmentStatus,
} from "@/services/appointments.service";

type MutationCallbacks = {
  onSuccess?: () => void | Promise<void>;
  onError?: (error: unknown) => void;
};

export function useAppointmentsListQuery(input?: { page?: number; limit?: number }) {
  const page = input?.page ?? 1;
  const limit = input?.limit ?? 10;

  return useQuery({
    queryKey: queryKeys.appointments.list({
      page: String(page),
      limit: String(limit),
    }),
    queryFn: () => getAppointments({ page, limit }),
  });
}

export function useCreateAppointmentMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.all,
      });
      await callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}

export function useUpdateAppointmentMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateAppointment>[1];
    }) => updateAppointment(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.all,
      });
      await callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}

export function useDeleteAppointmentMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (seriesId: string) => deleteAppointment(seriesId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.all,
      });
      await callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}

export function useUpdateAppointmentStatusMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      status,
    }: {
      appointmentId: string;
      status: AppointmentStatus;
    }) => updateAppointmentStatus(appointmentId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.all,
      });
      await callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
