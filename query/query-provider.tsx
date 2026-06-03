"use client";

import { QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage, BackendApiError } from "@/lib/api-core";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (error instanceof BackendApiError) {
                // Do not retry on client errors (400-499), except for timeouts or rate limits
                if (error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429) {
                  return false;
                }
              }
              return failureCount < 1;
            },
            refetchOnWindowFocus: false,
          },
        },
        mutationCache: new MutationCache({
          onError: (error) => {
            const message = getApiErrorMessage(error);
            toast.error(message);
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
