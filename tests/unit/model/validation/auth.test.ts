import { describe, expect, it } from "@jest/globals";

import {
  registerFormSchema,
  resetPasswordFormSchema,
} from "@/model/validation/auth";

describe("auth validation", () => {
  it("rejects mismatched password confirmation for registration", () => {
    const result = registerFormSchema.safeParse({
      displayName: "Jane Planner",
      email: "jane@example.com",
      password: "Password123",
      confirmPassword: "Password999",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "Password confirmation does not match",
      );
    }
  });

  it("accepts valid reset password form payload", () => {
    const result = resetPasswordFormSchema.safeParse({
      password: "NewPassword123",
      confirmPassword: "NewPassword123",
    });

    expect(result.success).toBe(true);
  });
});

