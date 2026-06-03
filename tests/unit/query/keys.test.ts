import { describe, expect, it } from "@jest/globals";

import { queryKeys } from "@/query/keys";

describe("query keys", () => {
  describe("static keys", () => {
    it("auth.session is a stable array", () => {
      expect(queryKeys.auth.session).toEqual(["auth", "session"]);
    });

    it("profile.detail is a stable array", () => {
      expect(queryKeys.profile.detail).toEqual(["profile", "detail"]);
    });

    it("appointments.all is a stable array", () => {
      expect(queryKeys.appointments.all).toEqual(["appointments"]);
    });

    it("tags.all is a stable array", () => {
      expect(queryKeys.tags.all).toEqual(["tags"]);
    });

    it("reminders.all is a stable array", () => {
      expect(queryKeys.reminders.all).toEqual(["reminders"]);
    });

    it("notifications.all is a stable array", () => {
      expect(queryKeys.notifications.all).toEqual(["notifications"]);
    });

    it("teams.all is a stable array", () => {
      expect(queryKeys.teams.all).toEqual(["teams"]);
    });
  });

  describe("factory keys", () => {
    it("builds appointments list key with filters", () => {
      const key = queryKeys.appointments.list({ page: "2", limit: "20" });
      expect(key).toEqual(["appointments", "list", { page: "2", limit: "20" }]);
    });

    it("builds appointments calendar key with filters", () => {
      const key = queryKeys.appointments.calendar({ month: "2026-06" });
      expect(key).toEqual(["appointments", "calendar", { month: "2026-06" }]);
    });

    it("builds export preview key with optional filters", () => {
      const key = queryKeys.export.preview({
        status: "SCHEDULED",
        from: undefined,
      });
      expect(key).toEqual([
        "export",
        "preview",
        { status: "SCHEDULED", from: undefined },
      ]);
    });

    it("builds statistics summary key with period", () => {
      const key = queryKeys.statistics.summary("weekly");
      expect(key).toEqual(["statistics", "weekly"]);
    });

    it("builds teams list key with filters", () => {
      const key = queryKeys.teams.list({ role: "owner" });
      expect(key).toEqual(["teams", "list", { role: "owner" }]);
    });

    it("builds teams detail key with teamId", () => {
      const key = queryKeys.teams.detail("team-abc");
      expect(key).toEqual(["teams", "detail", "team-abc"]);
    });

    it("builds teams members key with teamId and query", () => {
      const key = queryKeys.teams.members("team-abc", { page: 1 });
      expect(key).toEqual(["teams", "members", "team-abc", { page: 1 }]);
    });

    it("builds teams members key without query (optional)", () => {
      const key = queryKeys.teams.members("team-abc");
      expect(key).toEqual(["teams", "members", "team-abc", undefined]);
    });

    it("builds teams invitations key with filters", () => {
      const key = queryKeys.teams.invitations({ status: "pending" });
      expect(key).toEqual(["teams", "invitations", { status: "pending" }]);
    });

    it("builds teamAppointments list key with teamId and filters", () => {
      const key = queryKeys.teamAppointments.list("team-abc", { page: 1 });
      expect(key).toEqual(["teams", "team-abc", "appointments", { page: 1 }]);
    });
  });
});
