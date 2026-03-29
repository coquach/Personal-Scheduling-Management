"use client";

import { useState } from "react";

import { reminderRows } from "@/lib/scaffold-data";
import { PageSection } from "@/components/layout/page-section";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RemindersPage() {
  const [showError, setShowError] = useState(false);

  return (
    <div data-testid="reminders-page" className="space-y-6">
      <PageSection
        title="Reminders"
        description="Default reminder timings, snooze windows and appointment-level overrides."
      >
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input defaultValue="10 minutes before" data-testid="reminder-default-select" />
              <Input defaultValue="5 minutes" data-testid="reminder-snooze-select" />
              <Input placeholder="Custom minutes" data-testid="reminder-custom-value" />
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" data-testid="appointment-reminders-trigger">
                  Open appointment reminders
                </Button>
                <Button variant="outline" data-testid="reminder-add">
                  Add reminder
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" data-testid="reminder-save" onClick={() => setShowError(true)}>
                  Save reminder list
                </Button>
                <Button data-testid="reminder-preferences-save" onClick={() => setShowError(true)}>
                  Save preferences
                </Button>
              </div>
              {showError ? (
                <Alert variant="destructive" data-testid="reminder-error">
                  Custom reminder cannot be longer than the appointment duration.
                </Alert>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Appointment reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reminderRows.map((reminder, index) => (
                <div
                  key={reminder.id}
                  className="rounded-[16px] border border-border bg-background p-4"
                  data-testid={index === 0 ? "reminder-row" : undefined}
                >
                  <p className="font-medium text-foreground">{reminder.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {reminder.offset} via {reminder.channel}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </PageSection>
    </div>
  );
}
