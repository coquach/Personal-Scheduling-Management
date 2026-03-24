import { expect, test } from "./fixtures/app-fixture";

test.describe("Authentication and recovery", () => {
  test("redirects the root route to auth and allows login form interaction", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/auth(?:\?.*)?$/);
    await expect(page.getByTestId("auth-page")).toBeVisible();

    await page.getByTestId("login-email-input").fill("john.doe@example.com");
    await page.getByTestId("login-password-input").fill("SuperSecret123");
    await page.getByTestId("login-submit").click();

    await expect(page.getByTestId("login-email-input")).toHaveValue(
      "john.doe@example.com",
    );
    await expect(page.getByTestId("login-password-input")).toHaveValue(
      "SuperSecret123",
    );
    await expect(page.getByTestId("login-error-banner")).toBeVisible();
  });

  test("switches to the register tab and keeps registration fields stable", async ({
    page,
  }) => {
    await page.goto("/auth");

    await page.getByTestId("auth-tab-register").click();
    await page.getByTestId("register-name-input").fill("Jane Planner");
    await page.getByTestId("register-email-input").fill("jane@example.com");
    await page.getByTestId("register-password-input").fill("Password123");
    await page
      .getByTestId("register-confirm-password-input")
      .fill("Password123");
    await page.getByTestId("register-submit").click();

    await expect(page.getByTestId("register-name-input")).toHaveValue(
      "Jane Planner",
    );
    await expect(page.getByTestId("register-email-input")).toHaveValue(
      "jane@example.com",
    );
    await expect(page.getByTestId("register-success-banner")).toBeVisible();
    await expect(page.getByTestId("register-email-error")).toBeVisible();
  });

  test("navigates to forgot-password and submits the recovery form", async ({
    page,
  }) => {
    await page.goto("/auth");

    await page.getByTestId("forgot-password-link").click();
    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(page.getByTestId("forgot-password-page")).toBeVisible();

    await page
      .getByTestId("forgot-password-email-input")
      .fill("registered.user@example.com");
    await page.getByTestId("forgot-password-submit").click();

    await expect(page.getByTestId("forgot-password-email-input")).toHaveValue(
      "registered.user@example.com",
    );
    await expect(page.getByTestId("forgot-password-success")).toBeVisible();
  });

  test("opens reset-password with a token and keeps the reset flow deterministic", async ({
    page,
  }) => {
    await page.goto("/reset-password?token=expired-token");

    await expect(page.getByTestId("reset-password-page")).toBeVisible();

    await page.getByTestId("reset-password-new-input").fill("FreshPassword123");
    await page
      .getByTestId("reset-password-confirm-input")
      .fill("FreshPassword123");
    await page.getByTestId("reset-password-submit").click();

    await expect(page.getByTestId("reset-password-new-input")).toHaveValue(
      "FreshPassword123",
    );
    await expect(page.getByTestId("reset-password-confirm-input")).toHaveValue(
      "FreshPassword123",
    );
    await expect(page.getByTestId("reset-password-error")).toBeVisible();
  });
});
