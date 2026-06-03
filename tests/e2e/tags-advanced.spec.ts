import { authenticate, expect, test } from "./fixtures/app-fixture";

test.describe("Tags Management - Advanced", () => {
  test.beforeEach(async ({ page, psmsApi }) => {
    await authenticate(page);
    psmsApi.setPayload({
      tags: [{ id: "11111111-1111-4111-8111-111111111111", name: "Old Name", color: "#000" }]
    });
  });

  test("TAG-03: rename a tag and propagate it", async ({ page }) => {
    await page.goto("/tags");

    const renameBtn = page.getByTestId("tag-rename-trigger").first();
    await expect(renameBtn).toBeVisible();
    await renameBtn.click();
    await page.getByTestId("tag-name-input").fill("New Name");
    await page.getByTestId("tag-save").click();

    // Confirm the tag list reflects the new name
    await expect(page.getByText("New Name")).toBeVisible();
  });

  test("TAG-04: delete a tag after confirmation", async ({ page }) => {
    await page.goto("/tags");

    const delBtn = page.getByTestId("tag-delete-trigger").first();
    await expect(delBtn).toBeVisible();
    await delBtn.click();
    const confirmBtn = page.getByRole("button", { name: "Sure?" });
    await expect(confirmBtn).toBeVisible();
    
    const responsePromise = page.waitForResponse(r => r.url().includes("/tags/") && r.request().method() === "DELETE");
    await confirmBtn.click();
    await responsePromise;

    // Confirm the tag is gone from the list
    await expect(page.getByText("Old Name")).not.toBeVisible();
  });
});


