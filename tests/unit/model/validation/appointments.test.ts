import { describe, expect, it } from "@jest/globals";

import {
  createAppointmentInputSchema,
  updateAppointmentInputSchema,
} from "@/model/validation/appointments";

describe("appointments validation", () => {
  it("rejects create payload when endTime is not after startTime", () => {
    const result = createAppointmentInputSchema.safeParse({
      title: "Broken slot",
      startTime: "2026-05-08T10:00:00.000Z",
      endTime: "2026-05-08T09:00:00.000Z",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "endTime must be greater than startTime",
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

