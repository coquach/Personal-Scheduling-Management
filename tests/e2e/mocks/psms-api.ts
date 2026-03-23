import type { Page, Route } from "@playwright/test";

const defaultPayload = {
  notifications: [
    { id: "notif-1", message: "Team Standup in 10 minutes", status: "UNREAD" },
  ],
  appointments: [
    { id: "appt-1", title: "Team Standup", status: "SCHEDULED" },
  ],
};

async function fulfillJson(route: Route, payload: unknown) {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

export async function mockPsmsApi(page: Page) {
  await page.route("**/api/psms/**", async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith("/notifications")) {
      await fulfillJson(route, defaultPayload.notifications);
      return;
    }

    if (url.pathname.endsWith("/appointments")) {
      await fulfillJson(route, defaultPayload.appointments);
      return;
    }

    await fulfillJson(route, {});
  });
}
