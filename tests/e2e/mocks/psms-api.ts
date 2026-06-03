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
    userId: string;
    seriesId: string;
    teamId: string | null;
    organizerId: string | null;
    title: string;
    description: string | null;
    startAt: string;
    endAt: string;
    isRecurringInstance: boolean;
    recurrenceType: string;
    status: string;
    jobId: string | null;
    location?: string | null;
    createdAt?: string;
    updatedAt?: string;
    tags: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  }>;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  profile: {
    id: string;
    displayName: string | null;
    email: string;
    timezone: string;
    createdAt: string;
    updatedAt: string;
  };
  teams: Array<{
    id: string;
    name: string;
    description: string | null;
    ownerId?: string;
    role: string;
    memberCount: number;
    createdAt?: string;
    updatedAt?: string;
  }>;
  teamMembers: Array<{
    teamId: string;
    userId: string;
    email: string;
    displayName: string | null;
    role: string;
    status: string;
    joinedAt: string;
  }>;
  invitations: Array<{
    id: string;
    teamId: string;
    teamName: string;
    invitedUserId: string;
    invitedBy?: string;
    invitedById?: string;
    role: string;
    status: string;
    createdAt: string;
    expiresAt?: string | null;
  }>;
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
  setNow: (isoString: string) => void;
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

