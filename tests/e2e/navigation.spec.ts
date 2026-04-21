import { authenticate, expect, test } from "./fixtures/app-fixture";

test.describe("Workspace navigation", () => {
  test("redirects unauthenticated users from workspace routes to auth", async ({
    page,
  }) => {
    await page.goto("/calendar");

    await expect(page).toHaveURL(/\/login\?redirect=%2Fcalendar$/);
    await expect(page.getByTestId("login-page")).toBeVisible();
  });

  test("redirects authenticated users away from auth routes", async ({
    page,
  }) => {
    await authenticate(page);

    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto("/register");
    await expect(page).toHaveURL(/\/dashboard$/);
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

  test("refreshes the session before the first protected request when only a refresh token exists", async ({
    page,
    psmsApi,
  }) => {
    let refreshCount = 0;
    let appointmentsRequestCount = 0;
    const authorizationHeaders: string[] = [];

    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        "psms-auth-session",
        JSON.stringify({ refreshToken: "test-refresh-token" }),
      );
    });

    psmsApi.mockHandler(async ({ request, path }) => {
      if (path === "/auth/refresh" && request.method() === "POST") {
        refreshCount += 1;
      }

      if (path === "/appointments" && request.method() === "GET") {
        appointmentsRequestCount += 1;
        authorizationHeaders.push(request.headers().authorization ?? "");
      }

      return false;
    });

    await authenticate(page);
    await page.goto("/calendar");

    await expect(page.getByTestId("calendar-page")).toBeVisible();
    await expect
      .poll(() => refreshCount, { timeout: 5000 })
      .toBeGreaterThanOrEqual(1);
    await expect
      .poll(() => appointmentsRequestCount, { timeout: 5000 })
      .toBeGreaterThanOrEqual(1);
    expect(authorizationHeaders).toContain("Bearer refreshed-access-token");
  });

  test("signs out and blocks access to protected routes afterwards", async ({
    page,
  }) => {
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
    await expect(page).toHaveURL(/\/login\?redirect=%2Fcalendar$/);
  });
});
