import { Button } from "@/components/ui/button";
import { PageSection } from "@/components/layout/page-section";

export default function NotificationsPage() {
  return (
    <div className="space-y-6" data-testid="notifications-page">
      <PageSection
        title="Notifications"
        description="Notification log, snooze actions, and unread-count selectors are available for future Playwright coverage."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" data-testid="notification-filter">Filter</Button>
            <Button variant="outline" data-testid="notification-mark-all-read">
              Mark all as read
            </Button>
            <Button variant="outline" data-testid="notification-clear-all">
              Clear all
            </Button>
          </div>
        }
      >
        <div className="rounded-2xl border border-border/80 p-4">
          <div className="rounded-2xl border border-dashed border-border/80 p-4 text-sm text-muted-foreground" data-testid="notification-popup">
            Reminder popup placeholder.
            <Button className="ml-3" size="sm" data-testid="notification-popup-snooze">
              Snooze
            </Button>
          </div>
          <div className="mt-4 rounded-2xl border border-dashed border-border/80 p-4 text-sm text-muted-foreground" data-testid="notification-log-row">
            Notification log row placeholder.
            <span className="ml-3 font-medium" data-testid="notification-status">
              Due
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground" data-testid="notification-empty-state">
            Empty-state placeholder for cleared notifications.
          </p>
        </div>
      </PageSection>
    </div>
  );
}
