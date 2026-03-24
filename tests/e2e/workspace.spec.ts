import { authenticate, expect, test } from "./fixtures/app-fixture";

test.describe("Workspace scaffolds", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test("supports appointment filter form interactions and stable row assertions", async ({
    page,
  }) => {
    await page.goto("/appointments");

    await page.getByTestId("appointment-search-input").fill("Team Standup");
    await page.getByTestId("filter-tag").fill("Work");
    await page.getByTestId("filter-status").fill("Scheduled");
    await page.getByTestId("filter-date-from").fill("2026-03-14");
    await page.getByTestId("filter-date-to").fill("2026-03-15");
    await page.getByTestId("appointment-create-trigger").click();
    await page.getByTestId("appointment-edit-trigger").first().click();
    await page.getByTestId("appointment-status-trigger").first().click();
    await page.getByTestId("appointment-delete-trigger").first().click();

    await expect(page.getByTestId("appointment-search-input")).toHaveValue(
      "Team Standup",
    );
    await expect(page.getByTestId("filter-tag")).toHaveValue("Work");
    await expect(page.getByTestId("filter-status")).toHaveValue("Scheduled");
    await expect(page.getByTestId("appointment-row")).toHaveCount(3);
    await expect(page.getByTestId("appointment-form-modal")).toBeVisible();
    await expect(page.getByTestId("appointment-conflict-alert")).toBeVisible();
  });

  test("keeps calendar controls interactive and deterministic", async ({ page }) => {
    await page.goto("/calendar");

    await page.getByTestId("calendar-view-day").click();
    await page.getByTestId("calendar-view-week").click();
    await page.getByTestId("calendar-view-month").click();
    await page.getByTestId("calendar-view-agenda").click();
    await page.getByTestId("calendar-nav-prev").click();
    await page.getByTestId("calendar-nav-next").click();
    await page.getByTestId("calendar-day-cell").first().click();
    await page.getByTestId("calendar-slot").first().click();

    await expect(page.getByTestId("calendar-page")).toBeVisible();
    await expect(page.getByTestId("calendar-period-label")).toContainText(
      "March 2026",
    );
    await expect(page.getByTestId("calendar-day-cell")).toHaveCount(14);
    await expect(page.getByTestId("calendar-slot")).toHaveCount(3);
  });

  test("supports tag creation and management form interactions", async ({
    page,
  }) => {
    await page.goto("/tags");

    await page.getByTestId("tag-name-input").fill("Finance");
    await page.getByTestId("tag-color-input").fill("#1d4ed8");
    await page.getByTestId("tag-save").click();
    await page.getByTestId("tag-rename-trigger").first().click();
    await page.getByTestId("tag-rename-input").fill("Finance Updated");
    await page.getByTestId("tag-rename-save").click();
    await page.getByTestId("tag-delete-trigger").first().click();
    await page.getByTestId("tag-delete-confirm").click();

    await expect(page.getByTestId("tag-name-input")).toHaveValue("Finance");
    await expect(page.getByTestId("tag-color-input")).toHaveValue("#1d4ed8");
    await expect(page.getByTestId("tag-preview")).toContainText("Preview");
    await expect(page.getByTestId("tag-name-error")).toBeVisible();
    await expect(page.getByTestId("tag-delete-dialog")).toBeVisible();
  });

  test("supports reminder preference interactions and reminder action controls", async ({
    page,
  }) => {
    await page.goto("/reminders");

    await page.getByTestId("reminder-default-select").fill("30 minutes before");
    await page.getByTestId("reminder-snooze-select").fill("15 minutes");
    await page.getByTestId("reminder-custom-value").fill("45");
    await page.getByTestId("appointment-reminders-trigger").click();
    await page.getByTestId("reminder-add").click();
    await page.getByTestId("reminder-save").click();
    await page.getByTestId("reminder-preferences-save").click();

    await expect(page.getByTestId("reminder-default-select")).toHaveValue(
      "30 minutes before",
    );
    await expect(page.getByTestId("reminder-snooze-select")).toHaveValue(
      "15 minutes",
    );
    await expect(page.getByTestId("reminder-custom-value")).toHaveValue("45");
    await expect(page.getByTestId("reminder-row")).toBeVisible();
    await expect(page.getByTestId("reminder-error")).toBeVisible();
  });

  test("keeps notification controls visible during interactions", async ({
    page,
  }) => {
    await page.goto("/notifications");

    await page.getByTestId("notification-filter").click();
    await page.getByTestId("notification-mark-all-read").click();
    await page.getByTestId("notification-clear-all").click();
    await page.getByTestId("notification-popup-snooze").click();

    await expect(page.getByTestId("notification-popup")).toBeVisible();
    await expect(page.getByTestId("notification-log-row")).toBeVisible();
    await expect(page.getByTestId("notification-status")).toContainText("Due");
    await expect(page.getByTestId("notification-empty-state")).toBeVisible();
  });

  test("shows statistics summary cards and the current analysis period", async ({
    page,
  }) => {
    await page.goto("/statistics");

    await page.getByTestId("statistics-period-filter").click();

    await expect(page.getByTestId("statistics-page")).toBeVisible();
    await expect(page.getByTestId("statistics-period-label")).toContainText(
      "Mar 08 - Mar 14, 2026",
    );
    await expect(page.getByTestId("statistics-total-card")).toContainText("24");
    await expect(page.getByTestId("statistics-completed-card")).toContainText(
      "18",
    );
    await expect(
      page.getByTestId("statistics-completion-rate-card"),
    ).toContainText("75%");
    await expect(page.getByTestId("statistics-empty-state")).toBeVisible();
  });

  test("keeps export filters deterministic and preview visible", async ({
    page,
  }) => {
    await page.goto("/export");

    await page.getByTestId("export-date-from").fill("2026-03-01");
    await page.getByTestId("export-date-to").fill("2026-03-31");
    await page.getByTestId("export-tag-filter").fill("Work");
    await page.getByTestId("export-status-filter").fill("Completed");
    await page.getByTestId("export-submit").click();

    await expect(page.getByTestId("export-date-from")).toHaveValue(
      "2026-03-01",
    );
    await expect(page.getByTestId("export-date-to")).toHaveValue("2026-03-31");
    await expect(page.getByTestId("export-tag-filter")).toHaveValue("Work");
    await expect(page.getByTestId("export-status-filter")).toHaveValue(
      "Completed",
    );
    await expect(page.getByTestId("export-preview-table")).toBeVisible();
    await expect(page.getByTestId("export-empty-state")).toBeVisible();
  });

  test("supports profile form interactions while keeping email read-only", async ({
    page,
  }) => {
    await page.goto("/profile");

    await page.getByTestId("profile-name-input").fill("Jamie Planner");
    await page
      .getByTestId("profile-timezone-select")
      .fill("UTC+08:00 - Singapore Time");
    await page
      .getByTestId("profile-current-password-input")
      .fill("OldPassword123");
    await page.getByTestId("profile-new-password-input").fill("NewPassword123");
    await page
      .getByTestId("profile-confirm-password-input")
      .fill("NewPassword123");
    await page.getByTestId("profile-save").click();
    await page.getByTestId("profile-password-save").click();
    await page.getByTestId("profile-delete-trigger").click();
    await page
      .getByTestId("profile-delete-confirmation-input")
      .fill("john.doe@example.com");
    await page.getByTestId("profile-delete-submit").click();

    await expect(page.getByTestId("profile-name-input")).toHaveValue(
      "Jamie Planner",
    );
    await expect(page.getByTestId("profile-timezone-select")).toHaveValue(
      "UTC+08:00 - Singapore Time",
    );
    await expect(page.getByTestId("profile-email-input")).toHaveValue(
      "john.doe@example.com",
    );
    await expect(page.getByTestId("profile-email-input")).toHaveJSProperty(
      "readOnly",
      true,
    );
    await expect(page.getByTestId("profile-success-banner")).toBeVisible();
    await expect(page.getByTestId("profile-password-error")).toBeVisible();
    await expect(page.getByTestId("profile-delete-dialog")).toBeVisible();
  });
});
