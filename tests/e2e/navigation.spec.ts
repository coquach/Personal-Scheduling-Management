import { authenticate, expect, test } from "./fixtures/app-fixture";

function successEnvelope<T>(data: T, message = "OK") {
  return {
    success: true,
    message,
    data,
  };
}

test.describe("Workspace navigation", () => {
  test("redirects unauthenticated users from workspace routes to auth", async ({
    page,
  }) => {
    await page.goto("/calendar");

    await expect(page).toHaveURL(/\/auth\?redirect=%2Fcalendar$/);
    await expect(page.getByTestId("auth-page")).toBeVisible();
  });

  test("navigates between sections from the shared sidebar", async ({
    page,
  }) => {
    await authenticate(page);
    await page.goto("/calendar");

    await expect(page.getByTestId("calendar-page")).toBeVisible();
    await expect(page.getByTestId("app-sidebar")).toBeVisible();

    await page.getByTestId("nav-appointments").click();
    await expect(page).toHaveURL(/\/appointments$/);
    await expect(page.getByTestId("appointments-page")).toBeVisible();

    await page.getByTestId("nav-profile").click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByTestId("profile-page")).toBeVisible();
  });

  test("keeps shared header controls stable across routes", async ({
    page,
  }) => {
    await authenticate(page);
    await page.goto("/notifications");

    await expect(page.getByTestId("notifications-page")).toBeVisible();

    await page
      .getByTestId("global-search-input")
      .fill("Quarterly review reminder");

    await expect(page.getByTestId("global-search-input")).toHaveValue(
      "Quarterly review reminder",
    );
    await expect(page.getByTestId("notification-bell")).toBeVisible();
    await expect(page.getByTestId("notification-bell-badge")).toContainText("3");
  });

  test("refreshes the session after a protected request returns 401", async ({
    page,
  }) => {
    let refreshCount = 0;
    const authorizationHeaders: string[] = [];
    let appointmentsRequestCount = 0;

    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        "psms-auth-session",
        JSON.stringify({ refreshToken: "test-refresh-token" }),
      );
    });

    await page.route("**/api/v1/auth/refresh", async (route) => {
      refreshCount += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          successEnvelope({
            accessToken: "refreshed-access-token",
            refreshToken: "refreshed-refresh-token",
            tokenType: "Bearer",
            expiresIn: 3600,
          }),
        ),
      });
    });

    await page.route("**/api/v1/appointments**", async (route) => {
      const request = route.request();
      const url = new URL(request.url());

      if (request.method() === "GET" && url.pathname.endsWith("/appointments")) {
        appointmentsRequestCount += 1;
        authorizationHeaders.push(request.headers().authorization ?? "");

        if (appointmentsRequestCount === 1) {
          await route.fulfill({
            status: 401,
            contentType: "application/json",
            body: JSON.stringify({
              success: false,
              message: "Unauthorized",
              data: null,
            }),
          });
          return;
        }

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(
            successEnvelope({
              items: [
                {
                  id: "appt-1",
                  title: "Team Standup",
                  description: "Weekly product sync",
                  startTime: "2026-03-29T09:00:00.000Z",
                  endTime: "2026-03-29T09:30:00.000Z",
                  status: "SCHEDULED",
                  createdAt: "2026-03-29T10:00:00.000Z",
                  updatedAt: "2026-03-29T10:00:00.000Z",
                },
              ],
              page: 1,
              limit: 20,
              total: 1,
            }),
          ),
        });
        return;
      }

      await route.fallback();
    });

    await authenticate(page);
    await page.goto("/calendar");

    await expect(page.getByTestId("calendar-page")).toBeVisible();
    await expect
      .poll(() => refreshCount, { timeout: 5000 })
      .toBeGreaterThanOrEqual(1);
    expect(authorizationHeaders).toContain("Bearer refreshed-access-token");
    await expect
      .poll(() => appointmentsRequestCount, { timeout: 5000 })
      .toBeGreaterThanOrEqual(2);
  });

  test("signs out and blocks access to protected routes afterwards", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        "psms-auth-session",
        JSON.stringify({ refreshToken: "test-refresh-token" }),
      );
    });

    await authenticate(page);
    await page.goto("/calendar");

    await page.getByTestId("profile-menu-trigger").click();
    await page.getByTestId("sign-out-action").click();

    await expect
      .poll(
        () => page.evaluate(() => window.sessionStorage.getItem("psms-auth-session")),
        { timeout: 5000 },
      )
      .toBeNull();

    await page.goto("/calendar");
    await expect(page).toHaveURL(/\/auth\?redirect=%2Fcalendar$/);
  });
});
