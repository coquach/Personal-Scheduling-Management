import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("notification.service", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("maps readAt to derived status", async () => {
    const browserApiRequest = jest.fn().mockResolvedValueOnce([
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
});

