import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageSection } from "@/components/layout/page-section";

export default function ExportPage() {
  return (
    <div className="space-y-6">
      <PageSection
        title="Export Appointment Data"
        description="CSV preview and export selectors are scaffolded here for later mocked download testing."
        actions={<Button data-testid="export-submit">Export CSV</Button>}
      >
        <div className="grid gap-3 md:grid-cols-4">
          <Input data-testid="export-date-from" type="date" />
          <Input data-testid="export-date-to" type="date" />
          <Input data-testid="export-tag-filter" placeholder="Tags" />
          <Input data-testid="export-status-filter" placeholder="Status" />
        </div>
        <div className="mt-6 rounded-2xl border border-border/80 p-4" data-testid="export-preview-table">
          <p className="text-sm font-medium">Preview table placeholder</p>
          <p className="mt-2 text-sm text-muted-foreground" data-testid="export-empty-state">
            Empty export placeholder.
          </p>
        </div>
      </PageSection>
    </div>
  );
}
