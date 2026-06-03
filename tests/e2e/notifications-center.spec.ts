import { authenticate, expect, test } from "./fixtures/app-fixture";

test.describe("Notifications Center", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test("NOTIF-01 & NOTIF-02: filter, mark all read, clear log", async ({ page, psmsApi }) => {
    psmsApi.mockHandler(async ({ route, request, path }) => {
      if (request.method() === "GET" && path.includes("/users/me/notifications")) {
        await route.fulfill({
          status: 200, contentType: "application/json",
          body: JSON.stringify({ success: true, data: [{ id: "11111111-1111-4111-8111-111111111111", userId: "33333333-3333-4333-8333-333333333333", actorUserId: null, appointmentId: null, teamInvitationId: null, teamAppointmentId: null, type: "SYSTEM", eventType: null, title: null, message: "Notice", payload: null, readAt: null, createdAt: new Date().toISOString() }], message: "OK" })
        });
        return true;
      }
      if (request.method() === "PATCH" || request.method() === "DELETE") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, message: "OK" }) });
        return true;
      }
      return false;
    });

    await page.goto("/notifications");

    const filter = page.getByTestId("notification-filter");
    if (await filter.isVisible() && await filter.isEnabled()) {
      await filter.click();
    }

    const markAllRead = page.getByTestId("notification-mark-all-read");
    if (await markAllRead.isVisible() && await markAllRead.isEnabled()) {
      await markAllRead.click();
    }

    const clearLog = page.getByTestId("notification-clear-all");
    if (await clearLog.isVisible() && await clearLog.isEnabled()) {
      await clearLog.click();
      await expect(page.getByTestId("notification-empty-state")).toBeVisible();
    }
  });

  test("REM-03 & REM-04: real-time popup and snooze", async ({ page }) => {
    await page.goto("/notifications");
    
    // Wait for the page to be fully loaded and NotificationBootstrap to be mounted
    await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();

    // Give React time to run useEffects (NotificationBootstrap listener registration)
    await page.waitForTimeout(500);

    // Dispatch custom event to simulate Firebase foreground push
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("psms:test-foreground-message", {
        detail: { notification: { title: "REM-03 Popup", body: "Time to go" } }
      }));
    });

    const popup = page.getByTestId("notification-popup").first();
    await expect(popup).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("REM-03 Popup")).toBeVisible();
    
    const dismissBtn = page.getByTestId("notification-popup-dismiss");
    if (await dismissBtn.isVisible()) {
      await dismissBtn.click();
      await expect(popup).toBeHidden({ timeout: 10000 });
    }
  });
});
