import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
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
  CreateTeamRequest,
  GetMyInvitationsQuery,
  GetTeamsQuery,
} from "@/model/validation/team";

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

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTeamRequest) => createTeam(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });
}

export function useInviteMember(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTeamInvitationRequest) => inviteMember(teamId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.members(teamId) });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, invitationId }: { teamId: string; invitationId: string }) =>
      acceptInvitation(teamId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, invitationId }: { teamId: string; invitationId: string }) =>
      declineInvitation(teamId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });
}

export function useChangeMemberRole(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: ChangeMemberRoleRequest }) =>
      changeMemberRole(teamId, userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.members(teamId) });
    },
  });
}

export function useLeaveTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => leaveTeam(teamId),
    onSuccess: (_, teamId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
    },
  });
}
