import {
  Bell,
  CalendarDays,
  ChartColumn,
  Download,
  FolderKanban,
  LayoutDashboard,
  Tags,
  UserRound,
} from "lucide-react";

export const appNavigation = [
  { href: "/calendar", label: "Calendar", icon: CalendarDays, testId: "nav-calendar" },
  { href: "/appointments", label: "Appointments", icon: LayoutDashboard, testId: "nav-appointments" },
  { href: "/tags", label: "Tags", icon: Tags, testId: "nav-tags" },
  { href: "/reminders", label: "Reminders", icon: Bell, testId: "nav-reminders" },
  { href: "/notifications", label: "Notifications", icon: FolderKanban, testId: "nav-notifications" },
  { href: "/statistics", label: "Statistics", icon: ChartColumn, testId: "nav-statistics" },
  { href: "/export", label: "Export", icon: Download, testId: "nav-export" },
  { href: "/profile", label: "Profile", icon: UserRound, testId: "nav-profile" },
] as const;
