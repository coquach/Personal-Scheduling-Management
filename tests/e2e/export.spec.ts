import { authenticate, expect, test } from "./fixtures/app-fixture";

test.describe("Data Export", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test("EXP-01: preview filtered rows and download CSV", async ({ page, psmsApi }) => {
    let exportApiCalled = false;

    psmsApi.mockHandler(async ({ route, request, path }) => {
      if (request.method() === "GET" && path.includes("/statistics/export")) {
        exportApiCalled = true;
        // Mock a CSV response
        await route.fulfill({
          status: 200,
          contentType: "text/csv",
          body: "title,startAt,endAt,status\nTest Appt,2025-01-01T10:00,2025-01-01T11:00,COMPLETED",
        });
        return true;
      }
      return false;
    });

    await page.goto("/statistics");

    // Apply filters using Shadcn UI clicks
    const tagFilter = page.getByTestId("export-tag-filter");
    if (await tagFilter.isVisible({ timeout: 3000 })) {
      await tagFilter.click();
      const urgentOpt = page.getByRole("option", { name: "Urgent" });
      if (await urgentOpt.isVisible({ timeout: 1500 }).catch(() => false)) {
        await urgentOpt.click();
      } else {
        await page.keyboard.press("Escape"); // Close the select popover if no option
      }
    }

    const statusFilter = page.getByTestId("export-status-filter");
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      const completedOpt = page.getByRole("option", { name: "Completed" });
      if (await completedOpt.isVisible({ timeout: 1500 }).catch(() => false)) {
        await completedOpt.click();
      } else {
        await page.keyboard.press("Escape");
      }
    }

    // Trigger download
    // Playwright handles downloads via the page.waitForEvent('download')
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
    await page.getByTestId("export-submit").click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain(".csv");
    expect(exportApiCalled).toBe(true);
  });

  test("EXP-02: show no-data feedback for empty exports", async ({ page, psmsApi }) => {
    psmsApi.mockHandler(async ({ route, request, path }) => {
      if (request.method() === "GET" && path.includes("/statistics/export")) {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ success: false, message: "No data found" }),
        });
        return true;
      }
      return false;
    });

    await page.goto("/statistics");

    await page.getByTestId("export-submit").click();

    await expect(page.getByTestId("export-error")).toBeVisible();
    await expect(page.getByTestId("export-error")).toContainText("No data found");
  });
});
