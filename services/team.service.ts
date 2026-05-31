import { browserApiRequest } from "@/lib/api-client";
import {
  changeMemberRoleRequestSchema,
  createTeamInvitationRequestSchema,
  createTeamRequestSchema,
  getMyInvitationsQuerySchema,
  getTeamsQuerySchema,
  invitationActionResponseSchema,
  leaveTeamResponseSchema,
  teamDetailResponseSchema,
  teamInvitationResponseSchema,
  teamListResponseSchema,
  teamMemberListResponseSchema,
  teamMemberRoleResponseSchema,
  teamMyInvitationItemSchema,
  teamResponseSchema,
  updateTeamRequestSchema,
  getTeamMembersQuerySchema,
  removeTeamMemberResponseSchema,
  type ChangeMemberRoleRequest,
  type CreateTeamInvitationRequest,
  type CreateTeamRequest,
  type GetMyInvitationsQuery,
  type GetTeamsQuery,
  type InvitationActionResponse,
  type LeaveTeamResponse,
  type TeamDetailResponse,
  type TeamInvitationResponse,
  type TeamListResponse,
  type TeamMemberListResponse,
  type TeamMemberRoleResponse,
  type TeamMyInvitationItem,
  type TeamResponse,
  type UpdateTeamRequest,
  type GetTeamMembersQuery,
  type RemoveTeamMemberResponse,
} from "@/model/team";
import { z } from "zod";

export async function createTeam(input: CreateTeamRequest): Promise<TeamResponse> {
  const parsedInput = createTeamRequestSchema.parse(input);
  const rawResponse = await browserApiRequest<unknown>("/teams", {
    method: "POST",
    body: JSON.stringify(parsedInput),
  });
  return teamResponseSchema.parse(rawResponse);
}

export async function getMyTeams(query: GetTeamsQuery): Promise<TeamListResponse> {
  const parsedQuery = getTeamsQuerySchema.parse(query);
  const rawResponse = await browserApiRequest<unknown>("/teams", undefined, {
    params: {
      page: parsedQuery.page,
      limit: parsedQuery.limit,
      searchText: parsedQuery.searchText,
    }
  });
  
  return teamListResponseSchema.parse(rawResponse);
}

export async function getMyInvitations(query: GetMyInvitationsQuery): Promise<TeamMyInvitationItem[]> {
  const parsedQuery = getMyInvitationsQuerySchema.parse(query);
  const rawResponse = await browserApiRequest<unknown>("/teams/invitations/me", undefined, {
    params: {
      status: parsedQuery.status,
    }
  });
  
  return z.array(teamMyInvitationItemSchema).parse(rawResponse);
}

export async function getTeamDetail(teamId: string): Promise<TeamDetailResponse> {
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}`);
  return teamDetailResponseSchema.parse(rawResponse);
}

export async function getTeamMembers(teamId: string, query?: GetTeamMembersQuery): Promise<TeamMemberListResponse> {
  const parsedQuery = query ? getTeamMembersQuerySchema.parse(query) : { page: 1, limit: 100 };
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}/members`, undefined, {
    params: {
      page: parsedQuery.page,
      limit: parsedQuery.limit,
    }
  });
  return teamMemberListResponseSchema.parse(rawResponse);
}

export async function inviteMember(teamId: string, input: CreateTeamInvitationRequest): Promise<TeamInvitationResponse> {
  const parsedInput = createTeamInvitationRequestSchema.parse(input);
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}/invitations`, {
    method: "POST",
    body: JSON.stringify(parsedInput),
  });
  return teamInvitationResponseSchema.parse(rawResponse);
}

export async function acceptInvitation(teamId: string, invitationId: string): Promise<InvitationActionResponse> {
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}/invitations/${invitationId}/accept`, {
    method: "POST",
  });
  return invitationActionResponseSchema.parse(rawResponse);
}

export async function declineInvitation(teamId: string, invitationId: string): Promise<InvitationActionResponse> {
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}/invitations/${invitationId}/decline`, {
    method: "POST",
  });
  return invitationActionResponseSchema.parse(rawResponse);
}

export async function changeMemberRole(teamId: string, userId: string, input: ChangeMemberRoleRequest): Promise<TeamMemberRoleResponse> {
  const parsedInput = changeMemberRoleRequestSchema.parse(input);
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}/members/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify(parsedInput),
  });
  return teamMemberRoleResponseSchema.parse(rawResponse);
}

export async function leaveTeam(teamId: string): Promise<LeaveTeamResponse> {
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}/leave`, {
    method: "POST",
  });
  return leaveTeamResponseSchema.parse(rawResponse);
}

export async function updateTeam(teamId: string, input: UpdateTeamRequest): Promise<TeamResponse> {
  const parsedInput = updateTeamRequestSchema.parse(input);
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}`, {
    method: "PATCH",
    body: JSON.stringify(parsedInput),
  });
  return teamResponseSchema.parse(rawResponse);
}

export async function removeMember(teamId: string, userId: string): Promise<RemoveTeamMemberResponse> {
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}/members/${userId}`, {
    method: "DELETE",
  });
  return removeTeamMemberResponseSchema.parse(rawResponse);
}

export async function deleteTeam(teamId: string): Promise<{ message: string; data: null }> {
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}`, {
    method: "DELETE",
  });
  return z.object({ message: z.string(), data: z.null() }).parse(rawResponse);
}
