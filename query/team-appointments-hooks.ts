import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { createInvalidatingMutation, type MutationCallbacks } from "./utils";
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
} from "@/model/team-appointments";

export type { MutationCallbacks };

export function useGetTeamAppointments(teamId: string, query: GetTeamAppointmentsQuery) {
  return useQuery({
    queryKey: queryKeys.teamAppointments.list(teamId, query),
    queryFn: () => getTeamAppointments(teamId, query),
    enabled: !!teamId,
  });
}

export function useCreateTeamAppointment(teamId: string, callbacks?: MutationCallbacks<unknown, Error, CreateTeamAppointmentRequest>) {
  return createInvalidatingMutation(
    (input: CreateTeamAppointmentRequest) => createTeamAppointment(teamId, input),
    [queryKeys.teamAppointments.list(teamId, {})],
    { delayMs: 1000 }
  )(callbacks);
}

export function useUpdateTeamAppointment(teamId: string, callbacks?: MutationCallbacks<unknown, Error, { appointmentId: string; input: UpdateTeamAppointmentRequest }>) {
  return createInvalidatingMutation(
    ({ appointmentId, input }: { appointmentId: string; input: UpdateTeamAppointmentRequest }) =>
      updateTeamAppointment(teamId, appointmentId, input),
    [queryKeys.teamAppointments.list(teamId, {})],
    { delayMs: 1000 }
  )(callbacks);
}

export function useDeleteTeamAppointment(teamId: string, callbacks?: MutationCallbacks<unknown, Error, string>) {
  return createInvalidatingMutation(
    (appointmentId: string) => deleteTeamAppointment(teamId, appointmentId),
    [queryKeys.teamAppointments.list(teamId, {})],
    { delayMs: 1000 }
  )(callbacks);
}

// this one is a pure check, so we just use useMutation directly to avoid invalidating things unnecessarily
export function useCheckTeamAppointmentConflicts(teamId: string) {
  return useMutation({
    mutationFn: (input: CheckTeamAppointmentConflictsRequest) => checkTeamAppointmentConflicts(teamId, input),
  });
}
