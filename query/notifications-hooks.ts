"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { NotificationListResponse } from "@/model/notification.model";
import { queryKeys } from "@/query/keys";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notification.service";

type MutationCallbacks = {
  onSuccess?: () => void | Promise<void>;
  onError?: (error: unknown) => void;
};

export function useNotificationsQuery() {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: getNotifications,
  });
}

export function useUnreadNotificationCount() {
  const notificationsQuery = useNotificationsQuery();
  const unreadCount =
    notificationsQuery.data?.filter((item) => item.status === "UNREAD").length ?? 0;

  return {
    ...notificationsQuery,
    unreadCount,
  };
}

export function useMarkNotificationReadMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.notifications.all,
      });

      const previousNotifications = queryClient.getQueryData<NotificationListResponse>(
        queryKeys.notifications.all,
      );

      queryClient.setQueryData<NotificationListResponse>(
        queryKeys.notifications.all,
        (current) =>
          (current ?? []).map((item) =>
            item.id === notificationId
              ? {
                  ...item,
                  status: "READ",
                  readAt: item.readAt ?? new Date().toISOString(),
                }
              : item,
          ),
      );

      return { previousNotifications };
    },
    onSuccess: async () => {
      await callbacks?.onSuccess?.();
    },
    onError: (error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          queryKeys.notifications.all,
          context.previousNotifications,
        );
      }
      callbacks?.onError?.(error);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
}

export function useMarkAllNotificationsReadMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.notifications.all,
      });

      const previousNotifications = queryClient.getQueryData<NotificationListResponse>(
        queryKeys.notifications.all,
      );

      queryClient.setQueryData<NotificationListResponse>(
        queryKeys.notifications.all,
        (current) =>
          (current ?? []).map((item) => ({
            ...item,
            status: "READ",
            readAt: item.readAt ?? new Date().toISOString(),
          })),
      );

      return { previousNotifications };
    },
    onSuccess: async () => {
      await callbacks?.onSuccess?.();
    },
    onError: (error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          queryKeys.notifications.all,
          context.previousNotifications,
        );
      }
      callbacks?.onError?.(error);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
}
