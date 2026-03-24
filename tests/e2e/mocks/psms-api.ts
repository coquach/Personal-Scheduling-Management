import type { Page, Route } from "@playwright/test";

export type PsmsApiMockPayload = {
  notifications: Array<{ id: string; message: string; status: string }>;
  appointments: Array<{ id: string; title: string; status: string }>;
  profile: {
    fullName: string;
    email: string;
    timezone: string;
  };
};

const defaultPayload: PsmsApiMockPayload = {
  notifications: [
    { id: "notif-1", message: "Team Standup in 10 minutes", status: "UNREAD" },
  ],
  appointments: [
    { id: "appt-1", title: "Team Standup", status: "SCHEDULED" },
  ],
  profile: {
    fullName: "John Doe",
    email: "john.doe@example.com",
    timezone: "UTC+07:00",
  },
};

async function fulfillJson(route: Route, payload: unknown) {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

export async function mockPsmsApi(
  page: Page,
  overrides: Partial<PsmsApiMockPayload> = {},
) {
  const payload = {
    ...defaultPayload,
    ...overrides,
  };

  await page.route("**/api/psms/**", async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith("/notifications")) {
      await fulfillJson(route, payload.notifications);
      return;
    }

    if (url.pathname.endsWith("/appointments")) {
      await fulfillJson(route, payload.appointments);
      return;
    }

    if (url.pathname.endsWith("/profile")) {
      await fulfillJson(route, payload.profile);
      return;
    }

    await fulfillJson(route, {});
  });
}
