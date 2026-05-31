import type { TeamRole } from "@/model/team";

export function useTeamRbac(myRole?: TeamRole | null) {
  return {
    canEditTeam: myRole === "OWNER",
    canDeleteTeam: myRole === "OWNER",
    canInviteMember: myRole === "OWNER" || myRole === "ADMIN",
    canChangeRole: (targetRole: TeamRole) => {
      if (myRole === "OWNER") return targetRole !== "OWNER";
      if (myRole === "ADMIN") return targetRole === "MEMBER";
      return false;
    },
    canKickMember: (targetRole: TeamRole) => {
      // Both OWNER and ADMIN can remove members, but ADMIN cannot remove another ADMIN or OWNER
      if (myRole === "OWNER") return targetRole !== "OWNER";
      if (myRole === "ADMIN") return targetRole === "MEMBER";
      return false;
    },
  };
}
