"use client";

import { PageSection } from "@/components/layout/page-section";
import { SnoozeSettingsCard } from "@/components/reminders/snooze-settings-card";
import { NotificationChannelsCard } from "@/components/reminders/notification-channels-card";
import { DefaultRulesCard } from "@/components/reminders/default-rules-card";

export default function RemindersPage() {
  return (
    <div data-testid="reminders-page" className="space-y-6">
      <PageSection
        title="Reminders"
        description="Configure your default reminder timings, snooze windows, and notification channels."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Default Rules spanning 2 columns on large screens */}
          <div className="lg:col-span-2">
             <DefaultRulesCard />
          </div>
          {/* Settings spanning 1 column */}
          <div className="flex flex-col gap-6">
             <SnoozeSettingsCard />
             <NotificationChannelsCard />
          </div>
        </div>
      </PageSection>
    </div>
  );
}
