import { PageSection } from "@/components/layout/page-section";

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <PageSection
        title="Statistics Dashboard"
        description="Summary metrics and analytics placeholders are ready for TanStack Query data binding."
        actions={<div className="rounded-full border border-border/80 px-4 py-2 text-sm" data-testid="statistics-period-filter">This week</div>}
      >
        <p className="mb-4 text-sm uppercase tracking-[0.25em] text-muted-foreground" data-testid="statistics-period-label">
          Mar 08 - Mar 14, 2026
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/80 bg-card p-4" data-testid="statistics-total-card">
            <p className="text-sm text-muted-foreground">Total appointments</p>
            <p className="mt-2 text-3xl font-semibold">24</p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-4" data-testid="statistics-completed-card">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="mt-2 text-3xl font-semibold">18</p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-4" data-testid="statistics-completion-rate-card">
            <p className="text-sm text-muted-foreground">Completion rate</p>
            <p className="mt-2 text-3xl font-semibold">75%</p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-dashed border-border/80 p-4 text-sm text-muted-foreground" data-testid="statistics-empty-state">
          Empty-state placeholder for low-data analytics.
        </div>
      </PageSection>
    </div>
  );
}
