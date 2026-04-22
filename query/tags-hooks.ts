"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/query/keys";
import {
  createTag,
  deleteTag,
  getTags,
  updateTag,
} from "@/services/tags.service";

type MutationCallbacks = {
  onSuccess?: () => void | Promise<void>;
  onError?: (error: unknown) => void;
};

export function useTagsQuery() {
  return useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: getTags,
  });
}

export function useCreateTagMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tags.all,
      });
      await callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}

export function useUpdateTagMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tagId,
      payload,
    }: {
      tagId: string;
      payload: { name?: string; color?: string };
    }) => updateTag(tagId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tags.all,
      });
      await callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}

export function useDeleteTagMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tags.all,
      });
      await callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
