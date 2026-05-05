"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type NotificationSideCardsProps = {
  unreadCount: number;
};

export function NotificationSideCards({ unreadCount }: NotificationSideCardsProps) {
  return (
    <div className="space-y-6">
      <Card data-testid="notification-popup">
        <CardHeader>
          <CardTitle>Popup preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[16px] border border-primary/20 bg-[#e8f0fe] p-4">
            <p className="font-medium text-[#174ea6]">Push preview comes from Firebase payload</p>
            <p className="mt-1 text-sm text-[#174ea6]/80">
              Foreground push now refreshes this page automatically.
            </p>
          </div>
          <Button variant="outline" data-testid="notification-popup-snooze">
            Snooze action (phase 5)
          </Button>
        </CardContent>
      </Card>
      <Card data-testid="notification-empty-state">
        <CardHeader>
          <CardTitle>Quiet mode</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          Unread: {unreadCount}. Use Mark all as read to clear the badge.
        </CardContent>
      </Card>
    </div>
  );
}

