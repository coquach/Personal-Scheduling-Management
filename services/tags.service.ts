import { browserApiRequest } from "@/lib/api-client";
import {
  createTagInputSchema,
  deleteTagResponseSchema,
  tagListResponseSchema,
  tagSchema,
  updateTagInputSchema,
  type CreateTagInput,
  type Tag,
  type UpdateTagInput,
} from "@/model/tags";

export async function getTags(): Promise<Tag[]> {
  const raw = await browserApiRequest<unknown>("/tags");
  return tagListResponseSchema.parse(raw);
}

export async function createTag(input: CreateTagInput): Promise<Tag> {
  const parsedInput = createTagInputSchema.parse(input);
  const raw = await browserApiRequest<unknown>("/tags", {
    method: "POST",
    body: JSON.stringify(parsedInput),
  });
  return tagSchema.parse(raw);
}

export async function updateTag(
  tagId: string,
  input: UpdateTagInput,
): Promise<Tag> {
  const parsedInput = updateTagInputSchema.parse(input);
  const raw = await browserApiRequest<unknown>(`/tags/${tagId}`, {
    method: "PATCH",
    body: JSON.stringify(parsedInput),
  });
  return tagSchema.parse(raw);
}

export async function deleteTag(tagId: string) {
  const raw = await browserApiRequest<unknown>(`/tags/${tagId}`, {
    method: "DELETE",
  });
  return deleteTagResponseSchema.parse(raw);
}
