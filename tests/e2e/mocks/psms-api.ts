import type { BrowserContext, Page, Request, Route } from "@playwright/test";

export type PsmsApiMockPayload = {
  notifications: Array<{
    id: string;
    userId: string;
    appointmentId: string | null;
    reminderId: string | null;
    type: "REMINDER" | "SYSTEM";
    message: string;
    triggeredAt: string | null;
    readAt: string | null;
    createdAt: string;
  }>;
  devices: Array<{
    id: string;
    fcmToken: string;
    deviceName: string | null;
    platform: string | null;
    lastActiveAt: string;
  }>;
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
    displayName: string | null;
    email: string;
    timezone: string;
    createdAt: string;
    updatedAt: string;
  };
};

type RouteMatcher = {
  method?: string;
  path: string | RegExp;
};

type PsmsApiRouteContext = {
  route: Route;
  request: Request;
  path: string;
  payload: PsmsApiMockPayload;
};

type RegisteredHandler = {
  once: boolean;
  handle: (context: PsmsApiRouteContext) => Promise<boolean>;
};

export type PsmsApiMockController = {
  setPayload: (overrides: Partial<PsmsApiMockPayload>) => void;
  mockSuccess: (
    matcher: RouteMatcher,
    data: unknown,
    options?: { status?: number; message?: string; once?: boolean },
  ) => void;
  mockFailure: (
    matcher: RouteMatcher,
    status: number,
    message: string,
    options?: { once?: boolean },
  ) => void;
  mockHandler: (
    handler: (context: PsmsApiRouteContext) => Promise<boolean>,
    options?: { once?: boolean },
  ) => void;
};

const now = new Date("2026-03-29T10:00:00.000Z").toISOString();

const defaultPayload: PsmsApiMockPayload = {
  notifications: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      userId: "33333333-3333-4333-8333-333333333333",
      appointmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      reminderId: null,
      type: "REMINDER",
      message: "Team Standup in 10 minutes",
      triggeredAt: now,
      readAt: null,
      createdAt: now,
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      userId: "33333333-3333-4333-8333-333333333333",
      appointmentId: null,
      reminderId: null,
      type: "SYSTEM",
      message: "Quarterly review tomorrow",
      triggeredAt: now,
      readAt: null,
      createdAt: now,
    },
    {
      id: "44444444-4444-4444-8444-444444444444",
      userId: "33333333-3333-4333-8333-333333333333",
      appointmentId: null,
      reminderId: null,
      type: "SYSTEM",
      message: "Profile updated successfully",
      triggeredAt: now,
      readAt: now,
      createdAt: now,
    },
  ],
  devices: [],
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
    displayName: "Initial Name",
    email: "profile@example.com",
    timezone: "UTC",
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

function normalizeApiPath(url: URL) {
  const match = url.pathname.match(/^\/api(?:\/v1)?(\/.*)$/);
  return match?.[1] ?? url.pathname;
}

function matchesRoute(matcher: RouteMatcher, request: Request, path: string) {
  const methodMatches =
    !matcher.method ||
    request.method().toUpperCase() === matcher.method.toUpperCase();

  if (!methodMatches) {
    return false;
  }

  if (typeof matcher.path === "string") {
    return path === matcher.path;
  }

  return matcher.path.test(path);
}

function hasBearerAuthorization(request: Request) {
  const authorization = request.headers().authorization;
  return typeof authorization === "string" && authorization.startsWith("Bearer ");
}

function createPayloadStore(
  initialOverrides: Partial<PsmsApiMockPayload> = {},
) {
  let currentPayload: PsmsApiMockPayload = {
    ...defaultPayload,
    ...initialOverrides,
  };

  return {
    get() {
      return currentPayload;
    },
    set(overrides: Partial<PsmsApiMockPayload>) {
      currentPayload = {
        ...currentPayload,
        ...overrides,
      };
    },
  };
}

