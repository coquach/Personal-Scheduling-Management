import { describe, expect, it } from "@jest/globals";

import {
  createAppointmentInputSchema,
  updateAppointmentInputSchema,
} from "@/model/appointments";

describe("appointments validation", () => {
  it("rejects create payload when endAt is not after startAt", () => {
    const result = createAppointmentInputSchema.safeParse({
      title: "Broken slot",
      startAt: "2026-05-08T10:00:00.000Z",
      endAt: "2026-05-08T09:00:00.000Z",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "endAt must be greater than startAt",
      );
    }
  });

  it("accepts partial update payload with only title", () => {
    const result = updateAppointmentInputSchema.safeParse({
      title: "Updated title",
    });

    expect(result.success).toBe(true);
  });
});

