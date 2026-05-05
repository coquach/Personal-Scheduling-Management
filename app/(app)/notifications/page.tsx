"use client";

import { useMemo, useState } from "react";

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
import type { NotificationItem } from "@/model/notification.model";

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
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const notificationsQuery = useNotificationsQuery();

  const markReadMutation = useMarkNotificationReadMutation({
    onSuccess: () => {
      setErrorMessage(null);
      setFeedbackMessage("Notification marked as read.");
    },
    onError: (error) => {
      setFeedbackMessage(null);
      setErrorMessage(getApiErrorMessage(error, "Unable to update notification."));
    },
  });

  const markAllReadMutation = useMarkAllNotificationsReadMutation({
    onSuccess: () => {
      setErrorMessage(null);
      setFeedbackMessage("All notifications are marked as read.");
    },
    onError: (error) => {
      setFeedbackMessage(null);
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
    setFeedbackMessage(null);
    markReadMutation.mutate(notificationId);
  }

  function handleMarkAllRead() {
    setErrorMessage(null);
    setFeedbackMessage(null);
    markAllReadMutation.mutate();
  }

  return (
    <div data-testid="notifications-page" className="space-y-6">
      <PageSection
        title="Notifications"
        description="A calm feed for due reminders, unread updates and quick actions."
        actions={
          <>
            <Button
              variant="outline"
              data-testid="notification-filter"
              onClick={() => setShowUnreadOnly((value) => !value)}
            >
              {showUnreadOnly ? "Show all" : "Unread only"}
            </Button>
            <Button
              variant="outline"
              data-testid="notification-mark-all-read"
              disabled={markAllReadMutation.isPending || unreadCount === 0}
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </Button>
            <Button data-testid="notification-clear-all" disabled title="Not supported yet by backend API">
              Clear all
            </Button>
          </>
        }
      >
        {errorMessage ? (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
        {feedbackMessage ? (
          <Alert>
            <AlertDescription>{feedbackMessage}</AlertDescription>
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
