import { authenticate, expect, test } from "./fixtures/app-fixture";

test.describe("Appointments Management", () => {
  test.beforeEach(async ({ page, psmsApi }) => {
    await authenticate(page);
    const start = new Date(Date.now() + 3600000).toISOString();
    const end = new Date(Date.now() + 7200000).toISOString();
    psmsApi.setPayload({
      appointments: [
        { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", userId: "33333333-3333-4333-8333-333333333333", seriesId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", teamId: null, organizerId: null, title: "Review", status: "SCHEDULED", startAt: start, endAt: end, recurrenceType: "ONETIME", isRecurringInstance: false, description: null, tags: [], jobId: null }
      ]
    });
  });

  test("APPT-05 & APPT-08: update single appointment and toggle status", async ({ page }) => {
    await page.goto("/appointments");
    
    const editBtn = page.getByTestId("appointment-edit-trigger").first();
    await editBtn.click();
    await expect(page.getByTestId("appointment-form-modal")).toBeVisible();
    await page.getByTestId("appointment-title-input").fill("Updated Review");
    await page.getByTestId("appointment-save").click();
    
    // Wait for modal to hide
    await expect(page.getByTestId("appointment-form-modal")).not.toBeVisible();

    await expect(page.getByText("Updated Review")).toBeVisible();

    const statusBtn = page.getByTestId("appointment-status-trigger").first();
    await statusBtn.click();
    // Assuming it toggles to COMPLETED
    await expect(page.getByText("COMPLETED")).toBeVisible();
  });

  test("APPT-06 & APPT-07: prompt for recurrence scope on delete", async ({ page, psmsApi }) => {
    const start = new Date(Date.now() + 3600000).toISOString();
    const end = new Date(Date.now() + 7200000).toISOString();
    psmsApi.setPayload({
      appointments: [{ id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", userId: "33333333-3333-4333-8333-333333333333", seriesId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", teamId: null, organizerId: null, title: "Daily Standup", status: "SCHEDULED", startAt: start, endAt: end, recurrenceType: "DAILY", isRecurringInstance: true, description: null, tags: [], jobId: null }]
    });

    await page.goto("/appointments");
    
    // Update (No scope dialog for edit currently)
    await page.getByTestId("appointment-edit-trigger").first().click();
    await expect(page.getByTestId("appointment-form-modal")).toBeVisible();
    await page.getByTestId("appointment-save").click();
    await expect(page.getByTestId("appointment-form-modal")).not.toBeVisible();

    // Delete Scope
    await page.getByTestId("appointment-delete-trigger").first().click();
    await expect(page.getByTestId("appointment-delete-dialog")).toBeVisible();
    
    const deleteResponsePromise = page.waitForResponse(r => r.url().includes("/series/") && r.request().method() === "DELETE");
    const getResponsePromise = page.waitForResponse(r => r.url().includes("/appointments") && r.request().method() === "GET");
    await page.getByTestId("delete-confirm").click();
    await deleteResponsePromise;
    await getResponsePromise;
    
    await expect(page.getByTestId("appointment-delete-dialog")).not.toBeVisible();

    await expect(page.getByText("Daily Standup")).not.toBeVisible({ timeout: 10000 });
  });

  test("APPT-09, APPT-10, APPT-11: search, filter, empty state", async ({ page }) => {
    await page.goto("/appointments");
    
    // Search
    const searchInput = page.getByTestId("appointment-search-input");
    await searchInput.fill("Nothing matches this");
    await expect(page.getByTestId("appointment-empty-state")).toBeVisible();

    // Filter
    await searchInput.fill(""); // Clear search
    const filterStatus = page.getByTestId("filter-status-trigger");
    await filterStatus.click();
    await page.getByRole('option', { name: 'Completed' }).click();
    
    // Since our payload has 0 completed appts, it should show empty state
    await expect(page.getByTestId("appointment-empty-state")).toBeVisible();
  });

  test("APPT-13 & APPT-14: cancel and reopen appointments", async ({ page, psmsApi }) => {
    const start = new Date(Date.now() + 3600000).toISOString();
    const end = new Date(Date.now() + 7200000).toISOString();
    psmsApi.setPayload({
      appointments: [
        { id: "11111111-1111-4111-8111-111111111111", userId: "33333333-3333-4333-8333-333333333333", seriesId: "22222222-2222-4222-8222-222222222222", teamId: null, organizerId: null, title: "To Cancel", status: "SCHEDULED", startAt: start, endAt: end, recurrenceType: "ONETIME", isRecurringInstance: false, description: null, tags: [], jobId: null },
        { id: "44444444-4444-4444-8444-444444444444", userId: "33333333-3333-4333-8333-333333333333", seriesId: "55555555-5555-4555-8555-555555555555", teamId: null, organizerId: null, title: "To Reopen", status: "CANCELLED", startAt: start, endAt: end, recurrenceType: "ONETIME", isRecurringInstance: false, description: null, tags: [], jobId: null }
      ]
    });

    await page.goto("/appointments");
    
    await expect(page.getByText("To Cancel")).toBeVisible();
    await expect(page.getByText("To Reopen")).toBeVisible();
    
    await page.getByTestId("appointment-status-trigger").first().click();
    await page.getByTestId("appointment-cancel-trigger").click();
    await expect(page.getByText("CANCELLED")).toHaveCount(2); 

    await page.getByTestId("appointment-status-trigger").last().click();
    await page.getByTestId("appointment-reopen-trigger").click();
    await expect(page.getByText("SCHEDULED")).toHaveCount(1);
  });

  test("APPT-15: render missed appointment status", async ({ page, psmsApi }) => {
    const start = new Date(Date.now() + 3600000).toISOString();
    const end = new Date(Date.now() + 7200000).toISOString();
    psmsApi.setPayload({
      appointments: [{ id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", userId: "33333333-3333-4333-8333-333333333333", seriesId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", teamId: null, organizerId: null, title: "Missed Appt", status: "MISSED", startAt: start, endAt: end, recurrenceType: "ONETIME", isRecurringInstance: false, description: null, tags: [], jobId: null }]
    });

    await page.goto("/appointments");
    
    await expect(page.getByText("Missed Appt")).toBeVisible();
    await expect(page.getByTestId("appointment-status-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")).toContainText('MISSED');
  });
});

