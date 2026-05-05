import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("tags.service", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("fetches tags list from /tags", async () => {
    const browserApiRequest = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValueOnce([
      { id: "tag-1", name: "Work", color: "#1a73e8" },
    ]);

    jest.doMock("@/lib/api-client", () => ({
      browserApiRequest,
    }));

    const { getTags } = await import("@/services/tags.service");
    const result = await getTags();

    expect(browserApiRequest).toHaveBeenCalledWith("/tags");
    expect(result).toHaveLength(1);
  });

  it("creates, updates and deletes tag with expected methods", async () => {
    const browserApiRequest = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValueOnce({ id: "tag-2", name: "Health", color: "#34a853" })
      .mockResolvedValueOnce({ id: "tag-2", name: "Health+", color: "#34a853" })
      .mockResolvedValueOnce({ message: "Deleted" });

    jest.doMock("@/lib/api-client", () => ({
      browserApiRequest,
    }));

    const { createTag, updateTag, deleteTag } = await import(
      "@/services/tags.service"
    );

    await createTag({ name: "Health", color: "#34a853" });
    await updateTag("tag-2", { name: "Health+" });
    await deleteTag("tag-2");

    expect(browserApiRequest).toHaveBeenNthCalledWith(1, "/tags", {
      method: "POST",
      body: JSON.stringify({ name: "Health", color: "#34a853" }),
    });
    expect(browserApiRequest).toHaveBeenNthCalledWith(2, "/tags/tag-2", {
      method: "PATCH",
      body: JSON.stringify({ name: "Health+" }),
    });
    expect(browserApiRequest).toHaveBeenNthCalledWith(3, "/tags/tag-2", {
      method: "DELETE",
    });
  });
});
