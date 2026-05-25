import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  checkTeamAppointmentConflicts,
  createTeamAppointment,
  deleteTeamAppointment,
  getTeamAppointments,
  updateTeamAppointment,
} from "@/services/team-appointments.service";
import type {
  CheckTeamAppointmentConflictsRequest,
  CreateTeamAppointmentRequest,
  GetTeamAppointmentsQuery,
  UpdateTeamAppointmentRequest,
} from "@/model/validation/team-appointments";

export function useGetTeamAppointments(teamId: string, query: GetTeamAppointmentsQuery) {
  return useQuery({
    queryKey: queryKeys.teamAppointments.list(teamId, query),
    queryFn: () => getTeamAppointments(teamId, query),
    enabled: !!teamId,
  });
}

export function useCreateTeamAppointment(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTeamAppointmentRequest) => createTeamAppointment(teamId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamAppointments.list(teamId, {}) });
    },
  });
}

export function useUpdateTeamAppointment(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, input }: { appointmentId: string; input: UpdateTeamAppointmentRequest }) =>
      updateTeamAppointment(teamId, appointmentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamAppointments.list(teamId, {}) });
    },
  });
}

export function useDeleteTeamAppointment(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => deleteTeamAppointment(teamId, appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamAppointments.list(teamId, {}) });
    },
  });
}

export function useCheckTeamAppointmentConflicts(teamId: string) {
  return useMutation({
    mutationFn: (input: CheckTeamAppointmentConflictsRequest) => checkTeamAppointmentConflicts(teamId, input),
  });
}
