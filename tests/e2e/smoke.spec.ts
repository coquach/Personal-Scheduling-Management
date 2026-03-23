import { expect, test } from "./fixtures/app-fixture";

test("root redirects to auth", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/auth$/);
  await expect(page.getByTestId("auth-page")).toBeVisible();
  await expect(page.getByTestId("login-submit")).toBeVisible();
});

test("calendar shell renders core navigation", async ({ page }) => {
  await page.goto("/calendar");

  await expect(page.getByTestId("app-sidebar")).toBeVisible();
  await expect(page.getByTestId("nav-appointments")).toBeVisible();
  await expect(page.getByTestId("calendar-page")).toBeVisible();
  await expect(page.getByTestId("calendar-view-month")).toBeVisible();
});

test("appointments page exposes stable scaffold selectors", async ({ page }) => {
  await page.goto("/appointments");

  await expect(page.getByTestId("appointment-create-trigger")).toBeVisible();
  await expect(page.getByTestId("appointment-search-input")).toBeVisible();
  await expect(page.getByTestId("appointment-row").first()).toBeVisible();
});
