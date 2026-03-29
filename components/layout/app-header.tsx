"use client";

import Link from "next/link";
import { BellIcon, ChevronDownIcon, SearchIcon, Settings2Icon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { logout } from "@/api/auth";
import { getProfile } from "@/api/profile";
import { queryKeys } from "@/query/keys";

const pageMeta: Record<string, { title: string; description: string }> = {
  "/calendar": {
    title: "Calendar",
    description: "Overview, quick create and schedule focus.",
  },
  "/appointments": {
    title: "Appointments",
    description: "Manage all events, statuses and reminders.",
  },
  "/tags": {
    title: "Tags",
    description: "Color labels for your planning system.",
  },
  "/reminders": {
    title: "Reminders",
    description: "Default notifications and snooze settings.",
  },
  "/notifications": {
    title: "Notifications",
    description: "Reminder feed and action history.",
  },
  "/statistics": {
    title: "Statistics",
    description: "Completion insights and time distribution.",
  },
  "/export": {
    title: "Export",
    description: "Generate date-range exports from your schedule.",
  },
  "/profile": {
    title: "Profile",
    description: "Account preferences, password and timezone.",
  },
};

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const meta = pageMeta[pathname] ?? pageMeta["/calendar"];
  const profileQuery = useQuery({
    queryKey: queryKeys.profile.detail,
    queryFn: getProfile,
  });

  async function handleSignOut() {
    try {
      await logout();
    } finally {
      router.replace("/auth");
      router.refresh();
    }
  }

  const displayName = profileQuery.data?.displayName?.trim() || "Account";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "AC";

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/88 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger />
            <div className="min-w-0">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <Link href="/calendar" className="text-muted-foreground transition-colors hover:text-foreground">
                      Workspace
                    </Link>
                  </BreadcrumbItem>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{meta.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" className="hidden sm:inline-flex">
              <Settings2Icon />
              <span className="sr-only">Preferences</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative"
              data-testid="notification-bell"
            >
              <BellIcon />
              <span
                className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
                data-testid="notification-bell-badge"
              >
                3
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="h-10 rounded-xl px-2 sm:px-3" />
                }
              >
                <Avatar size="sm">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">
                  {displayName}
                </span>
                <ChevronDownIcon className="hidden sm:inline size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem render={<Link href="/profile" />}>Profile</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/statistics" />}>Statistics</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <label className="relative block">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search appointments, notes or tags"
            data-testid="global-search-input"
          />
        </label>
      </div>
    </header>
  );
}
