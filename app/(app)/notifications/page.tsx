"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { NotificationLogCard } from "@/components/notification/NotificationLogCard";
import { NotificationSideCards } from "@/components/notification/NotificationSideCards";
import { PageSection } from "@/components/layout/page-section";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-core";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/query/notifications-hooks";
import type { NotificationItem } from "@/model/notification";

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getNotificationTitle(notification: NotificationItem) {
  if (notification.type === "REMINDER") {
    return "Appointment reminder";
  }

  return "System update";
}

export default function NotificationsPage() {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const notificationsQuery = useNotificationsQuery();

  const markReadMutation = useMarkNotificationReadMutation({
    onSuccess: () => {
      setErrorMessage(null);
      toast.success("Notification marked as read.");
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, "Unable to update notification."));
    },
  });

  const markAllReadMutation = useMarkAllNotificationsReadMutation({
    onSuccess: () => {
      setErrorMessage(null);
      toast.success("All notifications are marked as read.");
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, "Unable to update notifications."));
    },
  });

  const notifications = useMemo(() => {
    const items = notificationsQuery.data ?? [];

    if (!showUnreadOnly) {
      return items;
    }

    return items.filter((item) => item.status === "UNREAD");
  }, [notificationsQuery.data, showUnreadOnly]);

  const unreadCount =
    notificationsQuery.data?.filter((item) => item.status === "UNREAD").length ?? 0;

  function handleMarkRead(notificationId: string) {
    setErrorMessage(null);
    markReadMutation.mutate(notificationId);
  }

  function handleMarkAllRead() {
    setErrorMessage(null);
    markAllReadMutation.mutate();
  }

  return (
    <div data-testid="notifications-page" className="space-y-6">
      <PageSection
        title="Notifications"
        description="A calm feed for due reminders, unread updates and quick actions."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              data-testid="notification-filter"
              onClick={() => setShowUnreadOnly((value) => !value)}
              className="rounded-full shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              {showUnreadOnly ? "Show all" : "Unread only"}
            </Button>
            <Button
              variant="outline"
              data-testid="notification-mark-all-read"
              disabled={markAllReadMutation.isPending || unreadCount === 0}
              onClick={handleMarkAllRead}
              className="rounded-full shadow-sm transition-all"
            >
              Mark all as read
            </Button>
            <Button 
              data-testid="notification-clear-all" 
              disabled 
              title="Not supported yet by backend API"
              className="rounded-full shadow-sm opacity-50 cursor-not-allowed"
            >
              Clear all
            </Button>
          </div>
        }
      >
        {errorMessage ? (
          <Alert variant="destructive" className="rounded-2xl shadow-sm border-destructive/20 bg-destructive/5 animate-in slide-in-from-top-2 fade-in">
            <AlertDescription className="font-medium">{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <NotificationLogCard
            isLoading={notificationsQuery.isLoading}
            isError={notificationsQuery.isError}
            queryError={notificationsQuery.error}
            notifications={notifications}
            markReadPending={markReadMutation.isPending}
            onMarkRead={handleMarkRead}
            getApiErrorMessage={getApiErrorMessage}
            formatDateTime={formatDateTime}
            getNotificationTitle={getNotificationTitle}
          />
          <NotificationSideCards unreadCount={unreadCount} />
        </div>
      </PageSection>
    </div>
  );
}
