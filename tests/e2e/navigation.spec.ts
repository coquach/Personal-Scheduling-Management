import { authenticate, expect, test } from "./fixtures/app-fixture";

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

    await page.getByTestId("nav-tags").click();
    await expect(page).toHaveURL(/\/tags$/);
    await expect(page.getByTestId("tags-page")).toBeVisible();

    await page.getByTestId("nav-statistics").click();
    await expect(page).toHaveURL(/\/statistics$/);
    await expect(page.getByTestId("statistics-page")).toBeVisible();

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
});
