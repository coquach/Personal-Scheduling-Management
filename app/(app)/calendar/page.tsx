import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageSection } from "@/components/layout/page-section";

export default function CalendarPage() {
  return (
    <div className="space-y-6" data-testid="calendar-page">
      <PageSection
        title="Calendar Dashboard"
        description="Foundation view for Day, Week, Month, and Agenda modes. Interactive calendar behavior is deferred to the feature implementation step."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" data-testid="calendar-view-day">Day</Button>
            <Button variant="outline" data-testid="calendar-view-week">Week</Button>
            <Button variant="outline" data-testid="calendar-view-month">Month</Button>
            <Button variant="outline" data-testid="calendar-view-agenda">Agenda</Button>
          </div>
        }
      >
        <div className="flex items-center justify-between gap-4">
          <Button variant="outline" data-testid="calendar-nav-prev">Previous</Button>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground" data-testid="calendar-period-label">
            March 2026
          </p>
          <Button variant="outline" data-testid="calendar-nav-next">Next</Button>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card className="border-dashed">
            <CardContent className="grid min-h-80 grid-cols-7 gap-3 p-4">
              {Array.from({ length: 14 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  data-testid="calendar-day-cell"
                  className="rounded-2xl border border-border/70 bg-muted/40 p-3 text-left text-sm transition hover:border-cyan-500/50 hover:bg-cyan-50"
                >
                  <span className="font-medium">{index + 10}</span>
                  <div className="mt-3 rounded-xl bg-background px-2 py-1 text-xs text-muted-foreground">
                    Slot placeholder
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
          <Card className="border-dashed">
            <CardContent className="space-y-3 p-4">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Today
              </p>
              {["Team Standup", "Doctor Appointment", "Study Session"].map((item) => (
                <button
                  key={item}
                  type="button"
                  data-testid="calendar-slot"
                  className="w-full rounded-2xl border border-border/70 bg-card p-4 text-left"
                >
                  <p className="font-medium">{item}</p>
                  <p className="text-sm text-muted-foreground">Interactive details will land in Step 5.</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </PageSection>
    </div>
  );
}
