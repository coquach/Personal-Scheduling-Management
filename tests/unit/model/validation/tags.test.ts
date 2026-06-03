import { describe, expect, it } from "@jest/globals";

import {
  createTagInputSchema,
  tagSchema,
  updateTagInputSchema,
} from "@/model/tags";

describe("tags validation", () => {
  describe("tagSchema", () => {
    it("parses a valid tag", () => {
      const result = tagSchema.safeParse({
        id: "00000000-0000-4000-8000-000000000001",
        name: "Urgent",
        color: "#ff0000",
      });
      expect(result.success).toBe(true);
    });

    it("accepts null color", () => {
      const result = tagSchema.safeParse({
        id: "00000000-0000-4000-8000-000000000001",
        name: "Urgent",
        color: null,
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const result = tagSchema.safeParse({
        id: "00000000-0000-4000-8000-000000000001",
        name: "",
        color: null,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createTagInputSchema", () => {
    it("accepts valid create payload", () => {
      const result = createTagInputSchema.safeParse({
        name: "Work",
        color: "#0000ff",
      });
      expect(result.success).toBe(true);
    });

    it("accepts create without color (optional)", () => {
      const result = createTagInputSchema.safeParse({ name: "Personal" });
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const result = createTagInputSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });

    it("rejects name exceeding 100 chars", () => {
      const result = createTagInputSchema.safeParse({ name: "a".repeat(101) });
      expect(result.success).toBe(false);
    });
  });

  describe("updateTagInputSchema", () => {
    it("accepts partial update with only name", () => {
      const result = updateTagInputSchema.safeParse({ name: "Updated" });
      expect(result.success).toBe(true);
    });

    it("accepts partial update with only color", () => {
      const result = updateTagInputSchema.safeParse({ color: "#123456" });
      expect(result.success).toBe(true);
    });

    it("accepts empty object (no-op update)", () => {
      const result = updateTagInputSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("rejects empty name string", () => {
      const result = updateTagInputSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });
  });
});
