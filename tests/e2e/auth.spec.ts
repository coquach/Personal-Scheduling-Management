import { expect, test } from "./fixtures/app-fixture";

test.describe("Authentication and recovery", () => {
  test("shows a marketing landing page and links users to the auth entry", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("marketing-page")).toBeVisible();

    await page.getByTestId("marketing-primary-cta").click();
    await expect(page).toHaveURL(/\/auth$/);
    await expect(page.getByTestId("auth-page")).toBeVisible();
  });

  test("logs in successfully from the auth page", async ({ page }) => {
    await page.goto("/auth");

    await page.getByTestId("login-email-input").fill("profile@example.com");
    await page.getByTestId("login-password-input").fill("ValidPass123");
    await expect(page.getByTestId("login-success-banner")).toBeVisible();
    await expect(page.getByTestId("login-submit")).toBeEnabled();
    await Promise.all([
      page.waitForURL(/\/calendar$/),
      page.getByTestId("login-submit").click(),
    ]);

    await expect(page).toHaveURL(/\/calendar$/);
    await expect(page.getByTestId("calendar-page")).toBeVisible();
  });

  test("switches to the register tab and keeps registration fields stable", async ({
    page,
  }) => {
    await page.goto("/auth");

    await page.getByTestId("auth-tab-register").click();
    await expect(page.getByTestId("register-name-input")).toBeVisible();
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
    await expect(page.getByTestId("register-password-input")).toHaveValue("");
    await expect(page.getByTestId("register-confirm-password-input")).toHaveValue(
      "",
    );
    await expect(page.getByTestId("register-success-banner")).toBeVisible();
  });

  test("shows duplicate-email registration error from the backend", async ({
    page,
    psmsApi,
  }) => {
    psmsApi.mockFailure(
      { method: "POST", path: "/auth/register" },
      409,
      "Email already registered",
      { once: true },
    );

    await page.goto("/auth");
    await page.getByTestId("auth-tab-register").click();
    await expect(page.getByTestId("register-name-input")).toBeVisible();
    await page.getByTestId("register-name-input").fill("Jane Planner");
    await page.getByTestId("register-email-input").fill("jane@example.com");
    await page.getByTestId("register-password-input").fill("Password123");
    await page
      .getByTestId("register-confirm-password-input")
      .fill("Password123");
    await page.getByTestId("register-submit").click();

    await expect(page.getByTestId("register-email-error")).toContainText(
      "Email already registered",
    );
    await expect(page).toHaveURL(/\/auth$/);
  });

  test("blocks registration when password confirmation does not match", async ({
    page,
  }) => {
    let registerRequestCount = 0;

    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        request.url().includes("/auth/register")
      ) {
        registerRequestCount += 1;
      }
    });

    await page.goto("/auth");
    await page.getByTestId("auth-tab-register").click();
    await expect(page.getByTestId("register-name-input")).toBeVisible();
    await page.getByTestId("register-name-input").fill("Jane Planner");
    await page.getByTestId("register-email-input").fill("jane@example.com");
    await page.getByTestId("register-password-input").fill("Password123");
    await page
      .getByTestId("register-confirm-password-input")
      .fill("Password456");
    await page.getByTestId("register-confirm-password-input").blur();

    await expect(page.getByTestId("register-confirm-error")).toContainText(
      "Password confirmation does not match",
    );
    await expect(page.getByTestId("register-submit")).toBeDisabled();
    expect(registerRequestCount).toBe(0);
  });

  test("shows invalid-credentials feedback when login fails", async ({
    page,
    psmsApi,
  }) => {
    psmsApi.mockFailure(
      { method: "POST", path: "/auth/login" },
      401,
      "Invalid credentials",
      { once: true },
    );

    await page.goto("/auth");
    await page.getByTestId("login-email-input").fill("profile@example.com");
    await page.getByTestId("login-password-input").fill("WrongPassword");
    await expect(page.getByTestId("login-submit")).toBeEnabled();
    await page.getByTestId("login-submit").click();

    await expect(page.getByTestId("login-error-banner")).toContainText(
      "Invalid credentials",
    );
    await expect(page).toHaveURL(/\/auth$/);
  });

  test("navigates to forgot-password and submits the recovery form", async ({
    page,
  }) => {
    await page.goto("/auth");

    await Promise.all([
      page.waitForURL(/\/forgot-password$/),
      page.getByTestId("forgot-password-link").click(),
    ]);
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

  test("keeps forgot-password responses generic for unknown email", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    await page
      .getByTestId("forgot-password-email-input")
      .fill("missing.user@example.com");
    await page.getByTestId("forgot-password-submit").click();

    await expect(page.getByTestId("forgot-password-success")).toBeVisible();
    await expect(page.getByTestId("forgot-password-error")).toHaveCount(0);
  });

  test("opens reset-password with an invalid token and keeps the flow deterministic", async ({
    page,
  }) => {
    await page.goto("/reset-password?token=expired-token");

    await expect(page.getByTestId("reset-password-page")).toBeVisible();

    await page.getByTestId("reset-password-new-input").fill("FreshPassword123");
    await page
      .getByTestId("reset-password-confirm-input")
      .fill("FreshPassword123");
    await page.getByTestId("reset-password-submit").click();

    await expect(page.getByTestId("reset-password-error")).toContainText(
      "Invalid or expired reset token",
    );
    await expect(page.getByTestId("reset-password-new-input")).toHaveValue(
      "FreshPassword123",
    );
    await expect(page.getByTestId("reset-password-confirm-input")).toHaveValue(
      "FreshPassword123",
    );
  });

  test("completes verify-email successfully when the token is valid", async ({
    page,
  }) => {
    await page.goto("/verify-email?token=valid-token");

    await expect(page.getByTestId("verify-email-success")).toContainText(
      "Verification completed",
    );
    await expect(page.getByTestId("verify-email-success")).toContainText(
      "Your email has been verified successfully",
    );
  });

  test("shows verify-email failure and allows resending the email", async ({
    page,
    psmsApi,
  }) => {
    psmsApi.mockFailure(
      { method: "POST", path: "/auth/verify-email" },
      400,
      "Invalid or expired verification token",
      { once: true },
    );

    await page.goto("/verify-email?token=expired-token");

    await expect(page.getByTestId("verify-email-error")).toContainText(
      "Invalid or expired verification token",
    );

    await page
      .getByTestId("verify-email-resend-input")
      .fill("registered.user@example.com");
    await page.getByTestId("verify-email-resend-submit").click();

    await expect(page.getByTestId("verify-email-resend-message")).toContainText(
      "a new verification email has been sent",
    );
  });
});
