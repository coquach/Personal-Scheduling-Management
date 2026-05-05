import { describe, expect, it } from "@jest/globals";

import { queryKeys } from "@/query/keys";

describe("query keys", () => {
  it("builds appointments list key with filters", () => {
    const key = queryKeys.appointments.list({ page: "2", limit: "20" });
    expect(key).toEqual(["appointments", "list", { page: "2", limit: "20" }]);
  });

  it("builds export preview key with optional filters", () => {
    const key = queryKeys.export.preview({
      status: "SCHEDULED",
      from: undefined,
    });
    expect(key).toEqual([
      "export",
      "preview",
      { status: "SCHEDULED", from: undefined },
    ]);
  });
});

