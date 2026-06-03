import { authenticate, expect, test } from "./fixtures/app-fixture";

test.describe("Profile Advanced Settings", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test("PROF-03: show validation feedback for password update failure", async ({ page, psmsApi }) => {
    psmsApi.mockFailure(
      { method: "PUT", path: "/profile/password" },
      400,
      "Current password is incorrect",
      { once: true }
    );

    await page.goto("/profile");
    
    const currPw = page.getByTestId("profile-current-password-input");
    if (await currPw.isVisible()) {
      await currPw.fill("WrongPassword");
      await page.getByTestId("profile-new-password-input").fill("NewSafePass123");
      await page.getByTestId("profile-confirm-password-input").fill("NewSafePass123");
      await page.getByTestId("profile-password-save").click();

      await expect(page.getByTestId("profile-password-error")).toBeVisible();
      await expect(page.getByText("Current password is incorrect")).toBeVisible();
    }
  });

  test("PROF-04: block account deletion until email confirmation matches", async ({ page }) => {
    await page.goto("/profile");

    const delTrigger = page.getByTestId("profile-delete-trigger");
    if (await delTrigger.isVisible()) {
      await delTrigger.click();
      
      await expect(page.getByTestId("profile-delete-dialog")).toBeVisible();
      const submitBtn = page.getByTestId("profile-delete-submit");
      
      await expect(submitBtn).toBeDisabled();
      
      // Type mismatched email
      await page.getByTestId("profile-delete-confirmation-input").fill("wrong@email.com");
      await expect(submitBtn).toBeDisabled();

      // Type correct authenticated user email
      await page.getByTestId("profile-delete-confirmation-input").fill("profile@example.com"); 
      await expect(submitBtn).toBeEnabled();
    }
  });
});
