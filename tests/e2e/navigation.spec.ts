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
    await expect(page).toHaveURL(/\/calendar$/);
  });

  test("shows shared sidebar navigation links for workspace sections", async ({
    page,
  }) => {
    await authenticate(page);
    await page.goto("/calendar");

    await expect(page.getByTestId("calendar-page")).toBeVisible();
    await expect(page.getByTestId("app-sidebar")).toBeVisible();

    await expect(page.getByRole("link", { name: "Appointments" })).toHaveAttribute(
      "href",
      "/appointments",
    );
    await expect(page.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile",
    );
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
    await expect(page.getByTestId("notification-bell-badge")).toBeVisible();
  });

  test("refreshes the session before the first protected request when only a refresh token exists", async ({
    page,
    psmsApi,
  }) => {
    let appointmentsRequestCount = 0;
    const authorizationHeaders: string[] = [];

    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        "psms-auth-session",
        JSON.stringify({ refreshToken: "test-refresh-token" }),
      );
      (window as Window & { __PSMS_TEST_ACCESS_TOKEN__?: string }).__PSMS_TEST_ACCESS_TOKEN__ =
        "test-access-token";
    });

    psmsApi.mockHandler(async ({ request, path }) => {
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
      .poll(() => appointmentsRequestCount, { timeout: 5000 })
      .toBeGreaterThanOrEqual(1);
    expect(authorizationHeaders).toContain("Bearer test-access-token");
  });

  test("signs out and blocks access to protected routes afterwards", async ({
    page,
  }) => {
    await authenticate(page);
    await page.goto("/calendar");

    await page.context().clearCookies();
    await page.evaluate(() => {
      window.sessionStorage.removeItem("psms-auth-session");
      (window as Window & { __PSMS_TEST_ACCESS_TOKEN__?: string }).__PSMS_TEST_ACCESS_TOKEN__ =
        undefined;
    });
    await page.reload();
    await expect(page).toHaveURL(/\/login\?redirect=%2Fcalendar$/);
  });
});
