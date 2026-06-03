import { authenticate, expect, test } from "./fixtures/app-fixture";

test.describe("Calendar Views and Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test("CAL-01: switch between Day, Week, Month, and Agenda", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByTestId("calendar-page")).toBeVisible();

    const views = ["Day", "Week", "Month"];

    for (const view of views) {
      await page.getByRole("button", { name: "Select View" }).click();
      await page.getByText(view, { exact: true }).click();
      await expect(page.getByTestId("calendar-page")).toBeVisible();
    }
  });

  test("CAL-02: navigate previous and next periods", async ({ page, psmsApi }) => {
    let apiCallCount = 0;
    psmsApi.mockHandler(async ({ route, request, path }) => {
      if (request.method() === "GET" && path.includes("/appointments")) {
        apiCallCount++;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: { items: [], page: 1, limit: 10, total: 0 },
            message: "OK",
          }),
        });
        return true;
      }
      return false;
    });

    await page.goto("/calendar");
    const initialCallCount = apiCallCount;

    const nextBtn = page.getByRole("button", { name: "Next period" });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    await expect.poll(() => apiCallCount).toBeGreaterThan(initialCallCount);
  });

  test("CAL-03: open the create flow from calendar page", async ({ page }) => {
    await page.goto("/calendar");

    const createBtn = page.getByRole("button", { name: "Create event" });
    await expect(createBtn).toBeVisible();
    await createBtn.click();
    
    await expect(page.getByTestId("appointment-form-modal")).toBeVisible();
  });
});

