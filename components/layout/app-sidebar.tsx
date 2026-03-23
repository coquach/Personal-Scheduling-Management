import Link from "next/link";
import { appNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  return (
    <aside
      className="hidden w-72 shrink-0 border-r border-border/80 bg-card/70 px-5 py-6 lg:flex lg:flex-col"
      data-testid="app-sidebar"
    >
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          PSMS
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Scheduling OS
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Step 2 foundation with route scaffolding, shared shell, and stable test selectors.
        </p>
      </div>

      <nav className="space-y-2">
        {appNavigation.map(({ href, icon: Icon, label, testId }) => (
          <Link
            key={href}
            href={href}
            data-testid={testId}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:border-border hover:bg-muted/80 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
