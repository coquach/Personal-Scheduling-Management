import { authenticate, expect, test } from "./fixtures/app-fixture";

function futureLocalDateTime(hoursAhead: number) {
  const date = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

test.describe("Midterm workspace coverage", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test("creates a new appointment and refreshes the list", async ({
    page,
    psmsApi,
  }) => {
    await page.goto("/appointments");
    await page.getByTestId("appointment-create-trigger").click();
    await page.getByTestId("appointment-title-input").fill("Quarterly Review");
    await page
      .getByTestId("appointment-description-input")
      .fill("Review roadmap and delivery status");
    await page.getByTestId("appointment-start-input").fill(futureLocalDateTime(24));
    await page.getByTestId("appointment-end-input").fill(futureLocalDateTime(25));
    await page.getByTestId("appointment-save").click();

    await expect(page.getByTestId("appointment-form-modal")).not.toBeVisible();
    await expect(page.getByText("Quarterly Review")).toBeVisible();
    await expect(page.getByTestId("appointment-row")).toHaveCount(4);
  });

  test("shows conflict feedback for overlapping appointments", async ({
    page,
    psmsApi,
  }) => {
    psmsApi.mockFailure(
      { method: "POST", path: "/series" },
      409,
      "Overlapping appointment",
      { once: true },
    );

    await page.goto("/appointments");

    await page.getByTestId("appointment-create-trigger").click();
    await expect(page.getByTestId("appointment-form-modal")).toBeVisible();
    await page.getByTestId("appointment-title-input").fill("Overlap Attempt");
    await page.getByTestId("appointment-start-input").fill(futureLocalDateTime(24));
    await page.getByTestId("appointment-end-input").fill(futureLocalDateTime(25));
    await page.getByTestId("appointment-save").click();

    await expect(page.getByTestId("appointment-conflict-alert")).toContainText(
      "Overlapping appointment",
    );
    await expect(page.getByTestId("appointment-form-modal")).toBeVisible();
  });

  test("shows backend time-range validation errors without closing the form", async ({
    page,
    psmsApi,
  }) => {
    psmsApi.mockFailure(
      { method: "POST", path: "/series" },
      400,
      "startTime must be before endTime",
      { once: true },
    );

    await page.goto("/appointments");
    await page.getByTestId("appointment-create-trigger").click();
    await page.getByTestId("appointment-title-input").fill("Broken Range");
    await page.getByTestId("appointment-start-input").fill(futureLocalDateTime(26));
    await page.getByTestId("appointment-end-input").fill(futureLocalDateTime(25));
    await page.getByTestId("appointment-save").click();

    await expect(page.getByTestId("appointment-time-error")).toContainText(
      "endTime must be greater than startTime",
    );
    await expect(page.getByTestId("appointment-form-modal")).toBeVisible();
  });

  test("shows backend past-date validation errors without closing the form", async ({
    page,
    psmsApi,
  }) => {
    psmsApi.mockFailure(
      { method: "POST", path: "/series" },
      400,
      "startTime must not be in the past",
      { once: true },
    );

    await page.goto("/appointments");
    await page.getByTestId("appointment-create-trigger").click();
    await page.getByTestId("appointment-title-input").fill("Past Attempt");
    await page.getByTestId("appointment-start-input").fill("2025-03-29T09:00");
    await page.getByTestId("appointment-end-input").fill("2025-03-29T10:00");
    await page.getByTestId("appointment-save").click();

    await expect(page.getByTestId("appointment-time-error")).toContainText(
      "startTime must not be in the past",
    );
    await expect(page.getByTestId("appointment-form-modal")).toBeVisible();
  });

  test("updates editable profile information and keeps email read-only", async ({
    page,
  }) => {
    await page.goto("/profile");

    await page.getByTestId("profile-name-input").fill("Jamie Planner");
    await page
      .getByTestId("profile-timezone-select")
      .fill("Asia/Singapore");
    await page.getByTestId("profile-save").click();

    await expect(page.getByTestId("profile-name-input")).toHaveValue(
      "Jamie Planner",
    );
    await expect(page.getByTestId("profile-timezone-select")).toHaveValue(
      "Asia/Singapore",
    );
    await expect(page.getByTestId("profile-email-input")).toHaveValue(
      "profile@example.com",
    );
    await expect(page.getByTestId("profile-email-input")).toHaveJSProperty(
      "readOnly",
      true,
    );
    await expect(page.getByTestId("profile-success-banner")).toBeVisible();
  });
});
