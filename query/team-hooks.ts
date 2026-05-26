import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { createInvalidatingMutation, type MutationCallbacks } from "./utils";
import {
  acceptInvitation,
  changeMemberRole,
  createTeam,
  declineInvitation,
  getMyInvitations,
  getMyTeams,
  getTeamDetail,
  getTeamMembers,
  inviteMember,
  leaveTeam,
} from "@/services/team.service";
import type {
  ChangeMemberRoleRequest,
  CreateTeamInvitationRequest,
  GetMyInvitationsQuery,
  GetTeamsQuery,
} from "@/model/team";

export type { MutationCallbacks };

export function useGetTeams(query: GetTeamsQuery) {
  return useQuery({
    queryKey: queryKeys.teams.list(query),
    queryFn: () => getMyTeams(query),
  });
}

export function useGetTeamDetail(teamId: string) {
  return useQuery({
    queryKey: queryKeys.teams.detail(teamId),
    queryFn: () => getTeamDetail(teamId),
    enabled: !!teamId,
  });
}

export function useGetTeamMembers(teamId: string) {
  return useQuery({
    queryKey: queryKeys.teams.members(teamId),
    queryFn: () => getTeamMembers(teamId),
    enabled: !!teamId,
  });
}

export function useGetMyInvitations(query: GetMyInvitationsQuery) {
  return useQuery({
    queryKey: queryKeys.teams.invitations(query),
    queryFn: () => getMyInvitations(query),
  });
}

export const useCreateTeam = createInvalidatingMutation(
  createTeam,
  [queryKeys.teams.all]
);

export function useInviteMember(teamId: string) {
  return createInvalidatingMutation(
    (input: CreateTeamInvitationRequest) => inviteMember(teamId, input),
    [queryKeys.teams.members(teamId)]
  )();
}

export const useAcceptInvitation = createInvalidatingMutation(
  ({ teamId, invitationId }: { teamId: string; invitationId: string }) =>
    acceptInvitation(teamId, invitationId),
  [queryKeys.teams.all]
);

export const useDeclineInvitation = createInvalidatingMutation(
  ({ teamId, invitationId }: { teamId: string; invitationId: string }) =>
    declineInvitation(teamId, invitationId),
  [queryKeys.teams.all]
);

export function useChangeMemberRole(teamId: string) {
  return createInvalidatingMutation(
    ({ userId, input }: { userId: string; input: ChangeMemberRoleRequest }) =>
      changeMemberRole(teamId, userId, input),
    [queryKeys.teams.members(teamId)]
  )();
}

export const useLeaveTeam = createInvalidatingMutation(
  (teamId: string) => leaveTeam(teamId),
  (data, teamId) => [queryKeys.teams.all, queryKeys.teams.detail(teamId)]
);
