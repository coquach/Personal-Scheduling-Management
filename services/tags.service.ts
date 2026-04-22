import { browserApiRequest } from "@/lib/browser-api";

export type Tag = {
  id: string;
  name: string;
  color: string | null;
};

export type CreateTagInput = {
  name: string;
  color?: string;
};

export type UpdateTagInput = {
  name?: string;
  color?: string;
};

export async function getTags() {
  return browserApiRequest<Tag[]>("/tags");
}

export async function createTag(input: CreateTagInput) {
  return browserApiRequest<Tag>("/tags", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTag(tagId: string, input: UpdateTagInput) {
  return browserApiRequest<Tag>(`/tags/${tagId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteTag(tagId: string) {
  return browserApiRequest<{ message: string }>(`/tags/${tagId}`, {
    method: "DELETE",
  });
}
