import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageSection } from "@/components/layout/page-section";

export default function RemindersPage() {
  return (
    <div className="space-y-6">
      <PageSection
        title="Reminder Settings"
        description="Reminder defaults and per-appointment reminder contracts are scaffolded here."
        actions={<Button data-testid="reminder-preferences-save">Save preferences</Button>}
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Input data-testid="reminder-default-select" placeholder="15 minutes before" />
          <Input data-testid="reminder-snooze-select" placeholder="10 minutes" />
          <Input data-testid="reminder-custom-value" placeholder="Custom lead time" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" data-testid="appointment-reminders-trigger">Open appointment reminders</Button>
          <Button variant="outline" data-testid="reminder-add">Add reminder</Button>
          <Button variant="outline" data-testid="reminder-save">Save reminders</Button>
        </div>
        <div className="mt-4 rounded-2xl border border-dashed border-border/80 p-4 text-sm text-muted-foreground">
          <p data-testid="reminder-row">Reminder row placeholder.</p>
          <p className="mt-2" data-testid="reminder-error">Reminder validation placeholder.</p>
        </div>
      </PageSection>
    </div>
  );
}
