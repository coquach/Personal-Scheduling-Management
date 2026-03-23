import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-4 sm:px-6">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            data-testid="global-search-input"
            className="h-11 rounded-full border-border/80 bg-card pl-10"
            placeholder="Search appointments, tags, and reminders"
          />
        </div>
        <button
          type="button"
          className="relative flex size-11 items-center justify-center rounded-full border border-border/80 bg-card"
          data-testid="notification-bell"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <Badge
            className="absolute -top-1 -right-1 min-w-5 justify-center rounded-full px-1"
            data-testid="notification-bell-badge"
          >
            3
          </Badge>
        </button>
        <div className="flex items-center gap-3 rounded-full border border-border/80 bg-card px-2 py-1.5">
          <Avatar className="size-8">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">Productivity mode</p>
          </div>
        </div>
      </div>
    </header>
  );
}
