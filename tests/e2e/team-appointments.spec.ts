import { authenticate, expect, test } from "./fixtures/app-fixture";

test.describe("Team Appointments & Scheduling", () => {
  test.beforeEach(async ({ page, psmsApi }) => {
    await authenticate(page);
    psmsApi.setPayload({
      teams: [
        { id: "11111111-1111-4111-8111-111111111111", name: "Engineering Team", description: "Core eng team", role: "OWNER", memberCount: 2 }
      ],
      appointments: []
    });
  });

  test("TM-APPT-01: create a team appointment", async ({ page }) => {
    await page.goto("/appointments");
    await page.getByRole("tab", { name: "Team" }).click();
    
    await page.getByTestId("page-team-select-trigger").click();
    await page.getByRole("option", { name: "Engineering Team" }).click();
    
    await page.getByTestId("appointment-create-trigger").click();
    
    await page.getByTestId("form-team-select-trigger").click();
    await page.getByRole("option", { name: "Engineering Team" }).click();
    
    await page.getByTestId("team-appointment-title").fill("Sync Meeting");
    for (const [id, val] of [["team-appointment-start", "2030-03-28T10:00"], ["team-appointment-end", "2030-03-28T11:00"]]) {
      await page.getByTestId(id).evaluate((el: HTMLInputElement, v) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
        setter.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
      }, val);
    }
    
    // Wait for debounce and button enablement
    const saveBtn = page.getByTestId("team-appointment-save");
    await expect(saveBtn).toBeEnabled();
    await page.waitForTimeout(500); // Extra buffer

    const responsePromise = page.waitForResponse(r => r.url().includes("/appointments") && r.request().method() === "POST");
    await saveBtn.click();
    await responsePromise;

    await expect(page.getByText("Sync Meeting")).toBeVisible();
  });

  test("TM-APPT-02: show collaborative conflict feedback with suggestions", async ({ page }) => {
    await page.goto("/appointments");
    await page.getByRole("tab", { name: "Team" }).click();
    
    await page.getByTestId("page-team-select-trigger").click();
    await page.getByRole("option", { name: "Engineering Team" }).click();
    
    await page.getByTestId("appointment-create-trigger").click();
    
    await page.getByTestId("form-team-select-trigger").click();
    await page.getByRole("option", { name: "Engineering Team" }).click();
    
    await page.getByTestId("team-appointment-title").fill("Conflict Meeting");
    
    // Set a conflicting time (mocked in psms-api.ts as 2030-03-29T10:00:00)
    const conflictResponsePromise = page.waitForResponse(r => r.url().includes("/check-conflicts") && r.request().method() === "POST");
    for (const [id, val] of [["team-appointment-start", "2030-03-29T10:00"], ["team-appointment-end", "2030-03-29T11:00"]]) {
      await page.getByTestId(id).evaluate((el: HTMLInputElement, v) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
        setter.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
      }, val);
    }
    
    await page.waitForTimeout(600); // Wait for 500ms debounce + buffer
    await conflictResponsePromise;

    // Wait for conflict check
    await expect(page.getByTestId("conflict-alert")).toBeVisible();
    await expect(page.getByTestId("conflict-alert")).toContainText("Co-worker has a conflict");
    
    // Check for suggestions
    await expect(page.getByTestId("conflict-suggested-slot").first()).toBeVisible();
    
    // Click a suggestion to fix the conflict
    await page.getByTestId("conflict-suggested-slot").first().click();
    
    // Alert should disappear or change to "No conflicts"
    await expect(page.getByTestId("conflict-alert")).toBeHidden();
    await expect(page.getByText("Everyone is available")).toBeVisible();
  });

  test("TM-APPT-03: update a team appointment", async ({ page, psmsApi }) => {
    psmsApi.setPayload({
      teams: [
        { id: "11111111-1111-4111-8111-111111111111", name: "Engineering Team", description: "Core eng team", role: "OWNER", memberCount: 2 }
      ],
      appointments: [
        {
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          userId: "33333333-3333-4333-8333-333333333333",
          seriesId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          teamId: "11111111-1111-4111-8111-111111111111",
          organizerId: "33333333-3333-4333-8333-333333333333",
          title: "Initial Sync",
          description: null,
          startAt: "2030-03-30T10:00:00.000Z",
          endAt: "2030-03-30T11:00:00.000Z",
          isRecurringInstance: false,
          recurrenceType: "ONETIME",
          status: "SCHEDULED",
          jobId: null,
          tags: [],
          location: null,
          createdAt: "2030-03-29T10:00:00.000Z",
          updatedAt: "2030-03-29T10:00:00.000Z",
        }
      ]
    });

    await page.goto("/appointments");
    await page.getByRole("tab", { name: "Team" }).click();
    
    await page.getByTestId("page-team-select-trigger").click();
    await page.getByRole("option", { name: "Engineering Team" }).click();
    
    const editBtn = page.getByTestId("team-appointment-edit").first();
    await editBtn.click();
    
    await page.getByTestId("team-appointment-title").fill("Updated Sync");
    
    // Wait for enablement
    const saveBtn = page.getByTestId("team-appointment-save");
    await expect(saveBtn).toBeEnabled();
    await page.waitForTimeout(500); // Extra buffer

    const responsePromise = page.waitForResponse(r => r.url().includes("/appointments/") && r.request().method() === "PATCH");
    await saveBtn.click();
    await responsePromise;

    await expect(page.getByText("Updated Sync")).toBeVisible();
  });

  test("TM-APPT-04: delete a team appointment", async ({ page, psmsApi }) => {
    psmsApi.setPayload({
      teams: [
        { id: "11111111-1111-4111-8111-111111111111", name: "Engineering Team", description: "Core eng team", role: "OWNER", memberCount: 2 }
      ],
      appointments: [
        {
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          userId: "33333333-3333-4333-8333-333333333333",
          seriesId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          teamId: "11111111-1111-4111-8111-111111111111",
          organizerId: "33333333-3333-4333-8333-333333333333",
          title: "To Delete",
          description: null,
          startAt: "2030-03-30T10:00:00.000Z",
          endAt: "2030-03-30T11:00:00.000Z",
          isRecurringInstance: false,
          recurrenceType: "ONETIME",
          status: "SCHEDULED",
          jobId: null,
          tags: [],
        }
      ]
    });

    await page.goto("/appointments");
    await page.getByRole("tab", { name: "Team" }).click();
    
    await page.getByTestId("page-team-select-trigger").click();
    await page.getByRole("option", { name: "Engineering Team" }).click();
    
    await page.getByTestId("team-appointment-delete").first().click();
    await page.getByTestId("team-appointment-delete-confirm").click();

    // Confirm the appt is gone from the team list
    await expect(page.getByTestId("appointments-page").getByText("To Delete")).not.toBeVisible();
  });
});

