'use client';

import {
  CalendarClockIcon,
  SettingsIcon,
  CheckIcon,
  BellIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { NotificationItem } from '@/model/notification';

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
  resolveNotificationLink: (notification: NotificationItem) => string;
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
  resolveNotificationLink,
}: NotificationLogCardProps) {
  return (
    <Card className="border-border/50 shadow-sm transition-all h-full bg-card/60 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Notification feed</CardTitle>
        <CardDescription>
          All your latest updates and reminders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Alert className="rounded-2xl shadow-sm animate-pulse">
            <AlertDescription>Loading notifications...</AlertDescription>
          </Alert>
        ) : null}

        {isError ? (
          <Alert
            variant="destructive"
            className="rounded-2xl shadow-sm border-destructive/20 bg-destructive/5"
          >
            <AlertDescription className="font-medium">
              {getApiErrorMessage(queryError, 'Unable to load notifications.')}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-3">
          {notifications.map((notification, index) => {
            const isReminder = notification.type === 'REMINDER';
            const isUnread = notification.status === 'UNREAD';

            return (
              <Link
                href={resolveNotificationLink(notification)}
                key={notification.id}
                className={`group flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300 hover:shadow-md animate-in slide-in-from-top-2 fade-in ${
                  isUnread
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border/50 bg-background/50'
                }`}
                data-testid={index === 0 ? 'notification-log-row' : undefined}
              >
                <div
                  className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform group-hover:scale-110 ${
                    isReminder
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {isReminder ? (
                    <CalendarClockIcon className="size-5" />
                  ) : (
                    <SettingsIcon className="size-5" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-foreground leading-none">
                      {getNotificationTitle(notification)}
                    </p>
                    {isUnread && (
                      <Badge
                        variant="default"
                        className="rounded-full shadow-sm px-2 text-[10px] uppercase tracking-wider font-bold"
                        data-testid={
                          index === 0 ? 'notification-status' : undefined
                        }
                      >
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-snug max-w-[90%]">
                    {notification.message}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground/70 pt-1">
                    {formatDateTime(notification.createdAt)}
                  </p>
                </div>

                {isUnread && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="size-8 text-primary hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
                      disabled={markReadPending}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onMarkRead(notification.id);
                      }}
                      title="Mark as read"
                    >
                      <CheckIcon className="size-4" />
                    </Button>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {!isLoading && !isError && notifications.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
              <BellIcon className="size-8" />
            </div>
            <p className="font-semibold text-foreground text-lg">
              All caught up!
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-[250px]">
              You have no new notifications to show right now.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
