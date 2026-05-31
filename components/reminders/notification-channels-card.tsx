"use client";

import { MailIcon, SmartphoneIcon, BellIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useReminderProfile } from "@/hooks/use-reminder-profile";

export function NotificationChannelsCard() {
  const { channels } = useReminderProfile();

  return (
    <Card className="border-border/50 shadow-sm transition-all h-full bg-card/60 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BellIcon className="size-5 text-primary" />
          Notification Channels
        </CardTitle>
        <CardDescription>
          Where you receive reminders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between group">
           <div className="flex items-center gap-4">
              <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <SmartphoneIcon className="size-5" />
              </div>
              <div>
                <p className="font-semibold leading-none text-foreground">Push Notifications</p>
                <p className="mt-1 text-sm text-muted-foreground">Alerts on your devices</p>
              </div>
           </div>
           
           <button
              type="button"
              role="switch"
              aria-checked={channels.push.enabled}
              disabled={channels.push.isRegistering}
              onClick={channels.push.toggle}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${channels.push.enabled ? "bg-primary" : "bg-muted-foreground/30"}`}
            >
              {channels.push.isRegistering ? (
                <Spinner className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-background" />
              ) : (
                <span
                  className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${channels.push.enabled ? "translate-x-5" : "translate-x-0"}`}
                />
              )}
            </button>
        </div>
        
        <div className="flex items-center justify-between group opacity-60">
           <div className="flex items-center gap-4">
              <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-transform group-hover:scale-110">
                <MailIcon className="size-5" />
              </div>
              <div>
                <p className="font-semibold leading-none text-foreground">Email Notifications</p>
                <p className="mt-1 text-sm text-muted-foreground">Not supported yet</p>
              </div>
           </div>
           
           <button
              type="button"
              role="switch"
              aria-checked={channels.email.enabled}
              disabled={true}
              onClick={channels.email.toggle}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${channels.email.enabled ? "bg-primary" : "bg-muted-foreground/30"}`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${channels.email.enabled ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
        </div>
      </CardContent>
    </Card>
  );
}