let now = new Date("2026-03-29T10:00:00.000Z").toISOString();

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
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      userId: "33333333-3333-4333-8333-333333333333",
      seriesId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      teamId: null,
      organizerId: null,
      title: "Team Standup",
      description: "Weekly product sync",
      startAt: "2026-03-29T09:00:00.000Z",
      endAt: "2026-03-29T09:30:00.000Z",
      isRecurringInstance: false,
      recurrenceType: "ONETIME",
      status: "SCHEDULED",
      jobId: null,
      tags: [],
    },
    {
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      userId: "33333333-3333-4333-8333-333333333333",
      seriesId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      teamId: null,
      organizerId: null,
      title: "Doctor Appointment",
      description: "Routine check-up",
      startAt: "2026-03-30T11:30:00.000Z",
      endAt: "2026-03-30T12:15:00.000Z",
      isRecurringInstance: false,
      recurrenceType: "ONETIME",
      status: "SCHEDULED",
      jobId: null,
      tags: [],
    },
    {
      id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      userId: "33333333-3333-4333-8333-333333333333",
      seriesId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
      teamId: null,
      organizerId: null,
      title: "Study Session",
      description: "System design review",
      startAt: "2026-03-31T19:00:00.000Z",
      endAt: "2026-03-31T20:30:00.000Z",
      isRecurringInstance: false,
      recurrenceType: "ONETIME",
      status: "COMPLETED",
      jobId: null,
      tags: [],
    },
  ],
  tags: [
    { id: "tag-1", name: "Work", color: "#ef4444" },
    { id: "tag-2", name: "Personal", color: "#3b82f6" },
  ],
  profile: {
    id: "33333333-3333-4333-8333-333333333333",
    displayName: "Initial Name",
    email: "profile@example.com",
    timezone: "UTC",
    createdAt: now,
    updatedAt: now,
  },
  teams: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Engineering Team",
      description: "Core eng team",
      role: "OWNER",
      memberCount: 2,
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      name: "Design Team",
      description: "Product design",
      role: "MEMBER",
      memberCount: 3,
    }
  ],
  teamMembers: [
    { teamId: "11111111-1111-4111-8111-111111111111", userId: "33333333-3333-4333-8333-333333333333", email: "profile@example.com", displayName: "Initial Name", role: "OWNER", status: "ACTIVE", joinedAt: now },
    { teamId: "11111111-1111-4111-8111-111111111111", userId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee", email: "coworker@example.com", displayName: "Co-worker", role: "MEMBER", status: "ACTIVE", joinedAt: now }
  ],
  invitations: [
    {
      id: "99999999-9999-4999-8999-999999999999",
      teamId: "22222222-2222-4222-8222-222222222222",
      teamName: "Marketing Team",
      invitedUserId: "33333333-3333-4333-8333-333333333333",
      invitedBy: "44444444-4444-4444-8444-444444444444",
      role: "MEMBER",
      status: "PENDING",
      createdAt: now
    }
  ],
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
    setNow(isoString) {
      now = isoString;
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
      !path.startsWith("/series") &&
      !path.startsWith("/profile") &&
      !path.startsWith("/notifications") &&
      !path.startsWith("/users") &&
      !path.startsWith("/teams") &&
      !path.startsWith("/tags") &&
      !path.startsWith("/statistics")
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

    if (path === "/auth/register" && request.method() === "POST") {
      const body = JSON.parse(request.postData() ?? "{}") as {
        displayName?: string;
        email?: string;
      };

      await fulfillJson(
        route,
        successEnvelope(
          {
            id: "33333333-3333-4333-8333-333333333333",
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

    if (path.match(/^\/appointments\/[^/]+\/status$/) && request.method() === "PATCH") {
      const id = path.split("/")[2];
      const body = JSON.parse(request.postData() ?? "{}") as { status: string };
      const payload = payloadStore.get();
      const updatedAppts = payload.appointments.map(a => a.id === id ? { ...a, status: body.status } : a);
      payloadStore.set({ appointments: updatedAppts });
      await fulfillJson(route, successEnvelope(updatedAppts.find(a => a.id === id)));
      return;
    }

    if (path === "/statistics/me" && request.method() === "GET") {
      const payload = payloadStore.get();
      const completedCount = payload.appointments.filter(a => a.status === "COMPLETED").length;
      const totalCount = payload.appointments.length;
      const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      await fulfillJson(
        route,
        successEnvelope({
          periodStart: now,
          periodEnd: now,
          completionRate,
          totalAppointments: totalCount,
          completedAppointments: completedCount,
          missedAppointments: payload.appointments.filter(a => a.status === "MISSED").length,
          cancelledAppointments: payload.appointments.filter(a => a.status === "CANCELLED").length,
          mostProductiveSlot: null,
          trend: [
            { bucket: now, total: totalCount, completed: completedCount }
          ]
        })
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

    if (path.startsWith("/users/search") && request.method() === "GET") {
      const email = new URL(request.url()).searchParams.get("email");
      if (email === "newbie@example.com" || email === "profile@example.com") {
        await fulfillJson(route, successEnvelope({
          id: "33333333-3333-4333-8333-333333333333",
          email,
          displayName: "Mock User",
          avatarUrl: null
        }));
      } else {
        await fulfillJson(route, failureEnvelope("User not found"), 404);
      }
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

    if (path.startsWith("/users/me/notifications/") && path.endsWith("/snooze") && request.method() === "POST") {
      const notificationId = path.split("/")[4];
      const payload = payloadStore.get();
      const updatedNotifications = payload.notifications.map((item) =>
        item.id === notificationId ? { ...item, readAt: now } : item
      );
      payloadStore.set({ notifications: updatedNotifications });
      await fulfillJson(route, successEnvelope(null));
      return;
    }

    if (path === "/appointments" && request.method() === "GET") {
      const payload = payloadStore.get();
      await fulfillJson(
        route,
        successEnvelope({
          items: payload.appointments,
          page: 1,
          limit: 100,
          total: payload.appointments.length,
        }),
      );
      return;
    }

    if (path === "/tags" && request.method() === "GET") {
      await fulfillJson(route, successEnvelope(payloadStore.get().tags));
      return;
    }

    if (path === "/tags" && request.method() === "POST") {
      const body = JSON.parse(request.postData() ?? "{}") as { name: string; color: string };
      const payload = payloadStore.get();
      const newTag = { id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", name: body.name, color: body.color };
      payloadStore.set({ tags: [...payload.tags, newTag] });
      await fulfillJson(route, successEnvelope(newTag), 201);
      return;
    }

    if (path.startsWith("/tags/") && request.method() === "PATCH") {
      const tagId = path.split("/").pop() ?? "";
      const body = JSON.parse(request.postData() ?? "{}") as { name: string; color: string };
      const payload = payloadStore.get();
      const updatedTags = payload.tags.map(t => t.id === tagId ? { ...t, ...body } : t);
      payloadStore.set({ tags: updatedTags });
      await fulfillJson(route, successEnvelope(updatedTags.find(t => t.id === tagId)));
      return;
    }

    if (path.startsWith("/tags/") && request.method() === "DELETE") {
      const tagId = path.split("/").pop() ?? "";
      const payload = payloadStore.get();
      payloadStore.set({ tags: payload.tags.filter(t => t.id !== tagId) });
      await fulfillJson(route, successEnvelope({ message: "Tag deleted successfully" }));
      return;
    }

    if (path === "/teams" && request.method() === "GET") {
      const payload = payloadStore.get();
      await fulfillJson(
        route,
        successEnvelope({
          items: payload.teams,
          page: 1,
          limit: 100,
          total: payload.teams.length,
        }),
      );
      return;
    }

    if (path === "/teams" && request.method() === "POST") {
      const body = JSON.parse(request.postData() ?? "{}") as { name: string; description?: string };
      const payload = payloadStore.get();
      const newTeam = {
        id: "77777777-7777-4777-8777-777777777777",
        name: body.name,
        description: body.description ?? null,
        ownerId: "33333333-3333-4333-8333-333333333333",
        role: "OWNER" as const,
        memberCount: 1,
        createdAt: now,
        updatedAt: now,
      };
      payloadStore.set({
        teams: [...payload.teams, newTeam],
        teamMembers: [...payload.teamMembers, {
          teamId: newTeam.id,
          userId: "33333333-3333-4333-8333-333333333333",
          email: "profile@example.com",
          displayName: "Initial Name",
          role: "OWNER",
          status: "ACTIVE",
          joinedAt: now
        }]
      });
      await fulfillJson(route, successEnvelope(newTeam), 201);
      return;
    }

    if (path.startsWith("/teams/") && !path.includes("/members") && !path.includes("/invitations") && !path.endsWith("/leave") && !path.includes("/appointments") && request.method() === "GET") {
      const teamId = path.split("/")[2];
      const payload = payloadStore.get();
      const team = payload.teams.find(t => t.id === teamId);
      if (!team) {
        await fulfillJson(route, failureEnvelope("Team not found"), 404);
        return;
      }
      await fulfillJson(route, successEnvelope({
        ...team,
        ownerId: "33333333-3333-4333-8333-333333333333",
        createdAt: now,
        updatedAt: now,
        myRole: team.role,
        memberCount: team.memberCount ?? 0
      }));
      return;
    }

    if (path.startsWith("/teams/") && path.endsWith("/members") && request.method() === "GET") {
      const teamId = path.split("/")[2];
      const payload = payloadStore.get();
      const members = payload.teamMembers.filter(m => m.teamId === teamId);
      await fulfillJson(
        route,
        successEnvelope({
          items: members,
          page: 1,
          limit: 100,
          total: members.length,
        }),
      );
      return;
    }

    if (path.startsWith("/teams/") && path.includes("/members/") && path.endsWith("/role") && request.method() === "PATCH") {
      const parts = path.split("/");
      const teamId = parts[2];
      const userId = parts[4];
      const body = JSON.parse(request.postData() ?? "{}") as { role: string };
      const payload = payloadStore.get();
      const updatedMembers = payload.teamMembers.map(m =>
        (m.teamId === teamId && m.userId === userId) ? { ...m, role: body.role } : m
      );
      payloadStore.set({ teamMembers: updatedMembers });
      await fulfillJson(route, successEnvelope({
        teamId,
        userId,
        role: body.role,
        updatedById: "33333333-3333-4333-8333-333333333333",
        updatedAt: now
      }));
      return;
    }

    if (path.startsWith("/teams/") && path.includes("/members/") && request.method() === "DELETE") {
      const parts = path.split("/");
      const teamId = parts[2];
      const userId = parts[4];
      const payload = payloadStore.get();
      payloadStore.set({
        teamMembers: payload.teamMembers.filter(m => !(m.teamId === teamId && m.userId === userId))
      });
      await fulfillJson(route, successEnvelope(null));
      return;
    }

    if (path.startsWith("/teams/") && path.endsWith("/leave") && request.method() === "POST") {
      const teamId = path.split("/")[2];
      const payload = payloadStore.get();
      payloadStore.set({
        teamMembers: payload.teamMembers.filter(m => !(m.teamId === teamId && m.userId === "33333333-3333-4333-8333-333333333333")),
        teams: payload.teams.filter(t => t.id !== teamId)
      });
      await fulfillJson(route, successEnvelope({ message: "Left team successfully", data: null }));
      return;
    }

    if (path.startsWith("/teams/invitations/me") && request.method() === "GET") {
      const payload = payloadStore.get();
      const mapped = payload.invitations.map(i => ({
        invitationId: i.id,
        teamId: i.teamId,
        teamName: i.teamName,
        role: i.role,
        status: i.status,
        invitedAt: i.createdAt,
        expiresAt: null
      }));
      await fulfillJson(
        route,
        successEnvelope(mapped),
      );
      return;
    }

    if (path.includes("/invitations/") && path.endsWith("/accept") && request.method() === "POST") {
      const parts = path.split("/");
      // Path: /teams/:teamId/invitations/:invitationId/accept
      const teamId = parts[2];
      const invitationId = parts[4];
      const payload = payloadStore.get();
      const invitation = payload.invitations.find(i => i.id === invitationId);
      
      if (invitation) {
        payloadStore.set({
          invitations: payload.invitations.filter(i => i.id !== invitationId),
          teamMembers: [...payload.teamMembers, {
            teamId: invitation.teamId,
            userId: "33333333-3333-4333-8333-333333333333",
            email: "profile@example.com",
            displayName: "Initial Name",
            role: invitation.role,
            status: "ACTIVE",
            joinedAt: now
          }],
          teams: [...payload.teams, {
            id: invitation.teamId,
            name: invitation.teamName,
            description: "Joined team",
            ownerId: invitation.invitedById ?? "other-user",
            role: invitation.role,
            memberCount: 2,
            createdAt: now,
            updatedAt: now
          }]
        });
      }
      await fulfillJson(route, successEnvelope({ message: "Invitation accepted", data: null }));
      return;
    }

    if (path.includes("/invitations/") && path.endsWith("/decline") && request.method() === "POST") {
      const parts = path.split("/");
      const invitationId = parts[4];
      const payload = payloadStore.get();
      payloadStore.set({
        invitations: payload.invitations.filter(i => i.id !== invitationId)
      });
      await fulfillJson(route, successEnvelope({ message: "Invitation declined", data: null }));
      return;
    }

    if (path.startsWith("/teams/") && path.endsWith("/invitations") && request.method() === "POST") {
      const teamId = path.split("/")[2];
      const body = JSON.parse(request.postData() ?? "{}") as { invitedUserId: string; role: string };
      const payload = payloadStore.get();
      const newInv = {
        id: "99999999-9999-4999-8999-999999999999",
        teamId,
        teamName: payload.teams.find(t => t.id === teamId)?.name ?? "Team",
        invitedUserId: body.invitedUserId,
        invitedById: "33333333-3333-4333-8333-333333333333",
        role: body.role,
        status: "PENDING",
        createdAt: now,
        expiresAt: null
      };
      payloadStore.set({ invitations: [...payload.invitations, newInv] });
      await fulfillJson(route, successEnvelope(newInv), 201);
      return;
    }

    if (path.startsWith("/teams/") && path.endsWith("/appointments/check-conflicts") && request.method() === "POST") {
      const body = JSON.parse(request.postData() ?? "{}") as { startAt: string; endAt: string };
      const hasConflict = body.startAt.includes("2030-03-29T");
      await fulfillJson(
        route,
        successEnvelope({
          teamId: path.split("/")[2],
          startAt: body.startAt,
          endAt: body.endAt,
          hasConflict,
          availableParticipants: hasConflict ? [] : [{ userId: "11111111-1111-4111-8111-111111111111", displayName: "Initial Name" }],
          busyParticipants: hasConflict ? [{ userId: "22222222-2222-4222-8222-222222222222", displayName: "Co-worker" }] : [],
          conflicts: hasConflict ? [
            {
              userId: "22222222-2222-4222-8222-222222222222",
              displayName: "Co-worker",
              conflictWith: "TEAM_APPOINTMENT",
              startAt: body.startAt,
              endAt: body.endAt
            }
          ] : [],
          suggestedSlots: hasConflict ? [
            { startAt: "2030-03-30T13:00:00.000Z", endAt: "2030-03-30T14:00:00.000Z" },
            { startAt: "2030-03-30T09:00:00.000Z", endAt: "2030-03-30T10:00:00.000Z" }
          ] : []
        })
      );
      return;
    }

    if (path.match(/^\/teams\/[^/]+\/appointments$/) && request.method() === "GET") {
      const teamId = path.split("/")[2];
      const payload = payloadStore.get();
      const teamAppts = payload.appointments.filter(a => a.teamId === teamId).map(a => ({
        id: a.id,
        teamId: a.teamId,
        organizerId: a.organizerId,
        title: a.title,
        startAt: a.startAt,
        endAt: a.endAt,
        status: a.status,
        participantCount: 1
      }));
      await fulfillJson(
        route,
        successEnvelope({
          items: teamAppts,
          page: 1,
          limit: 100,
          total: teamAppts.length,
        }),
      );
      return;
    }

    if (path.match(/^\/teams\/[^/]+\/appointments$/) && request.method() === "POST") {
      const teamId = path.split("/")[2];
      const body = JSON.parse(request.postData() ?? "{}") as { title: string; startAt: string; endAt: string };
      const payload = payloadStore.get();
      const newAppt = {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        userId: "33333333-3333-4333-8333-333333333333",
        seriesId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        teamId,
        organizerId: "33333333-3333-4333-8333-333333333333",
        title: body.title,
        description: null,
        location: null,
        startAt: body.startAt,
        endAt: body.endAt,
        isRecurringInstance: false,
        recurrenceType: "ONETIME",
        status: "SCHEDULED" as const,
        jobId: null,
        tags: [],
        participants: [{
          userId: "33333333-3333-4333-8333-333333333333",
          participationType: "REQUIRED" as const
        }],
        createdAt: now,
        updatedAt: now
      };
      payloadStore.set({ appointments: [newAppt, ...payload.appointments] });
      await fulfillJson(route, successEnvelope(newAppt), 201);
      return;
    }

    if (path.match(/^\/teams\/[^/]+\/appointments\/[^/]+$/) && request.method() === "PATCH") {
      const parts = path.split("/");
      const teamId = parts[2];
      const appointmentId = parts[4];
      const body = JSON.parse(request.postData() ?? "{}");
      const payload = payloadStore.get();
      
      const updatedAppointments = payload.appointments.map(appt => 
        (appt.id === appointmentId && appt.teamId === teamId) 
          ? { 
              ...appt, 
              ...body,
              updatedAt: now
            } 
          : appt
      );
      
      const updated = updatedAppointments.find(a => a.id === appointmentId);
      payloadStore.set({ appointments: updatedAppointments });
      await fulfillJson(route, successEnvelope({
        ...updated,
        location: updated?.location ?? null,
        participants: [{
          userId: "33333333-3333-4333-8333-333333333333",
          participationType: "REQUIRED"
        }]
      }));
      return;
    }

    if (path.match(/^\/teams\/[^/]+\/appointments\/[^/]+$/) && request.method() === "DELETE") {
      const parts = path.split("/");
      const teamId = parts[2];
      const appointmentId = parts[4];
      const payload = payloadStore.get();
      
      payloadStore.set({
        appointments: payload.appointments.filter(appt => !(appt.id === appointmentId && appt.teamId === teamId))
      });
      await fulfillJson(route, successEnvelope({ success: true, deletedId: appointmentId }));
      return;
    }

    if (path === "/series" && request.method() === "POST") {
      const payload = payloadStore.get();
      const body = JSON.parse(request.postData() ?? "{}") as {
        startAt?: string;
        endAt?: string;
        title?: string;
        description?: string | null;
      };

      if (
        body.startAt === payload.appointments[0]?.startAt &&
        body.endAt === payload.appointments[0]?.endAt
      ) {
        await fulfillJson(
          route,
          failureEnvelope("Overlapping appointment"),
          409,
        );
        return;
      }

      const newSeriesId = "abababab-abab-4bab-8bab-abababababab";
      payloadStore.set({
        appointments: [
          {
            id: "cdcdcdcd-cdcd-4dcd-8dcd-cdcdcdcdcdcd",
            userId: "33333333-3333-4333-8333-333333333333",
            seriesId: newSeriesId,
            title: body.title ?? "New appointment",
            description: body.description ?? null,
            startAt: body.startAt ?? now,
            endAt: body.endAt ?? now,
            isRecurringInstance: false,
            recurrenceType: "ONETIME",
            status: "SCHEDULED",
            jobId: null,
            tags: [],
            teamId: null,
            organizerId: null,
          },
          ...payload.appointments,
        ],
      });
      await fulfillJson(route, successEnvelope({ id: newSeriesId }), 201);
      return;
    }

    if (/^\/series\/[^/]+$/.test(path) && request.method() === "PATCH") {
      const payload = payloadStore.get();
      const body = JSON.parse(request.postData() ?? "{}") as {
        title?: string;
        description?: string;
        startAt?: string;
        endAt?: string;
      };
      const seriesId = path.split("/").pop() ?? "";

      payloadStore.set({
        appointments: payload.appointments.map((item) =>
          item.seriesId === seriesId
            ? {
                ...item,
                title: body.title ?? item.title,
                description: body.description ?? item.description,
                startAt: body.startAt ?? item.startAt,
                endAt: body.endAt ?? item.endAt,
              }
            : item,
        ),
      });

      await fulfillJson(route, successEnvelope({ id: seriesId }));
      return;
    }

    if (/^\/series\/[^/]+$/.test(path) && request.method() === "DELETE") {
      const seriesId = path.split("/").pop()?.split("?")[0] ?? "";
      const payload = payloadStore.get();
      payloadStore.set({
        appointments: payload.appointments.filter((item) => item.seriesId !== seriesId),
      });
      await fulfillJson(
        route,
        successEnvelope({ message: "Appointment series deleted successfully." }),
      );
      return;
    }

    if (/^\/appointments\/[^/]+$/.test(path) && request.method() === "DELETE") {
      const appointmentId = path.split("/").pop()?.split("?")[0] ?? "";
      const payload = payloadStore.get();
      payloadStore.set({
        appointments: payload.appointments.filter((item) => item.id !== appointmentId),
      });
      await fulfillJson(
        route,
        successEnvelope({ message: "Appointment deleted successfully." }),
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
        id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
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
      await fulfillJson(route, successEnvelope(target ?? {
        fcmToken: body.fcmToken ?? "unknown",
        deviceName: "Unknown",
        platform: "Unknown",
        registeredAt: now,
      }));
      return;
    }

    await fulfillJson(route, successEnvelope({}));
  });

  return controller;
}
