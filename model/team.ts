import { z } from "zod";

// --- Enums ---
export const teamRoleSchema = z.enum(["OWNER", "ADMIN", "MEMBER"]);
export const membershipStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);
export const invitationStatusSchema = z.enum(["PENDING", "ACCEPTED", "DECLINED", "EXPIRED"]);

export type TeamRole = z.infer<typeof teamRoleSchema>;
export type MembershipStatus = z.infer<typeof membershipStatusSchema>;
export type InvitationStatus = z.infer<typeof invitationStatusSchema>;

// --- Responses ---
export const teamResponseSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()),
});

export const teamDetailResponseSchema = teamResponseSchema.extend({
  myRole: teamRoleSchema,
  memberCount: z.number(),
});

export const teamListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role: teamRoleSchema,
  memberCount: z.number(),
});

export const teamListResponseSchema = z.object({
  items: z.array(teamListItemSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
});

export const teamMemberItemSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string().nullable(),
  email: z.string().email(),
  role: teamRoleSchema,
  status: membershipStatusSchema,
  joinedAt: z.string().datetime().or(z.date()),
});

export const teamMemberListResponseSchema = z.object({
  items: z.array(teamMemberItemSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
});

export const teamInvitationResponseSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  invitedUserId: z.string().uuid(),
  invitedById: z.string().uuid(),
  role: teamRoleSchema,
  status: invitationStatusSchema,
  createdAt: z.string().datetime().or(z.date()),
  expiresAt: z.string().datetime().or(z.date()).nullable(),
});

export const teamMyInvitationItemSchema = z.object({
  invitationId: z.string().uuid(),
  teamId: z.string().uuid(),
  teamName: z.string(),
  role: teamRoleSchema,
  status: invitationStatusSchema,
  invitedAt: z.string().datetime().or(z.date()),
  expiresAt: z.string().datetime().or(z.date()).nullable(),
});

export const invitationActionResponseSchema = z.null();

export const leaveTeamResponseSchema = z.null();

export const removeTeamMemberResponseSchema = z.null();

export const teamMemberRoleResponseSchema = z.object({
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
  role: teamRoleSchema,
  updatedById: z.string().uuid(),
  updatedAt: z.string().datetime().or(z.date()),
});

// --- Requests ---
export const createTeamRequestSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
});

export const getTeamsQuerySchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  searchText: z.string().max(120).optional(),
});

export const getMyInvitationsQuerySchema = z.object({
  status: invitationStatusSchema.optional(),
});

export const createTeamInvitationRequestSchema = z.object({
  invitedUserId: z.string().uuid(),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
  expiresAt: z.string().datetime().or(z.date()).optional(),
});

export const changeMemberRoleRequestSchema = z.object({
  role: teamRoleSchema,
});

export const updateTeamRequestSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).optional(),
});

export const getTeamMembersQuerySchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// --- Types ---
export type TeamResponse = z.infer<typeof teamResponseSchema>;
export type TeamDetailResponse = z.infer<typeof teamDetailResponseSchema>;
export type TeamListItem = z.infer<typeof teamListItemSchema>;
export type TeamListResponse = z.infer<typeof teamListResponseSchema>;
export type TeamMemberItem = z.infer<typeof teamMemberItemSchema>;
export type TeamMemberListResponse = z.infer<typeof teamMemberListResponseSchema>;
export type TeamInvitationResponse = z.infer<typeof teamInvitationResponseSchema>;
export type TeamMyInvitationItem = z.infer<typeof teamMyInvitationItemSchema>;
export type InvitationActionResponse = z.infer<typeof invitationActionResponseSchema>;
export type LeaveTeamResponse = z.infer<typeof leaveTeamResponseSchema>;
export type TeamMemberRoleResponse = z.infer<typeof teamMemberRoleResponseSchema>;
export type RemoveTeamMemberResponse = z.infer<typeof removeTeamMemberResponseSchema>;

export type CreateTeamRequest = z.infer<typeof createTeamRequestSchema>;
export type GetTeamsQuery = z.infer<typeof getTeamsQuerySchema>;
export type GetMyInvitationsQuery = z.infer<typeof getMyInvitationsQuerySchema>;
export type CreateTeamInvitationRequest = z.infer<typeof createTeamInvitationRequestSchema>;
export type ChangeMemberRoleRequest = z.infer<typeof changeMemberRoleRequestSchema>;
export type UpdateTeamRequest = z.infer<typeof updateTeamRequestSchema>;
export type GetTeamMembersQuery = z.infer<typeof getTeamMembersQuerySchema>;
