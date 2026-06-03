import {
  createTeamAppointmentRequestSchema,
  checkTeamAppointmentConflictsRequestSchema,
} from "@/model/team-appointments";

describe("Team Appointments Model Validation", () => {
  describe("createTeamAppointmentRequestSchema", () => {
    it("should accept valid team appointment request", () => {
      const futureStart = new Date(Date.now() + 3600 * 1000).toISOString();
      const futureEnd = new Date(Date.now() + 7200 * 1000).toISOString();
      
      const data = {
        title: "Sprint Planning",
        startAt: futureStart,
        endAt: futureEnd,
        participantUserIds: ["123e4567-e89b-12d3-a456-426614174000"],
      };
      const result = createTeamAppointmentRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject start time in the past", () => {
      const pastStart = new Date(Date.now() - 3600 * 1000).toISOString();
      const futureEnd = new Date(Date.now() + 3600 * 1000).toISOString();
      
      const data = {
        title: "Retrospective",
        startAt: pastStart,
        endAt: futureEnd,
      };
      const result = createTeamAppointmentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes("startAt cannot be in the past"))).toBe(true);
      }
    });

    it("should reject end time before start time", () => {
      const futureStart = new Date(Date.now() + 7200 * 1000).toISOString();
      const earlierEnd = new Date(Date.now() + 3600 * 1000).toISOString();
      
      const data = {
        title: "Standup",
        startAt: futureStart,
        endAt: earlierEnd,
      };
      const result = createTeamAppointmentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes("endAt must be greater than startAt"))).toBe(true);
      }
    });
  });

  describe("checkTeamAppointmentConflictsRequestSchema", () => {
    it("should validate correctly with valid uuids", () => {
      const data = {
        startAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        endAt: new Date(Date.now() + 7200 * 1000).toISOString(),
        participantUserIds: ["123e4567-e89b-12d3-a456-426614174000"],
      };
      const result = checkTeamAppointmentConflictsRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should require at least one participant", () => {
      const data = {
        startAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        endAt: new Date(Date.now() + 7200 * 1000).toISOString(),
        participantUserIds: [],
      };
      const result = checkTeamAppointmentConflictsRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
