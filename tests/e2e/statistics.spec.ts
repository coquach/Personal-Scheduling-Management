import { authenticate, expect, test } from "./fixtures/app-fixture";

test.describe("Statistics Dashboard", () => {
  test.beforeEach(async ({ page, psmsApi }) => {
    await authenticate(page);
    psmsApi.setPayload({
      appointments: [
        { id: "11111111-1111-4111-8111-111111111111", userId: "33333333-3333-4333-8333-333333333333", status: "COMPLETED", seriesId: "22222222-2222-4222-8222-222222222222", teamId: null, organizerId: null, title: "A1", startAt: new Date().toISOString(), endAt: new Date().toISOString(), recurrenceType: "ONETIME", isRecurringInstance: false, description: null, tags: [], jobId: null },
        { id: "44444444-4444-4444-8444-444444444444", userId: "33333333-3333-4333-8333-333333333333", status: "SCHEDULED", seriesId: "55555555-5555-4555-8555-555555555555", teamId: null, organizerId: null, title: "A2", startAt: new Date().toISOString(), endAt: new Date().toISOString(), recurrenceType: "ONETIME", isRecurringInstance: false, description: null, tags: [], jobId: null }
      ]
    });
  });

  test("STAT-01 & STAT-02: render statistics and change the period", async ({ page }) => {
    await page.goto("/statistics");

    // Ensure the main cards render
    await expect(page.getByTestId("statistics-total-card")).toContainText("2");
    await expect(page.getByTestId("statistics-completed-card")).toContainText("1");
    await expect(page.getByTestId("statistics-completion-rate-card")).toContainText("50");

    await page.getByTestId("statistics-period-filter").click();
    await page.getByRole("option", { name: "Weekly" }).click();

    await expect(page.getByTestId("statistics-period-label")).toBeVisible();
    await expect(page.getByTestId("statistics-period-label")).toContainText(/week/i);
  });

  test("STAT-03: show the insufficient-data empty state", async ({ page, psmsApi }) => {
    psmsApi.setPayload({ appointments: [] });

    await page.goto("/statistics");
    await expect(page.getByTestId("statistics-empty-state")).toBeVisible();
    await expect(page.getByTestId("statistics-total-card")).not.toBeVisible();
  });
});

