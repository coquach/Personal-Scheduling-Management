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
} from "@/model/validation/team";
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
  const searchParams = new URLSearchParams();

  if (parsedQuery.page) searchParams.set("page", String(parsedQuery.page));
  if (parsedQuery.limit) searchParams.set("limit", String(parsedQuery.limit));
  if (parsedQuery.searchText) searchParams.set("searchText", parsedQuery.searchText);

  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  const rawResponse = await browserApiRequest<unknown>(`/teams${suffix}`);
  
  return teamListResponseSchema.parse(rawResponse);
}

export async function getMyInvitations(query: GetMyInvitationsQuery): Promise<TeamMyInvitationItem[]> {
  const parsedQuery = getMyInvitationsQuerySchema.parse(query);
  const searchParams = new URLSearchParams();

  if (parsedQuery.status) searchParams.set("status", parsedQuery.status);

  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  const rawResponse = await browserApiRequest<unknown>(`/teams/invitations/me${suffix}`);
  
  return z.array(teamMyInvitationItemSchema).parse(rawResponse);
}

export async function getTeamDetail(teamId: string): Promise<TeamDetailResponse> {
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}`);
  return teamDetailResponseSchema.parse(rawResponse);
}

export async function getTeamMembers(teamId: string): Promise<TeamMemberListResponse> {
  const rawResponse = await browserApiRequest<unknown>(`/teams/${teamId}/members`);
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