export async function mockPsmsApi(
  target: Page | BrowserContext,
  overrides: Partial<PsmsApiMockPayload> = {},
): Promise<PsmsApiMockController> {
  const payloadStore = createPayloadStore(overrides);
  const handlers: RegisteredHandler[] = [];
  const routeTarget = "context" in target ? target.context() : target;

  const controller: PsmsApiMockController = {
    setPayload(nextOverrides) {
      payloadStore.set(nextOverrides);
    },
    mockSuccess(matcher, data, options = {}) {
      handlers.push({
        once: options.once ?? false,
        handle: async ({ route, request, path }) => {
          if (!matchesRoute(matcher, request, path)) {
            return false;
          }

          await fulfillJson(
            route,
            successEnvelope(data, options.message ?? "OK"),
            options.status ?? 200,
          );
          return true;
        },
      });
    },
    mockFailure(matcher, status, message, options = {}) {
      handlers.push({
        once: options.once ?? false,
        handle: async ({ route, request, path }) => {
          if (!matchesRoute(matcher, request, path)) {
            return false;
          }

          await fulfillJson(route, failureEnvelope(message), status);
          return true;
        },
      });
    },
    mockHandler(handler, options = {}) {
      handlers.push({
        once: options.once ?? false,
        handle: handler,
      });
    },
  };

  await routeTarget.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = normalizeApiPath(url);

    if (
      !path.startsWith("/auth") &&
      !path.startsWith("/appointments") &&
      !path.startsWith("/profile") &&
      !path.startsWith("/notifications") &&
      !path.startsWith("/users")
    ) {
      await route.fallback();
      return;
    }

    const context: PsmsApiRouteContext = {
      route,
      request,
      path,
      payload: payloadStore.get(),
    };

    for (let index = handlers.length - 1; index >= 0; index -= 1) {
      const handler = handlers[index];
      const handled = await handler.handle(context);

      if (handled) {
        if (handler.once) {
          handlers.splice(index, 1);
        }
        return;
      }
    }

    if (path === "/auth/login" && request.method() === "POST") {
      const body = JSON.parse(request.postData() ?? "{}") as { email?: string };

      if (body.email?.trim().toLowerCase() === "unverified@example.com") {
        await fulfillJson(route, failureEnvelope("Email not verified"), 403);
        return;
      }

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

    if (path === "/auth/register" && request.method() === "POST") {
      const body = JSON.parse(request.postData() ?? "{}") as {
        displayName?: string;
        email?: string;
      };

      await fulfillJson(
        route,
        successEnvelope(
          {
            id: "user-1",
            email: body.email?.trim() || "user@example.com",
            displayName: body.displayName?.trim() || "New User",
            createdAt: now,
          },
          "OK",
        ),
        201,
      );
      return;
    }

    if (path === "/auth/refresh" && request.method() === "POST") {
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

    if (path === "/auth/forgot-password" && request.method() === "POST") {
      await fulfillJson(
        route,
        successEnvelope(
          null,
          "If the account exists, reset instructions sent",
        ),
      );
      return;
    }

    if (path === "/auth/verify-email" && request.method() === "POST") {
      await fulfillJson(
        route,
        successEnvelope(null, "Email verified successfully"),
      );
      return;
    }

    if (path === "/auth/resend-verification-email" && request.method() === "POST") {
      await fulfillJson(
        route,
        successEnvelope(
          null,
          "If the account exists and is not verified, a verification email has been sent",
        ),
      );
      return;
    }

    if (path === "/auth/reset-password" && request.method() === "POST") {
      const body = JSON.parse(request.postData() ?? "{}") as {
        token?: string;
      };

      if (body.token === "expired-token" || body.token === "invalid-reset-token") {
        await fulfillJson(
          route,
          failureEnvelope("Invalid or expired reset token"),
          400,
        );
        return;
      }

      await fulfillJson(
        route,
        successEnvelope(null, "Password reset successful"),
      );
      return;
    }

    if (path === "/auth/logout" && request.method() === "POST") {
      await fulfillJson(
        route,
        successEnvelope({
          success: true,
          message: "Logged out successfully",
        }),
      );
      return;
    }

    if (
      ["/notifications", "/appointments", "/profile", "/users/me", "/users/me/notifications", "/users/devices"].some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`),
      ) &&
      !hasBearerAuthorization(request)
    ) {
      await fulfillJson(route, failureEnvelope("Unauthorized"), 401);
      return;
    }

    if (path === "/users/me/notifications" && request.method() === "GET") {
      await fulfillJson(route, successEnvelope(payloadStore.get().notifications));
      return;
    }

    if (/^\/users\/me\/notifications\/[^/]+$/.test(path) && request.method() === "PATCH") {
      const notificationId = path.split("/").pop() ?? "";
      const payload = payloadStore.get();
      const updatedNotifications = payload.notifications.map((item) =>
        item.id === notificationId ? { ...item, readAt: item.readAt ?? now } : item,
      );
      payloadStore.set({ notifications: updatedNotifications });
      await fulfillJson(
        route,
        successEnvelope(
          updatedNotifications.find((item) => item.id === notificationId) ?? null,
        ),
      );
      return;
    }

    if (path === "/users/me/notifications/all" && request.method() === "PATCH") {
      const payload = payloadStore.get();
      const unreadCount = payload.notifications.filter((item) => !item.readAt).length;
      payloadStore.set({
        notifications: payload.notifications.map((item) => ({
          ...item,
          readAt: item.readAt ?? now,
        })),
      });
      await fulfillJson(route, successEnvelope({ count: unreadCount }));
      return;
    }

    if (path === "/appointments" && request.method() === "GET") {
      const payload = payloadStore.get();
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

    if (path === "/appointments" && request.method() === "POST") {
      const payload = payloadStore.get();
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

    if (/^\/appointments\/[^/]+$/.test(path) && request.method() === "PUT") {
      const payload = payloadStore.get();
      const body = JSON.parse(request.postData() ?? "{}") as {
        title?: string;
        description?: string;
        startTime?: string;
        endTime?: string;
      };
      const appointmentId = path.split("/").pop() ?? "appt-1";

      await fulfillJson(
        route,
        successEnvelope({
          id: appointmentId,
          title: body.title ?? payload.appointments[0]?.title ?? "Updated",
          description: body.description ?? null,
          startTime: body.startTime ?? payload.appointments[0]?.startTime ?? now,
          endTime: body.endTime ?? payload.appointments[0]?.endTime ?? now,
          status: "SCHEDULED",
          createdAt: now,
          updatedAt: now,
        }),
      );
      return;
    }

    if (/^\/appointments\/[^/]+$/.test(path) && request.method() === "DELETE") {
      await fulfillJson(
        route,
        successEnvelope({
          success: true,
          deletedCount: 1,
        }),
      );
      return;
    }

    if (path === "/users/me" && request.method() === "GET") {
      await fulfillJson(route, successEnvelope(payloadStore.get().profile));
      return;
    }

    if (path === "/users/me" && request.method() === "PUT") {
      const body = JSON.parse(request.postData() ?? "{}") as {
        displayName?: string;
        timezone?: string;
      };
      const currentProfile = payloadStore.get().profile;
      const updatedProfile = {
        ...currentProfile,
        displayName: body.displayName ?? currentProfile.displayName,
        timezone: body.timezone ?? currentProfile.timezone,
        updatedAt: now,
      };

      payloadStore.set({ profile: updatedProfile });
      await fulfillJson(route, successEnvelope(updatedProfile));
      return;
    }

    if (path === "/users/devices" && request.method() === "GET") {
      await fulfillJson(route, successEnvelope(payloadStore.get().devices));
      return;
    }

    if (path === "/users/devices" && request.method() === "POST") {
      const body = JSON.parse(request.postData() ?? "{}") as {
        fcmToken?: string;
        deviceName?: string;
        platform?: string;
      };
      const payload = payloadStore.get();
      const nextDevice = {
        id: "device-1",
        fcmToken: body.fcmToken ?? "test-fcm-token",
        deviceName: body.deviceName ?? null,
        platform: body.platform ?? null,
        lastActiveAt: now,
      };
      const deduped = payload.devices.filter((device) => device.fcmToken !== nextDevice.fcmToken);
      payloadStore.set({ devices: [nextDevice, ...deduped] });
      await fulfillJson(route, successEnvelope(nextDevice), 201);
      return;
    }

    if (path === "/users/devices" && request.method() === "DELETE") {
      const body = JSON.parse(request.postData() ?? "{}") as { fcmToken?: string };
      const payload = payloadStore.get();
      const target = payload.devices.find((device) => device.fcmToken === body.fcmToken);
      payloadStore.set({
        devices: payload.devices.filter((device) => device.fcmToken !== body.fcmToken),
      });
      await fulfillJson(route, successEnvelope(target ?? null));
      return;
    }

    await fulfillJson(route, successEnvelope({}));
  });

  return controller;
}
