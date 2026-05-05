import { expect, test } from "./fixtures/app-fixture";

test.describe("Notifications and push integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __PSMS_TEST_FCM_TOKEN__?: string }).__PSMS_TEST_FCM_TOKEN__ =
        "playwright-fcm-token";
    });
  });

  async function login(page: import("@playwright/test").Page) {
    await page.goto("/auth");
    await page.getByTestId("login-email-input").fill("profile@example.com");
    await page.getByTestId("login-password-input").fill("ValidPass123");
    await Promise.all([
      page.waitForURL(/\/calendar$/),
      page.getByTestId("login-submit").click(),
    ]);
    await expect(page.getByTestId("calendar-page")).toBeVisible();
  }

  test.fixme("login shell registers FCM device token", async ({ page, psmsApi }) => {
    let registerRequestBody: Record<string, unknown> | null = null;

    psmsApi.mockHandler(async ({ request, path }) => {
      if (request.method() === "POST" && path === "/users/devices") {
        registerRequestBody = JSON.parse(request.postData() ?? "{}");
      }
      return false;
    });

    await login(page);

    await expect
      .poll(() => registerRequestBody?.fcmToken)
      .toBe("playwright-fcm-token");
  });

  test.fixme("foreground push shows toast and refreshes notification UI", async ({ page, psmsApi }) => {
    let notificationsGetCount = 0;
    let shouldReturnUpdatedList = false;

    psmsApi.mockHandler(async ({ route, request, path, payload }) => {
      if (request.method() !== "GET" || path !== "/users/me/notifications") {
        return false;
      }

      notificationsGetCount += 1;

      const data = shouldReturnUpdatedList
        ? payload.notifications.map((item, index) =>
            index === 0 ? { ...item, readAt: new Date().toISOString() } : item,
          )
        : payload.notifications;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "OK",
          data,
        }),
      });
      return true;
    });

    await login(page);
    await page.goto("/notifications");
    await expect(page.getByTestId("notifications-page")).toBeVisible();

    shouldReturnUpdatedList = true;
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent("psms:test-foreground-message", {
          detail: {
            notification: {
              title: "Reminder",
              body: "Appointment starts in 10 minutes",
            },
            data: {
              message: "Appointment starts in 10 minutes",
              deepLink: "/notifications",
            },
          },
        }),
      );
    });

    await expect(page.getByText("Appointment starts in 10 minutes")).toBeVisible();
    await expect.poll(() => notificationsGetCount).toBeGreaterThan(1);
  });

  test.fixme("logout unregisters FCM token", async ({ page, psmsApi }) => {
    let unregisterRequestBody: Record<string, unknown> | null = null;

    psmsApi.mockHandler(async ({ request, path }) => {
      if (request.method() === "DELETE" && path === "/users/devices") {
        unregisterRequestBody = JSON.parse(request.postData() ?? "{}");
      }
      return false;
    });

    await login(page);

    await page.getByTestId("profile-menu-trigger").click();
    await page.getByTestId("sign-out-action").click();

    await expect(page).toHaveURL(/\/login$/);
    await expect
      .poll(() => unregisterRequestBody?.fcmToken)
      .toBe("playwright-fcm-token");
  });

  test.fixme("background push click opens expected deep link", async () => {
    // This requires browser push runtime (service worker + push event pipeline)
    // in CI. Keep this as a tracked E2E item and execute in staging device runs.
  });
});
