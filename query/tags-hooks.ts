"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/query/keys";
import { createInvalidatingMutation, type MutationCallbacks } from "@/query/utils";
import {
  createTag,
  deleteTag,
  getTags,
  updateTag,
} from "@/services/tags.service";

export type { MutationCallbacks };

export function useTagsQuery() {
  return useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: getTags,
  });
}

export const useCreateTagMutation = createInvalidatingMutation(
  createTag,
  [queryKeys.tags.all]
);

export const useUpdateTagMutation = createInvalidatingMutation(
  ({ tagId, payload }: { tagId: string; payload: { name?: string; color?: string } }) =>
    updateTag(tagId, payload),
  [queryKeys.tags.all]
);

export const useDeleteTagMutation = createInvalidatingMutation(
  deleteTag,
  [queryKeys.tags.all]
);
