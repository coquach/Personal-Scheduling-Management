"use client";

import { notificationRows } from "@/lib/scaffold-data";
import { PageSection } from "@/components/layout/page-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <div data-testid="notifications-page" className="space-y-6">
      <PageSection
        title="Notifications"
        description="A calm feed for due reminders, unread updates and quick actions."
        actions={
          <>
            <Button variant="outline" data-testid="notification-filter">
              Filter
            </Button>
            <Button variant="outline" data-testid="notification-mark-all-read">
              Mark all as read
            </Button>
            <Button data-testid="notification-clear-all">Clear all</Button>
          </>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Notification log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notificationRows.map((notification, index) => (
                <div
                  key={notification.id}
                  className="flex flex-col gap-3 rounded-[16px] border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                  data-testid={index === 0 ? "notification-log-row" : undefined}
                >
                  <div>
                    <p className="font-medium text-foreground">{notification.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.channel} at {notification.time}
                    </p>
                  </div>
                  <Badge
                    data-testid={index === 0 ? "notification-status" : undefined}
                    className="rounded-md"
                  >
                    {notification.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card data-testid="notification-popup">
              <CardHeader>
                <CardTitle>Popup preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[16px] border border-primary/20 bg-[#e8f0fe] p-4">
                  <p className="font-medium text-[#174ea6]">Team Standup starts in 10 minutes</p>
                  <p className="mt-1 text-sm text-[#174ea6]/80">
                    Confirm your notes and join from the linked room.
                  </p>
                </div>
                <Button variant="outline" data-testid="notification-popup-snooze">
                  Snooze 10 min
                </Button>
              </CardContent>
            </Card>
            <Card data-testid="notification-empty-state">
              <CardHeader>
                <CardTitle>Quiet mode</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                When you are caught up, this panel becomes the empty state for your notification feed.
              </CardContent>
            </Card>
          </div>
        </div>
      </PageSection>
    </div>
  );
}
