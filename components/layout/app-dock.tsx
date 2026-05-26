"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDaysIcon, ClockIcon, UsersIcon, ChartColumnIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const dockItems = [
  { href: "/calendar", icon: CalendarDaysIcon, label: "Calendar" },
  { href: "/appointments", icon: ClockIcon, label: "Appointments" },
  { href: "/teams", icon: UsersIcon, label: "Teams" },
  { href: "/statistics", icon: ChartColumnIcon, label: "Statistics" },
];

export function AppDock() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-[24px] border border-white/20 bg-white/40 p-2 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-black/30">
      {dockItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className="group relative flex size-12 items-center justify-center rounded-[16px] transition-colors hover:bg-white/50 dark:hover:bg-white/10"
          >
            <Icon
              className={cn(
                "size-5 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            />
            {isActive && (
              <motion.div
                layoutId="dock-indicator"
                className="absolute -bottom-1 size-1 rounded-full bg-primary"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
