import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageSection } from "@/components/layout/page-section";

export default function ProfilePage() {
  return (
    <div className="space-y-6" data-testid="profile-page">
      <PageSection
        title="Profile Settings"
        description="Profile update, password update, and delete-account contracts are scaffolded for the next implementation steps."
        actions={<Button data-testid="profile-save">Save changes</Button>}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input data-testid="profile-name-input" placeholder="Full name" defaultValue="John Doe" />
          <Input data-testid="profile-timezone-select" placeholder="UTC+07:00 - Indochina Time" />
          <Input data-testid="profile-email-input" defaultValue="john.doe@example.com" readOnly />
          <div className="rounded-2xl border border-dashed border-border/80 p-4 text-sm text-muted-foreground" data-testid="profile-success-banner">
            Success banner placeholder.
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <Input data-testid="profile-current-password-input" type="password" placeholder="Current password" />
          <Input data-testid="profile-new-password-input" type="password" placeholder="New password" />
          <Input data-testid="profile-confirm-password-input" type="password" placeholder="Confirm password" />
          <Button data-testid="profile-password-save" variant="outline">
            Update password
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground" data-testid="profile-password-error">
          Password validation placeholder.
        </p>
        <div className="mt-6 rounded-2xl border border-dashed border-border/80 p-4 text-sm text-muted-foreground" data-testid="profile-delete-dialog">
          Delete-account confirmation placeholder.
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" data-testid="profile-delete-trigger">
              Delete account
            </Button>
            <Input
              className="max-w-sm"
              data-testid="profile-delete-confirmation-input"
              placeholder="Type your email to confirm"
            />
            <Button data-testid="profile-delete-submit" variant="destructive">
              Confirm delete
            </Button>
          </div>
        </div>
      </PageSection>
    </div>
  );
}
