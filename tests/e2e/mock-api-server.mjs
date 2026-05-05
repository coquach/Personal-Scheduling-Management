import { createServer } from "node:http";

const port = Number(process.env.PSMS_MOCK_API_PORT ?? 4000);

const now = new Date("2026-03-29T10:00:00.000Z").toISOString();

const state = {
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
  ],
  appointments: [
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      userId: "33333333-3333-4333-8333-333333333333",
      seriesId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      title: "Team Standup",
      description: "Weekly product sync",
      startAt: "2026-03-29T09:00:00.000Z",
      endAt: "2026-03-29T09:30:00.000Z",
      isRecurringInstance: false,
      status: "SCHEDULED",
      jobId: null,
      tags: [],
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
  devices: [],
};

function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}

function ok(data, message = "OK") {
  return { success: true, message, data };
}

function fail(message) {
  return { success: false, message, data: null };
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function routePath(url) {
  const parsed = new URL(url, "http://127.0.0.1");
  const m = parsed.pathname.match(/^\/api\/v1(\/.*)$/);
  return m?.[1] ?? parsed.pathname;
}

const server = createServer(async (req, res) => {
  const path = routePath(req.url ?? "/");
  const method = req.method ?? "GET";
  const body = await readBody(req);

  if (path === "/health") {
    return sendJson(res, 200, ok({ status: "healthy" }));
  }

  if (path === "/auth/login" && method === "POST") {
    const password = typeof body.password === "string" ? body.password : "";
    if (password.toLowerCase().includes("wrong")) {
      return sendJson(res, 401, fail("Invalid credentials"));
    }
    return sendJson(
      res,
      200,
      ok({
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
        tokenType: "Bearer",
        expiresIn: 3600,
      }),
    );
  }

  if (path === "/auth/register" && method === "POST") {
    return sendJson(
      res,
      201,
      ok({
        id: "user-1",
        email: body.email ?? "user@example.com",
        displayName: body.displayName ?? "New User",
        createdAt: now,
      }),
    );
  }

  if (path === "/auth/forgot-password" && method === "POST") {
    return sendJson(
      res,
      200,
      ok(null, "If the account exists, reset instructions sent"),
    );
  }

  if (path === "/auth/reset-password" && method === "POST") {
    if (body.token === "expired-token" || body.token === "invalid-reset-token") {
      return sendJson(res, 400, fail("Invalid or expired reset token"));
    }
    return sendJson(res, 200, ok(null, "Password reset successful"));
  }

  if (path === "/auth/verify-email" && method === "POST") {
    return sendJson(res, 200, ok(null, "Email verified successfully"));
  }

  if (path === "/auth/resend-verification-email" && method === "POST") {
    return sendJson(
      res,
      200,
      ok(
        null,
        "If the account exists and is not verified, a verification email has been sent",
      ),
    );
  }

  if (path === "/auth/refresh" && method === "POST") {
    return sendJson(
      res,
      200,
      ok({
        accessToken: "refreshed-access-token",
        refreshToken: "refreshed-refresh-token",
        tokenType: "Bearer",
        expiresIn: 3600,
      }),
    );
  }

  if (path === "/auth/logout" && method === "POST") {
    return sendJson(res, 200, ok({ success: true }, "Logged out successfully"));
  }

  if (path === "/appointments" && method === "GET") {
    return sendJson(
      res,
      200,
      ok({
        items: state.appointments,
        page: 1,
        limit: state.appointments.length,
        total: state.appointments.length,
      }),
    );
  }

  if (path === "/users/me" && method === "GET") {
    return sendJson(res, 200, ok(state.profile));
  }

  if (path === "/users/me" && method === "PUT") {
    state.profile = {
      ...state.profile,
      displayName: body.displayName ?? state.profile.displayName,
      timezone: body.timezone ?? state.profile.timezone,
      updatedAt: now,
    };
    return sendJson(res, 200, ok(state.profile));
  }

  if (path === "/users/me/notifications" && method === "GET") {
    return sendJson(res, 200, ok(state.notifications));
  }

  if (path === "/users/devices" && method === "POST") {
    const next = {
      id: "device-1",
      fcmToken: body.fcmToken ?? "test-fcm-token",
      deviceName: body.deviceName ?? null,
      platform: body.platform ?? null,
      lastActiveAt: now,
    };
    state.devices = [next, ...state.devices.filter((d) => d.fcmToken !== next.fcmToken)];
    return sendJson(res, 201, ok(next));
  }

  if (path === "/users/devices" && method === "DELETE") {
    state.devices = state.devices.filter((d) => d.fcmToken !== body.fcmToken);
    return sendJson(res, 200, ok(null));
  }

  return sendJson(res, 200, ok({}));
});

server.listen(port, "127.0.0.1", () => {
  // eslint-disable-next-line no-console
  console.log(`[mock-api] listening on http://127.0.0.1:${port}`);
});
