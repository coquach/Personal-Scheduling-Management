import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("notification.service", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("maps readAt to derived status", async () => {
    const browserApiRequest = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValueOnce([
      {
        id: "11111111-1111-4111-8111-111111111111",
        userId: "22222222-2222-4222-8222-222222222222",
        appointmentId: null,
        reminderId: null,
        type: "SYSTEM",
        message: "Unread item",
        triggeredAt: null,
        createdAt: "2026-05-01T10:00:00.000Z",
        readAt: null,
      },
      {
        id: "33333333-3333-4333-8333-333333333333",
        userId: "22222222-2222-4222-8222-222222222222",
        appointmentId: null,
        reminderId: null,
        type: "REMINDER",
        message: "Read item",
        triggeredAt: "2026-05-01T09:00:00.000Z",
        createdAt: "2026-05-01T09:00:00.000Z",
        readAt: "2026-05-01T09:30:00.000Z",
      },
    ]);

    jest.doMock("@/lib/api-client", () => ({
      browserApiRequest,
    }));

    const { getNotifications } = await import("@/services/notification.service");
    const result = await getNotifications();

    expect(result).toHaveLength(2);
    expect(result[0].status).toBe("UNREAD");
    expect(result[1].status).toBe("READ");
  });

  it("marks a notification as read via PATCH endpoint", async () => {
    const browserApiRequest = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValueOnce({
      id: "11111111-1111-4111-8111-111111111111",
      userId: "22222222-2222-4222-8222-222222222222",
      appointmentId: null,
      reminderId: null,
      type: "SYSTEM",
      message: "Marked as read",
      triggeredAt: null,
      createdAt: "2026-05-01T10:00:00.000Z",
      readAt: "2026-05-01T10:30:00.000Z",
    });

    jest.doMock("@/lib/api-client", () => ({
      browserApiRequest,
    }));

    const { markNotificationRead } = await import("@/services/notification.service");
    const result = await markNotificationRead(
      "11111111-1111-4111-8111-111111111111",
    );

    expect(browserApiRequest).toHaveBeenCalledWith(
      "/users/me/notifications/11111111-1111-4111-8111-111111111111",
      { method: "PATCH" },
    );
    expect(result.status).toBe("READ");
  });

  it("marks all notifications as read", async () => {
    const browserApiRequest = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValueOnce({ count: 3 });

    jest.doMock("@/lib/api-client", () => ({
      browserApiRequest,
    }));

    const { markAllNotificationsRead } = await import(
      "@/services/notification.service"
    );
    const result = await markAllNotificationsRead();

    expect(browserApiRequest).toHaveBeenCalledWith("/users/me/notifications/all", {
      method: "PATCH",
    });
    expect(result.count).toBe(3);
  });

  it("registers, lists and unregisters devices", async () => {
    const browserApiRequest = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValueOnce({
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        fcmToken: "fcm-token",
        deviceName: "My Laptop",
        platform: "web",
        lastActiveAt: "2026-05-01T10:00:00.000Z",
      })
      .mockResolvedValueOnce([
        {
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          fcmToken: "fcm-token",
          deviceName: "My Laptop",
          platform: "web",
          lastActiveAt: "2026-05-01T10:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce({
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        fcmToken: "fcm-token",
        deviceName: "My Laptop",
        platform: "web",
        lastActiveAt: "2026-05-01T10:00:00.000Z",
      });

    jest.doMock("@/lib/api-client", () => ({
      browserApiRequest,
    }));

    const {
      registerNotificationDevice,
      listNotificationDevices,
      unregisterNotificationDevice,
    } = await import("@/services/notification.service");

    await registerNotificationDevice({
      fcmToken: "fcm-token",
      deviceName: "My Laptop",
      platform: "web",
    });
    const devices = await listNotificationDevices();
    await unregisterNotificationDevice("fcm-token");

    expect(browserApiRequest).toHaveBeenNthCalledWith(
      1,
      "/users/devices",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(browserApiRequest).toHaveBeenNthCalledWith(2, "/users/devices");
    expect(browserApiRequest).toHaveBeenNthCalledWith(
      3,
      "/users/devices",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
    expect(devices).toHaveLength(1);
  });
});
