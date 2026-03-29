import type { Page, Route } from "@playwright/test";

export type PsmsApiMockPayload = {
  notifications: Array<{ id: string; message: string; status: string }>;
  appointments: Array<{
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  profile: {
    id: string;
    displayName: string;
    email: string;
    timezone: string;
    createdAt: string;
    updatedAt: string;
  };
};

const now = new Date("2026-03-29T10:00:00.000Z").toISOString();

const defaultPayload: PsmsApiMockPayload = {
  notifications: [
    { id: "notif-1", message: "Team Standup in 10 minutes", status: "UNREAD" },
  ],
  appointments: [
    {
      id: "appt-1",
      title: "Team Standup",
      description: "Weekly product sync",
      startTime: "2026-03-29T09:00:00.000Z",
      endTime: "2026-03-29T09:30:00.000Z",
      status: "SCHEDULED",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "appt-2",
      title: "Doctor Appointment",
      description: "Routine check-up",
      startTime: "2026-03-30T11:30:00.000Z",
      endTime: "2026-03-30T12:15:00.000Z",
      status: "SCHEDULED",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "appt-3",
      title: "Study Session",
      description: "System design review",
      startTime: "2026-03-31T19:00:00.000Z",
      endTime: "2026-03-31T20:30:00.000Z",
      status: "COMPLETED",
      createdAt: now,
      updatedAt: now,
    },
  ],
  profile: {
    id: "user-1",
    displayName: "John Doe",
    email: "john.doe@example.com",
    timezone: "Asia/Ho_Chi_Minh",
    createdAt: now,
    updatedAt: now,
  },
};

async function fulfillJson(route: Route, payload: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

function successEnvelope<T>(data: T, message = "OK") {
  return {
    success: true,
    message,
    data,
  };
}

function failureEnvelope(message: string) {
  return {
    success: false,
    message,
    data: null,
  };
}

export async function mockPsmsApi(
  page: Page,
  overrides: Partial<PsmsApiMockPayload> = {},
) {
  const payload = {
    ...defaultPayload,
    ...overrides,
  };

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname.endsWith("/auth/login")) {
      await fulfillJson(
        route,
        successEnvelope({
          accessToken: "test-access-token",
          refreshToken: "test-refresh-token",
          tokenType: "Bearer",
          expiresIn: 3600,
        }),
      );
      return;
    }

    if (url.pathname.endsWith("/auth/register")) {
      await fulfillJson(
        route,
        successEnvelope({
          id: "user-1",
          email: "jane@example.com",
          displayName: "Jane Planner",
          createdAt: now,
        }),
      );
      return;
    }

    if (url.pathname.endsWith("/auth/refresh")) {
      await fulfillJson(
        route,
        successEnvelope({
          accessToken: "refreshed-access-token",
          refreshToken: "refreshed-refresh-token",
          tokenType: "Bearer",
          expiresIn: 3600,
        }),
      );
      return;
    }

    if (
      url.pathname.endsWith("/auth/forgot-password") ||
      url.pathname.endsWith("/auth/verify-email") ||
      url.pathname.endsWith("/auth/resend-verification-email")
    ) {
      await fulfillJson(route, successEnvelope(null));
      return;
    }

    if (url.pathname.endsWith("/auth/reset-password")) {
      const body = JSON.parse(request.postData() ?? "{}") as {
        token?: string;
      };

      if (body.token === "expired-token") {
        await fulfillJson(
          route,
          failureEnvelope("Invalid or expired reset token"),
          400,
        );
        return;
      }

      await fulfillJson(route, successEnvelope(null));
      return;
    }

    if (url.pathname.endsWith("/auth/logout")) {
      await fulfillJson(
        route,
        successEnvelope({
          success: true,
          message: "Logged out successfully",
        }),
      );
      return;
    }

    if (url.pathname.endsWith("/notifications")) {
      await fulfillJson(route, successEnvelope(payload.notifications));
      return;
    }

    if (url.pathname.endsWith("/appointments") && request.method() === "GET") {
      await fulfillJson(
        route,
        successEnvelope({
          items: payload.appointments,
          page: 1,
          limit: payload.appointments.length,
          total: payload.appointments.length,
        }),
      );
      return;
    }

    if (url.pathname.endsWith("/appointments") && request.method() === "POST") {
      const body = JSON.parse(request.postData() ?? "{}") as {
        startTime?: string;
        endTime?: string;
      };

      if (
        body.startTime === payload.appointments[0]?.startTime &&
        body.endTime === payload.appointments[0]?.endTime
      ) {
        await fulfillJson(
          route,
          failureEnvelope("Overlapping appointment"),
          409,
        );
        return;
      }

      await fulfillJson(route, successEnvelope({ id: "appt-new" }), 201);
      return;
    }

    if (
      /\/appointments\/[^/]+$/.test(url.pathname) &&
      request.method() === "PUT"
    ) {
      const body = JSON.parse(request.postData() ?? "{}") as {
        title?: string;
        description?: string;
        startTime?: string;
        endTime?: string;
      };
      const appointmentId = url.pathname.split("/").pop() ?? "appt-1";

      await fulfillJson(
        route,
        successEnvelope({
          id: appointmentId,
          title: body.title ?? payload.appointments[0]?.title ?? "Updated",
          description: body.description ?? null,
          startTime:
            body.startTime ?? payload.appointments[0]?.startTime ?? now,
          endTime: body.endTime ?? payload.appointments[0]?.endTime ?? now,
          status: "SCHEDULED",
          createdAt: now,
          updatedAt: now,
        }),
      );
      return;
    }

    if (
      /\/appointments\/[^/]+$/.test(url.pathname) &&
      request.method() === "DELETE"
    ) {
      await fulfillJson(
        route,
        successEnvelope({
          success: true,
          deletedCount: 1,
        }),
      );
      return;
    }

    if (url.pathname.endsWith("/profile") && request.method() === "GET") {
      await fulfillJson(route, successEnvelope(payload.profile));
      return;
    }

    if (url.pathname.endsWith("/profile") && request.method() === "PUT") {
      const body = JSON.parse(request.postData() ?? "{}") as {
        displayName?: string;
        timezone?: string;
      };
      await fulfillJson(
        route,
        successEnvelope({
          ...payload.profile,
          displayName: body.displayName ?? payload.profile.displayName,
          timezone: body.timezone ?? payload.profile.timezone,
          updatedAt: now,
        }),
      );
      return;
    }

    await fulfillJson(route, successEnvelope({}));
  });
}
