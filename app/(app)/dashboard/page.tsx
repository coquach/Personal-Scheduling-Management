import { requireUser } from "@/actions/auth.actions";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Authenticated workspace
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
            Dashboard
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            This page is protected on the server with <code>requireUser()</code>.
            If the refresh cookie is missing or invalid, the request is redirected
            to <code>/login</code>.
          </p>
        </div>
        <LogoutButton label="Sign out" data-testid="dashboard-logout" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current user</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="font-medium text-foreground">{user.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium text-foreground">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Display name</dt>
              <dd className="font-medium text-foreground">
                {user.displayName ?? "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Roles</dt>
              <dd className="font-medium text-foreground">
                {user.roles.length > 0 ? user.roles.join(", ") : "user"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
