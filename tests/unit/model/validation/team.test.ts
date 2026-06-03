import {
  createTeamRequestSchema,
  createTeamInvitationRequestSchema,
  updateTeamRequestSchema,
} from "@/model/team";

describe("Team Model Validation", () => {
  describe("createTeamRequestSchema", () => {
    it("should accept valid team creation request", () => {
      const data = {
        name: "Engineering Team",
        description: "Backend developers",
      };
      const result = createTeamRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject team name that is too long", () => {
      const data = {
        name: "A".repeat(121),
      };
      const result = createTeamRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("<=120 characters");
      }
    });

    it("should reject empty team name", () => {
      const data = {
        name: "",
      };
      const result = createTeamRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("createTeamInvitationRequestSchema", () => {
    it("should accept valid invitation request", () => {
      const data = {
        invitedUserId: "123e4567-e89b-12d3-a456-426614174000",
        role: "MEMBER",
      };
      const result = createTeamInvitationRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid user ID format", () => {
      const data = {
        invitedUserId: "not-a-uuid",
      };
      const result = createTeamInvitationRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("updateTeamRequestSchema", () => {
    it("should allow partial updates", () => {
      const data = {
        description: "New description",
      };
      const result = updateTeamRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
