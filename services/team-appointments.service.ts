import { browserApiRequest } from "@/lib/api-client";
import {
  checkTeamAppointmentConflictsRequestSchema,
  checkTeamAppointmentConflictsResponseSchema,
  createTeamAppointmentRequestSchema,
  deleteTeamAppointmentResponseSchema,
  getTeamAppointmentsQuerySchema,
  teamAppointmentListResponseSchema,
  teamAppointmentResponseSchema,
  updateTeamAppointmentRequestSchema,
  type CheckTeamAppointmentConflictsRequest,
  type CheckTeamAppointmentConflictsResponse,
  type CreateTeamAppointmentRequest,
  type DeleteTeamAppointmentResponse,
  type GetTeamAppointmentsQuery,
  type TeamAppointmentListResponse,
  type TeamAppointmentResponse,
  type UpdateTeamAppointmentRequest,
} from "@/model/team-appointments";

export async function createTeamAppointment(
  teamId: string,
  input: CreateTeamAppointmentRequest,
): Promise<TeamAppointmentResponse> {
  const parsedInput = createTeamAppointmentRequestSchema.parse(input);
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}/appointments`, {
    method: "POST",
    body: JSON.stringify(parsedInput),
  });
  return teamAppointmentResponseSchema.parse(rawResponse);
}

export async function getTeamAppointments(
  teamId: string,
  query: GetTeamAppointmentsQuery,
): Promise<TeamAppointmentListResponse> {
  const parsedQuery = getTeamAppointmentsQuerySchema.parse(query);
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}/appointments`, undefined, {
    params: {
      page: parsedQuery.page,
      limit: parsedQuery.limit,
      from: parsedQuery.from,
      to: parsedQuery.to,
    }
  });
  
  return teamAppointmentListResponseSchema.parse(rawResponse);
}

export async function updateTeamAppointment(
  teamId: string,
  appointmentId: string,
  input: UpdateTeamAppointmentRequest,
): Promise<TeamAppointmentResponse> {
  const parsedInput = updateTeamAppointmentRequestSchema.parse(input);
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}/appointments/${appointmentId}`, {
    method: "PATCH",
    body: JSON.stringify(parsedInput),
  });
  return teamAppointmentResponseSchema.parse(rawResponse);
}

export async function deleteTeamAppointment(
  teamId: string,
  appointmentId: string,
): Promise<DeleteTeamAppointmentResponse> {
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}/appointments/${appointmentId}`, {
    method: "DELETE",
  });
  return deleteTeamAppointmentResponseSchema.parse(rawResponse);
}

export async function checkTeamAppointmentConflicts(
  teamId: string,
  input: CheckTeamAppointmentConflictsRequest,
): Promise<CheckTeamAppointmentConflictsResponse> {
  const parsedInput = checkTeamAppointmentConflictsRequestSchema.parse(input);
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}/appointments/check-conflicts`, {
    method: "POST",
    body: JSON.stringify(parsedInput),
  });
  return checkTeamAppointmentConflictsResponseSchema.parse(rawResponse);
}
