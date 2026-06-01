'use client';

import { BellRingIcon, CheckCircle2Icon, InfoIcon, SmartphoneIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { usePushNotification } from '@/hooks/use-push-notification';

type NotificationSideCardsProps = {
  unreadCount: number;
};

export function NotificationSideCards({
  unreadCount,
}: NotificationSideCardsProps) {
  const push = usePushNotification();

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

      <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <SmartphoneIcon className="size-5 text-primary" />
            Device Push
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between">
             <div className="space-y-1">
               <p className="font-semibold text-sm leading-none">Push Notifications</p>
               <p className="text-xs text-muted-foreground">Receive reminders on this device.</p>
             </div>
             <button
                type="button"
                role="switch"
                aria-checked={push.enabled}
                disabled={push.isRegistering}
                onClick={push.toggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${push.enabled ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                {push.isRegistering ? (
                  <Spinner className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-background" />
                ) : (
                  <span
                    className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${push.enabled ? "translate-x-5" : "translate-x-0"}`}
                  />
                )}
              </button>
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
