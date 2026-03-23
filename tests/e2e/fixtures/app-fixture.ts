import { test as base, expect } from "@playwright/test";
import { mockPsmsApi } from "../mocks/psms-api";

export const test = base.extend({
  page: async ({ page }, runWithPage) => {
    await mockPsmsApi(page);
    await runWithPage(page);
  },
});

export { expect };
