import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";

const registerNotificationDevice = jest
  .fn<(...args: unknown[]) => Promise<unknown>>();
const getAccessToken = jest.fn<(...args: unknown[]) => string | null>();
const subscribe = jest.fn<(...args: unknown[]) => () => void>();
const getFirebaseMessagingToken = jest
  .fn<(...args: unknown[]) => Promise<string | null>>();
const getRegisteredFcmToken = jest.fn<(...args: unknown[]) => string | null>();
const setRegisteredFcmToken = jest.fn<(...args: unknown[]) => void>();
const clearRegisteredFcmToken = jest.fn<(...args: unknown[]) => void>();
const onForegroundMessage = jest
  .fn<(...args: unknown[]) => Promise<() => void>>();
const toast = jest.fn<(...args: unknown[]) => void>();

jest.mock("@/services/notification.service", () => ({
  registerNotificationDevice: (...args: unknown[]) =>
    registerNotificationDevice(...args),
}));

jest.mock("@/lib/auth-store", () => ({
  getAccessToken: (...args: unknown[]) => getAccessToken(...args),
  subscribe: (...args: unknown[]) => subscribe(...args),
}));

jest.mock("@/lib/firebase-messaging", () => ({
  getFirebaseMessagingToken: (...args: unknown[]) => getFirebaseMessagingToken(...args),
  getRegisteredFcmToken: (...args: unknown[]) => getRegisteredFcmToken(...args),
  setRegisteredFcmToken: (...args: unknown[]) => setRegisteredFcmToken(...args),
  clearRegisteredFcmToken: (...args: unknown[]) => clearRegisteredFcmToken(...args),
  onForegroundMessage: (...args: unknown[]) => onForegroundMessage(...args),
}));

jest.mock("sonner", () => ({
  toast: (...args: unknown[]) => toast(...args),
}));

describe("NotificationBootstrap integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAccessToken.mockReturnValue("test-access-token");
    getFirebaseMessagingToken.mockResolvedValue("test-fcm-token");
    getRegisteredFcmToken.mockReturnValue(null);
    registerNotificationDevice.mockResolvedValue({
      id: "device-1",
      fcmToken: "test-fcm-token",
      deviceName: "Agent",
      platform: "web",
      lastActiveAt: "2026-05-01T10:00:00.000Z",
    });
    subscribe.mockImplementation(() => () => undefined);
    onForegroundMessage.mockImplementation(async (...args: unknown[]) => {
      const callback = args[0] as (payload: unknown) => void;
      callback({
        notification: { title: "Reminder", body: "Upcoming event" },
        data: { deepLink: "/notifications", message: "Upcoming event" },
      });
      return () => undefined;
    });
  });

  it("registers FCM token and handles foreground toast/invalidation", async () => {
    const { NotificationBootstrap } = await import(
      "@/components/notification/NotificationBootstrap"
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    render(
      <QueryClientProvider client={queryClient}>
        <NotificationBootstrap />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(registerNotificationDevice).toHaveBeenCalledWith(
        expect.objectContaining({ fcmToken: "test-fcm-token" }),
      ),
    );

    expect(setRegisteredFcmToken).toHaveBeenCalledWith("test-fcm-token");
    expect(toast).toHaveBeenCalledWith(
      "Reminder",
      expect.objectContaining({ description: "Upcoming event" }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["notifications"],
    });
  });
});
