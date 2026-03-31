import { test as base, expect } from "@playwright/test";
import {
  mockPsmsApi,
  type PsmsApiMockController,
} from "../mocks/psms-api";

export const test = base.extend<{
  psmsApi: PsmsApiMockController;
}>({
  psmsApi: [
    async ({ page }, use) => {
      const controller = await mockPsmsApi(page);
      await use(controller);
    },
    { auto: true },
  ],
});

export async function authenticate(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem(
      "psms-auth-session",
      JSON.stringify({ refreshToken: "test-refresh-token" }),
    );
  });

  await page.context().addCookies([
    {
      name: "psms-authenticated",
      value: "1",
      domain: "127.0.0.1",
      path: "/",
      sameSite: "Lax",
      httpOnly: false,
      secure: false,
    },
  ]);
}

export { expect };
