"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";

export type MutationCallbacks<TData = unknown, TError = Error, TVariables = void, TContext = unknown> = {
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void | Promise<void>;
  onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void | Promise<void>;
};

export function createInvalidatingMutation<TData, TError = Error, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidateKeys: QueryKey[] | ((data: TData, variables: TVariables) => QueryKey[])
) {
  return function useInvalidatingMutation(callbacks?: MutationCallbacks<TData, TError, TVariables, TContext>) {
    const queryClient = useQueryClient();

    return useMutation<TData, TError, TVariables, TContext>({
      mutationFn,
      onSuccess: async (data, variables, context) => {
        const keysToInvalidate = typeof invalidateKeys === "function"
          ? invalidateKeys(data, variables)
          : invalidateKeys;

        await Promise.all(
          keysToInvalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
        );

        await callbacks?.onSuccess?.(data, variables, context);
      },
      onError: async (error, variables, context) => {
        await callbacks?.onError?.(error, variables, context);
      },
    });
  };
}
