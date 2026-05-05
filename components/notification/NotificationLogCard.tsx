"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NotificationItem } from "@/model/notification.model";

type NotificationLogCardProps = {
  isLoading: boolean;
  isError: boolean;
  queryError: unknown;
  notifications: NotificationItem[];
  markReadPending: boolean;
  onMarkRead: (notificationId: string) => void;
  getApiErrorMessage: (error: unknown, fallback?: string) => string;
  formatDateTime: (value: string) => string;
  getNotificationTitle: (notification: NotificationItem) => string;
};

export function NotificationLogCard({
  isLoading,
  isError,
  queryError,
  notifications,
  markReadPending,
  onMarkRead,
  getApiErrorMessage,
  formatDateTime,
  getNotificationTitle,
}: NotificationLogCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification log</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Alert>
            <AlertDescription>Loading notifications...</AlertDescription>
          </Alert>
        ) : null}
        {isError ? (
          <Alert variant="destructive">
            <AlertDescription>
              {getApiErrorMessage(queryError, "Unable to load notifications.")}
            </AlertDescription>
          </Alert>
        ) : null}
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className="flex flex-col gap-3 rounded-[16px] border border-border bg-background p-4"
            data-testid={index === 0 ? "notification-log-row" : undefined}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">
                  {getNotificationTitle(notification)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(notification.createdAt)}
                </p>
              </div>
              <Badge
                data-testid={index === 0 ? "notification-status" : undefined}
                className="rounded-md"
              >
                {notification.status}
              </Badge>
            </div>
            {notification.status === "UNREAD" ? (
              <div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={markReadPending}
                  onClick={() => onMarkRead(notification.id)}
                >
                  Mark read
                </Button>
              </div>
            ) : null}
          </div>
        ))}
        {!isLoading && !isError && notifications.length === 0 ? (
          <div className="rounded-[16px] border border-border bg-background p-4 text-sm text-muted-foreground">
            No notifications found.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

