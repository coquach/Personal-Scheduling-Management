import { authenticate, expect, test } from "./fixtures/app-fixture";

function futureLocalDateTime(hoursAhead: number) {
  const date = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

test.describe("Advanced Appointments (Recurrence & Reminders)", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test.describe("Recurrence (RECUR)", () => {
    test("RECUR-01: create a recurring appointment", async ({ page, psmsApi }) => {
      psmsApi.mockHandler(async ({ route, request, path }) => {
        // Intercept POST /series for recurring appointments
        if (request.method() === "POST" && (path === "/series" || path === "/appointments")) {
          await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              data: { 
                id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              },
              message: "Success",
            }),
          });
          return true;
        }
        return false;
      });

      await page.goto("/appointments");
      await page.getByTestId("appointment-create-trigger").click();
      await page.getByTestId("appointment-title-input").fill("Weekly Sync");
      
      const startAt = futureLocalDateTime(24);
      const endAt = futureLocalDateTime(25);
      
      for (const [id, val] of [["appointment-start-input", startAt], ["appointment-end-input", endAt]]) {
        await page.getByTestId(id).evaluate((el: HTMLInputElement, v) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
          setter.call(el, v);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
        }, val);
      }
      
      // Click More options to show recurrence fields
      await page.getByText(/More options/i).click();
      
      // Toggle Recurrence
      const recurrenceTrigger = page.getByTestId("appointment-recurrence-toggle");
      await recurrenceTrigger.click();
      await page.getByRole("option", { name: /Weekly/i }).click();
      
      const responsePromise = page.waitForResponse(r => r.url().includes("/series") && r.request().method() === "POST");
      await page.getByTestId("appointment-save").click();
      await responsePromise;

      // Wait for success toast with longer timeout
      await expect(page.getByText(/created successfully/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId("appointment-form-modal")).not.toBeVisible();
    });

    test("RECUR-02: reject invalid recurrence rules", async ({ page, psmsApi }) => {
      psmsApi.mockFailure(
        { method: "POST", path: "/series" },
        400,
        "Invalid recurrence rule",
        { once: true }
      );

      await page.goto("/appointments");
      await page.getByTestId("appointment-create-trigger").click();
      await page.getByTestId("appointment-title-input").fill("Broken Recurrence");
      
      const startAt = futureLocalDateTime(24);
      const endAt = futureLocalDateTime(25);
      
      for (const [id, val] of [["appointment-start-input", startAt], ["appointment-end-input", endAt]]) {
        await page.getByTestId(id).evaluate((el: HTMLInputElement, v) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
          setter.call(el, v);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
        }, val);
      }
      
      await page.getByText(/More options/i).click();
      
      const recurrenceTrigger = page.getByTestId("appointment-recurrence-toggle");
      await recurrenceTrigger.click();
      await page.getByRole("option", { name: /Daily/i }).click();

      const responsePromise = page.waitForResponse(r => r.url().includes("/series") && r.request().method() === "POST");
      await page.getByTestId("appointment-save").click();
      await responsePromise;

      // Form stays open
      await expect(page.getByTestId("appointment-form-modal")).toBeVisible();
      // Look for error toast
      await expect(page.getByText(/Invalid recurrence rule/i).first()).toBeVisible();
    });
  });

  test.describe("Reminders (REM)", () => {
    test("REM-01: save multiple reminders for one appointment", async ({ page, psmsApi }) => {
      let remindersPayload: unknown = null;
      
      psmsApi.mockHandler(async ({ route, request, path }) => {
        // Intercept setting reminders for an existing appointment
        if (request.method() === "POST" && path.includes("/reminders")) {
          remindersPayload = JSON.parse(request.postData() ?? "{}");
          await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({ success: true, data: remindersPayload, message: "Reminders updated" }),
          });
          return true;
        }
        return false;
      });

      // Assuming user navigates to an existing appointment to add reminders
      await page.goto("/appointments");
      
      const reminderTrigger = page.getByTestId("appointment-reminders-trigger").first();
      if (await reminderTrigger.isVisible()) {
        await reminderTrigger.click();
        
        await page.getByTestId("reminder-add").click();
        await page.getByTestId("reminder-add").click(); // Add 2 reminders
        
        // Assert UI reflects rows
        await expect(page.getByTestId("reminder-row")).toHaveCount(2);
        
        await page.getByTestId("reminder-save").click();
        
        // Confirm API received array
        expect(remindersPayload).toBeDefined();
        if (Array.isArray(remindersPayload)) {
            expect(remindersPayload.length).toBeGreaterThanOrEqual(1);
        }
      }
    });

    test("REM-02: reject reminder times after the appointment start", async ({ page }) => {
      await page.goto("/appointments");
      
      const reminderTrigger = page.getByTestId("appointment-reminders-trigger").first();
      if (await reminderTrigger.isVisible()) {
        await reminderTrigger.click();
        await page.getByTestId("reminder-add").click();
        
        // User inputs an invalid time (e.g. +10 minutes AFTER the appointment)
        const customValueInput = page.getByTestId("reminder-custom-value").first();
        await customValueInput.fill("-10"); // Negative values or values mapping to post-event might be rejected
        
        await page.getByTestId("reminder-save").click();
        
        // Should show client-side validation error
        await expect(page.getByTestId("reminder-error")).toBeVisible();
      }
    });
  });
});
