"use client";

import {
  statisticsSummary,
  statisticsTagDistribution,
  statisticsTimeSlots,
} from "@/lib/scaffold-data";
import { PageSection } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatisticsPage() {
  return (
    <div data-testid="statistics-page" className="space-y-6">
      <PageSection
        title="Statistics"
        description="Weekly productivity metrics, tag distribution and completion trends."
        actions={
          <Button variant="outline" data-testid="statistics-period-filter">
            This week
          </Button>
        }
      >
        <p
          className="text-sm font-medium text-muted-foreground"
          data-testid="statistics-period-label"
        >
          {statisticsSummary.periodLabel}
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card data-testid="statistics-total-card">
            <CardHeader>
              <CardTitle>Total appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
                {statisticsSummary.total}
              </p>
            </CardContent>
          </Card>
          <Card data-testid="statistics-completed-card">
            <CardHeader>
              <CardTitle>Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
                {statisticsSummary.completed}
              </p>
            </CardContent>
          </Card>
          <Card data-testid="statistics-completion-rate-card">
            <CardHeader>
              <CardTitle>Completion rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
                {statisticsSummary.completionRate}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Appointments by tag</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statisticsTagDistribution.map((item) => (
                <div key={item.tag} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{item.tag}</span>
                    <span className="text-muted-foreground">
                      {item.count} ({item.percent}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Productive time slots</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statisticsTimeSlots.map((slot) => (
                <div
                  key={slot.label}
                  className="rounded-[16px] border border-border bg-background p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-foreground">{slot.label}</span>
                    <span className="text-sm text-muted-foreground">{slot.value}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card data-testid="statistics-empty-state">
          <CardHeader>
            <CardTitle>Empty state placeholder</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            When a period has limited data, this card will guide the user back to scheduling and
            completion habits.
          </CardContent>
        </Card>
      </PageSection>
    </div>
  );
}
