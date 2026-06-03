import { authenticate, expect, test } from "./fixtures/app-fixture";

test.describe("Tags Management", () => {
  test.beforeEach(async ({ page, psmsApi }) => {
    await authenticate(page);
    psmsApi.setPayload({ tags: [] });
  });

  test("TAG-01: create a tag with color preview", async ({ page }) => {
    await page.goto("/tags");
    
    await page.getByTestId("tag-name-input").fill("Urgent");
    await page.getByTestId("tag-color-input").fill("#EF4444");
    
    // Ensure preview is visible before saving
    await expect(page.getByTestId("tag-preview")).toBeVisible();
    await page.getByTestId("tag-save").click();

    // Verification
    await expect(page.getByText("Urgent")).toBeVisible();
    await expect(page.getByTestId("tag-item")).toHaveCount(1);
  });

  test("TAG-02: reject duplicate tag names", async ({ page, psmsApi }) => {
    psmsApi.mockFailure(
      { method: "POST", path: "/tags" },
      400,
      "Tag name already exists",
      { once: true }
    );

    await page.goto("/tags");
    await page.getByTestId("tag-name-input").fill("Duplicate Tag");
    await page.getByTestId("tag-color-input").fill("#000000");
    await page.getByTestId("tag-save").click();

    await expect(page.getByText("Tag name already exists").first()).toBeVisible();
  });
});

