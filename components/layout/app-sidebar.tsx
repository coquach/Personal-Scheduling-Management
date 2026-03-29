"use client";

import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { appNavigation } from "@/lib/navigation";
import { tagRows } from "@/lib/scaffold-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationGroups = [
  {
    label: "Planning",
    items: ["Calendar", "Appointments", "Tags", "Reminders"],
  },
  {
    label: "Workspace",
    items: ["Notifications", "Statistics", "Export", "Profile"],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { collapsed, setOpenMobile } = useSidebar();

  return (
    <Sidebar className="text-sidebar-foreground" data-testid="app-sidebar">
      <SidebarHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-[16px] bg-primary text-sm font-semibold text-primary-foreground">
            P
          </div>
          {!collapsed ? (
            <div className="space-y-0.5">
              <p className="text-sm font-semibold tracking-[-0.02em] text-sidebar-foreground">
                PSMS
              </p>
              <p className="text-xs text-muted-foreground">Planning workspace</p>
            </div>
          ) : null}
        </div>
        <Button className="w-full justify-start" size={collapsed ? "icon" : "default"}>
          <PlusIcon />
          {!collapsed ? <span>New appointment</span> : null}
        </Button>
      </SidebarHeader>
      <SidebarContent>
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
            <SidebarMenu>
              {group.items.map((itemLabel) => {
                const item = appNavigation.find((entry) => entry.label === itemLabel);

                if (!item) {
                  return null;
                }

                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      href={item.href}
                      isActive={pathname === item.href}
                      data-testid={item.testId}
                      onClick={() => setOpenMobile(false)}
                      className={cn(collapsed && "justify-center px-2")}
                    >
                      <Icon className="size-4 shrink-0" />
                      {!collapsed ? <span>{item.label}</span> : null}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {!collapsed ? (
          <>
            <SidebarGroupLabel>Quick tags</SidebarGroupLabel>
            <div className="mt-3 space-y-2">
              {tagRows.slice(0, 3).map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between rounded-lg border border-sidebar-border px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm text-sidebar-foreground">{tag.name}</span>
                  </div>
                  <Badge variant="secondary" className="rounded-md">
                    {tag.appointments}
                  </Badge>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="grid justify-center gap-2">
            {tagRows.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                href="/tags"
                className="size-3 rounded-full"
                style={{ backgroundColor: tag.color }}
                aria-label={tag.name}
              />
            ))}
          </div>
        )}
        <SidebarSeparator />
        <div className={cn("rounded-[16px] border border-sidebar-border bg-accent/50 p-3", collapsed && "p-2 text-center")}>
          <p className="text-xs font-medium text-sidebar-foreground">
            {collapsed ? "3" : "3 unread notifications"}
          </p>
          {!collapsed ? (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Review reminders and updates from your schedule.
            </p>
          ) : null}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
