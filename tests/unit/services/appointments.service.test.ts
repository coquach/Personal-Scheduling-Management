import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("appointments.service", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("maps backend appointment dto to frontend shape", async () => {
    const browserApiRequest = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValueOnce({
      items: [
        {
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          userId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          seriesId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          title: "Team Standup",
          description: "Weekly sync",
          startAt: "2026-05-05T09:00:00.000Z",
          endAt: "2026-05-05T09:30:00.000Z",
          isRecurringInstance: false,
          status: "SCHEDULED",
          jobId: null,
          tags: [],
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
    });

    jest.doMock("@/lib/api-client", () => ({
      browserApiRequest,
    }));

    const { getAppointments } = await import("@/services/appointments.service");
    const result = await getAppointments({ page: 1, limit: 10 });

    expect(browserApiRequest).toHaveBeenCalledWith("/appointments?page=1&limit=10");
    expect(result.items[0]).toMatchObject({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      userId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      seriesId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      title: "Team Standup",
      startTime: "2026-05-05T09:00:00.000Z",
      endTime: "2026-05-05T09:30:00.000Z",
      status: "SCHEDULED",
    });
  });

  it("creates appointment via /series with transformed payload", async () => {
    const browserApiRequest = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValueOnce({ id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd" });

    jest.doMock("@/lib/api-client", () => ({
      browserApiRequest,
    }));

    const { createAppointment } = await import("@/services/appointments.service");
    await createAppointment({
      title: "Roadmap Review",
      startTime: "2026-05-08T02:00:00.000Z",
      endTime: "2026-05-08T03:00:00.000Z",
    });

    expect(browserApiRequest).toHaveBeenCalledTimes(1);
    const [path, requestInit] = browserApiRequest.mock.calls[0] as [
      string,
      { method: string; body: string },
    ];
    expect(path).toBe("/series");
    expect(requestInit).toMatchObject({
      method: "POST",
    });
    expect(requestInit.body).toContain(
      '"recurrenceType":"ONETIME"',
    );
  });

  it("uses default list params when not provided", async () => {
    const browserApiRequest = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValueOnce({
      items: [],
      page: 1,
      limit: 10,
      total: 0,
    });

    jest.doMock("@/lib/api-client", () => ({
      browserApiRequest,
    }));

    const { getAppointments } = await import("@/services/appointments.service");
    await getAppointments({});

    expect(browserApiRequest).toHaveBeenCalledWith("/appointments");
  });

  it("updates appointment via PATCH /series/:id with transformed fields", async () => {
    const browserApiRequest = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValueOnce({ id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc" });

    jest.doMock("@/lib/api-client", () => ({
      browserApiRequest,
    }));

    const { updateAppointment } = await import("@/services/appointments.service");
    await updateAppointment("cccccccc-cccc-4ccc-8ccc-cccccccccccc", {
      title: "Updated",
      startTime: "2026-05-08T03:00:00.000Z",
      endTime: "2026-05-08T04:00:00.000Z",
    });

    expect(browserApiRequest).toHaveBeenCalledWith(
      "/series/cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      expect.objectContaining({
        method: "PATCH",
      }),
    );
    const [, requestInit] = browserApiRequest.mock.calls[0] as [
      string,
      { method: string; body: string },
    ];
    expect(requestInit.body).toContain('"startAt"');
    expect(requestInit.body).toContain('"endAt"');
  });

  it("deletes appointment series with explicit scope", async () => {
    const browserApiRequest = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValueOnce({ message: "Appointment series deleted successfully." });

    jest.doMock("@/lib/api-client", () => ({
      browserApiRequest,
    }));

    const { deleteAppointment } = await import("@/services/appointments.service");
    const result = await deleteAppointment(
      "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      "single",
    );

    expect(browserApiRequest).toHaveBeenCalledWith(
      "/series/cccccccc-cccc-4ccc-8ccc-cccccccccccc?scope=single",
      { method: "DELETE" },
    );
    expect(result.message).toContain("deleted");
  });

  it("updates appointment status via PATCH endpoint", async () => {
    const browserApiRequest = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValueOnce({});

    jest.doMock("@/lib/api-client", () => ({
      browserApiRequest,
    }));

    const { updateAppointmentStatus } = await import(
      "@/services/appointments.service"
    );
    await updateAppointmentStatus(
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      "COMPLETED",
    );

    expect(browserApiRequest).toHaveBeenCalledWith(
      "/appointments/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/status",
      expect.objectContaining({
        method: "PATCH",
      }),
    );
    const [, requestInit] = browserApiRequest.mock.calls[0] as [
      string,
      { method: string; body: string },
    ];
    expect(requestInit.body).toContain('"COMPLETED"');
  });
});
