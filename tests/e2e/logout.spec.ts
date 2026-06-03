import { authenticate, expect, test } from "./fixtures/app-fixture";

test.describe("Logout flow", () => {
  test("successfully signs out and unregisters notification device", async ({
    page,
    psmsApi,
  }) => {
    // 1. Authenticate user and go to a protected page
    await authenticate(page);
    // 2. Setup mock for FCM token to simulate a registered device
    await page.addInitScript(() => {
      (window as any).__PSMS_TEST_FCM_TOKEN__ = "test-fcm-token-123";
    });

    await page.goto("/calendar");

    // 3. Intercept the unregister device API call to verify it happens
    let unregisterCalled = false;
    page.on("request", (request) => {
      if (
        request.method() === "DELETE" &&
        request.url().includes("/users/devices")
      ) {
        unregisterCalled = true;
      }
    });

    // Mock successful unregister device response
    psmsApi.mockSuccess(
      { method: "DELETE", path: "/users/devices" },
      { success: true, message: "Device unregistered" },
    );

    // 4. Perform Logout action
    // Assuming the layout has a logout button with data-testid="sign-out-action"
    // For this example we just assume it's in the sidebar/header.
    // If we don't have the exact testid, we can find it by text or role.
    await page.getByTestId("profile-menu-trigger").click();
    const logoutButton = page.getByTestId("sign-out-action");
    await expect(logoutButton).toBeVisible();
    await page.waitForTimeout(500); // Wait for menu animation
    
    const responsePromise = page.waitForResponse(r => r.url().includes("/users/devices") && r.request().method() === "DELETE");
    await page.evaluate(() => { (window as any).__PSMS_TEST_FCM_TOKEN__ = undefined; });
    await logoutButton.click();
    await responsePromise;

    // 5. Verify the behavior
    // User should be redirected to login
    await expect(page).toHaveURL(/\/login$/);
    
    // Verify the unregister API was actually called
    expect(unregisterCalled).toBe(true);

    // Verify local storage is cleared
    const token = await page.evaluate(() => localStorage.getItem("psms:registered-fcm-token"));
    expect(token).toBeNull();
  });

  test("signs out gracefully even if device unregistration fails", async ({
    page,
    psmsApi,
  }) => {
    await authenticate(page);
    await page.addInitScript(() => {
      (window as any).__PSMS_TEST_FCM_TOKEN__ = "test-fcm-token-123";
    });

    await page.goto("/calendar");

    // Simulate a failure when unregistering device
    psmsApi.mockFailure(
      { method: "DELETE", path: "/users/devices" },
      500,
      "Server error",
    );

    await page.getByTestId("profile-menu-trigger").click();
    const logoutButton = page.getByTestId("sign-out-action");
    await expect(logoutButton).toBeVisible();
    await page.waitForTimeout(500); // Wait for menu animation
    await page.evaluate(() => { (window as any).__PSMS_TEST_FCM_TOKEN__ = undefined; });
    await logoutButton.click();

    // The user should STILL be redirected to login despite the error
    await expect(page).toHaveURL(/\/login$/);

    // Local storage should still be cleared
    const token = await page.evaluate(() => localStorage.getItem("psms:registered-fcm-token"));
    expect(token).toBeNull();
  });
});
