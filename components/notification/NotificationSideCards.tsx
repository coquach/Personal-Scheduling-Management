'use client';

import { BellRingIcon, CheckCircle2Icon, InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type NotificationSideCardsProps = {
  unreadCount: number;
};

export function NotificationSideCards({
  unreadCount,
}: NotificationSideCardsProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-xl overflow-hidden relative">
        <div className="absolute -right-4 -top-4 size-24 rounded-full blur-3xl opacity-20 bg-primary pointer-events-none" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2Icon className="size-5 text-primary" />
            Status Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in">
            <div className="relative flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-3 shadow-inner">
              <BellRingIcon className="size-8" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background shadow-sm">
                  {unreadCount}
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-foreground">
              {unreadCount}
            </h3>
            <p className="text-sm font-semibold text-muted-foreground mt-1 uppercase tracking-wider">
              Unread Messages
            </p>
          </div>
        </CardContent>
      </Card>

      <Card
        data-testid="notification-popup"
        className="border-border/50 shadow-sm bg-card/60 backdrop-blur-xl"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <InfoIcon className="size-5 text-secondary-foreground" />
            Testing Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm animate-in slide-in-from-bottom-2 fade-in">
            <p className="font-semibold text-primary text-sm leading-none">
              Push payload test
            </p>
            <p className="mt-2 text-sm text-primary/80 leading-relaxed">
              Foreground pushes will automatically refresh the notification
              feed.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full rounded-xl shadow-sm transition-all hover:bg-muted"
            data-testid="notification-popup-snooze"
            disabled
          >
            Snooze test (Phase 5)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
