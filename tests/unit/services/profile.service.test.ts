import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("profile.service", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("requests profile detail from /users/me", async () => {
    const browserApiRequest = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValueOnce({
      id: "11111111-1111-4111-8111-111111111111",
      email: "profile@example.com",
      displayName: "Planner",
      timezone: "Asia/Ho_Chi_Minh",
      createdAt: "2026-05-01T10:00:00.000Z",
      updatedAt: "2026-05-01T10:05:00.000Z",
    });

    jest.doMock("@/lib/api-client", () => ({
      browserApiRequest,
    }));

    const { getProfile } = await import("@/services/profile.service");
    const result = await getProfile();

    expect(browserApiRequest).toHaveBeenCalledWith("/users/me");
    expect(result.email).toBe("profile@example.com");
  });

  it("updates profile via PUT /users/me with serialized payload", async () => {
    const browserApiRequest = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValueOnce({
      id: "11111111-1111-4111-8111-111111111111",
      email: "profile@example.com",
      displayName: "Jamie Planner",
      timezone: "Asia/Singapore",
      createdAt: "2026-05-01T10:00:00.000Z",
      updatedAt: "2026-05-01T10:05:00.000Z",
    });

    jest.doMock("@/lib/api-client", () => ({
      browserApiRequest,
    }));

    const { updateProfile } = await import("@/services/profile.service");
    await updateProfile({
      displayName: "Jamie Planner",
      timezone: "Asia/Singapore",
    });

    expect(browserApiRequest).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: JSON.stringify({
        displayName: "Jamie Planner",
        timezone: "Asia/Singapore",
      }),
    });
  });
});
