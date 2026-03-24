import { test as base, expect } from "@playwright/test";
import { mockPsmsApi } from "../mocks/psms-api";

export const test = base.extend({
  page: async ({ page }, runWithPage) => {
    await mockPsmsApi(page);
    await runWithPage(page);
  },
});

export async function authenticate(page: import("@playwright/test").Page) {
  await page.context().addCookies([
    {
      name: "psms-session",
      value: "authenticated",
      domain: "127.0.0.1",
      path: "/",
      sameSite: "Lax",
      httpOnly: false,
      secure: false,
    },
  ]);
}

export { expect };
