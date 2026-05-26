"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { BellIcon, ChevronDownIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { queryKeys } from "@/query/keys";
import { useUnreadNotificationCount } from "@/query/notifications-hooks";
import { getProfile } from "@/services/profile.service";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useAppShell } from "./app-shell";

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
  const router = useRouter();
  const pathname = usePathname();
  const meta = pageMeta[pathname] ?? pageMeta["/calendar"];
  const profileQuery = useQuery({
    queryKey: queryKeys.profile.detail,
    queryFn: getProfile,
  });
  const notificationsQuery = useUnreadNotificationCount();

  const displayName = profileQuery.data?.displayName?.trim() || "Account";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "AC";

  useAppShell();

  return (
    <header className="fixed left-1/2 top-4 z-30 flex h-14 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 items-center justify-between rounded-full border border-white/20 bg-white/40 px-4 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-black/20">
      
      {/* Left: Brand */}
      <div className="flex w-[120px] items-center justify-start">
        <BrandLogo size="sm" />
      </div>

      {/* Center: Title */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <p className="text-sm font-semibold tracking-tight">{meta.title}</p>
      </div>

      {/* Right: Actions */}
      <div className="flex w-[120px] items-center justify-end gap-1.5 sm:gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative"
          data-testid="notification-bell"
          onClick={() => router.push("/notifications")}
        >
          <BellIcon className="size-4" />
          {notificationsQuery.unreadCount > 0 && (
            <span
              className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
              data-testid="notification-bell-badge"
            >
              {notificationsQuery.unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            data-testid="profile-menu-trigger"
            render={<Button variant="ghost" className="h-10 rounded-xl px-2 sm:px-3" />}
          >
            <Avatar size="sm">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">
              {displayName}
            </span>
            <ChevronDownIcon className="hidden size-4 text-muted-foreground sm:inline" />
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="mt-2 w-56 rounded-2xl border border-white/20 bg-white/60 p-2 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-black/40"
          >
            <div className="mb-2 px-2 py-1.5">
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs text-muted-foreground">Workspace Owner</p>
            </div>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem 
              className="mt-1 cursor-pointer rounded-xl px-3 py-2 text-sm transition-colors hover:bg-white/50 focus:bg-white/50 dark:hover:bg-white/10 dark:focus:bg-white/10" 
              render={<Link href="/profile" />}
            >
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer rounded-xl px-3 py-2 text-sm transition-colors hover:bg-white/50 focus:bg-white/50 dark:hover:bg-white/10 dark:focus:bg-white/10"
              render={<Link href="/statistics" />}
            >
              View Statistics
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <div className="mt-1 px-1">
              <LogoutButton
                data-testid="sign-out-action"
                label="Sign out"
                variant="destructive"
                className="w-full justify-start rounded-xl px-2 py-2 text-sm font-medium"
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
