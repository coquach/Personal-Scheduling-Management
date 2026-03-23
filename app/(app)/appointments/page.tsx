import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageSection } from "@/components/layout/page-section";

const rows = [
  { title: "Team Standup", status: "Scheduled", tag: "Work" },
  { title: "Doctor Appointment", status: "Scheduled", tag: "Health" },
  { title: "Study Session", status: "Completed", tag: "Study" },
];

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <PageSection
        title="Appointments"
        description="Search, filter, and CRUD selectors are scaffolded here so Playwright can target stable elements before data logic exists."
        actions={
          <Button data-testid="appointment-create-trigger">New appointment</Button>
        }
      >
        <div className="grid gap-3 md:grid-cols-4">
          <Input data-testid="appointment-search-input" placeholder="Search appointments" />
          <Input data-testid="filter-tag" placeholder="Tag filter" />
          <Input data-testid="filter-status" placeholder="Status filter" />
          <div className="grid grid-cols-2 gap-3">
            <Input data-testid="filter-date-from" type="date" />
            <Input data-testid="filter-date-to" type="date" />
          </div>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border/80">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/70 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Tag</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.title} data-testid="appointment-row" className="border-t border-border/70">
                  <td className="px-4 py-3 font-medium">{row.title}</td>
                  <td className="px-4 py-3">{row.tag}</td>
                  <td className="px-4 py-3" data-testid="appointment-status-badge">
                    {row.status}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" data-testid="appointment-edit-trigger">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" data-testid="appointment-status-trigger">
                        Toggle status
                      </Button>
                      <Button size="sm" variant="outline" data-testid="appointment-delete-trigger">
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-2xl border border-dashed border-border/80 p-4 text-sm text-muted-foreground">
          <p data-testid="appointment-empty-state">Empty-state and modal flows will be implemented in the feature steps.</p>
          <p className="mt-2" data-testid="appointment-error-banner">API failure feedback placeholder.</p>
          <p className="mt-2" data-testid="appointment-conflict-alert">Conflict feedback placeholder.</p>
          <p className="mt-2" data-testid="appointment-form-modal">Appointment modal contract placeholder.</p>
          <p className="mt-2" data-testid="appointment-time-error">Time validation placeholder.</p>
          <p className="mt-2" data-testid="recurrence-scope-dialog">Recurring scope dialog placeholder.</p>
        </div>
      </PageSection>
    </div>
  );
}
