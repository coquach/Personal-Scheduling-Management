import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("auth.service", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("unwraps envelope response for login", async () => {
    const post = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValueOnce({
      data: {
        success: true,
        message: "OK",
        data: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
          tokenType: "Bearer",
          expiresIn: 3600,
          user: {
            id: "11111111-1111-4111-8111-111111111111",
            email: "user@example.com",
            displayName: "User",
            roles: ["USER"],
          },
        },
      },
    });

    jest.doMock("@/lib/api-core", () => ({
      backendApi: { post, get: jest.fn() },
      toBackendApiError: jest.fn((error) => error),
    }));

    const { login } = await import("@/services/auth.service");
    const result = await login({
      email: "user@example.com",
      password: "Password123",
    });

    expect(post).toHaveBeenCalledWith("/auth/login", {
      email: "user@example.com",
      password: "Password123",
    });
    expect(result.accessToken).toBe("access-token");
    expect(result.user.email).toBe("user@example.com");
  });

  it("maps getCurrentUser and defaults roles to empty array", async () => {
    const get = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValueOnce({
      data: {
        id: "22222222-2222-4222-8222-222222222222",
        email: "profile@example.com",
        displayName: "Profile User",
      },
    });

    jest.doMock("@/lib/api-core", () => ({
      backendApi: { post: jest.fn(), get },
      toBackendApiError: jest.fn((error) => error),
    }));

    const { getCurrentUser } = await import("@/services/auth.service");
    const result = await getCurrentUser("test-access-token");

    expect(get).toHaveBeenCalledWith("/users/me", {
      headers: {
        Authorization: "Bearer test-access-token",
      },
    });
    expect(result).toEqual({
      id: "22222222-2222-4222-8222-222222222222",
      email: "profile@example.com",
      displayName: "Profile User",
      roles: [],
    });
  });

  it("uses fallback message when logout call fails", async () => {
    const transportError = new Error("transport failure");
    const post = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockRejectedValueOnce(transportError);
    const toBackendApiError = jest
      .fn()
      .mockImplementation((_error, fallback) => new Error(String(fallback)));

    jest.doMock("@/lib/api-core", () => ({
      backendApi: { post, get: jest.fn() },
      toBackendApiError,
    }));

    const { logout } = await import("@/services/auth.service");

    await expect(
      logout({ refreshToken: "refresh-token" }),
    ).rejects.toThrow("Unable to sign out cleanly.");

    expect(toBackendApiError).toHaveBeenCalled();
  });
});
