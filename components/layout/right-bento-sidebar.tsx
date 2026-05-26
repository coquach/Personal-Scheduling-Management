"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useAppointmentsListQuery } from "@/query/appointments-hooks";
import { useTagsQuery } from "@/query/tags-hooks";
import { format, isSameDay } from "date-fns";
import { motion } from "framer-motion";
import { CalendarIcon, ClockIcon, XIcon } from "lucide-react";
import { useAppShell } from "./app-shell";

export function RightBentoSidebar() {
  const { setSidebarOpen } = useAppShell();
  const today = new Date();

  // 1. Fetch real tags
  const tagsQuery = useTagsQuery();
  const tags = tagsQuery.data || [];

  // 2. Fetch upcoming appointments
  const upcomingQuery = useAppointmentsListQuery({
    limit: 3,
    fromDate: today.toISOString(),
  });
  
  const upcomingAppointments = upcomingQuery.data?.items || [];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSidebarOpen(false)}
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: "100%", opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0.5 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-4 right-4 z-50 flex w-[340px] flex-col overflow-hidden rounded-[2rem] border border-white/20 bg-white/60 p-5 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-black/40"
      >
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Dashboard</h2>
          <Button variant="ghost" size="icon-sm" onClick={() => setSidebarOpen(false)} className="rounded-full">
            <XIcon className="size-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-none">
          {/* Bento 1: Mini Calendar */}
          <div className="rounded-[1.25rem] border border-white/20 bg-white/40 p-3 shadow-sm dark:border-white/10 dark:bg-black/20">
            <Calendar
              mode="single"
              selected={today}
              className="pointer-events-none p-0"
              classNames={{
                months: "w-full",
                month: "space-y-3 w-full",
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex w-full justify-between",
                week: "flex w-full justify-between mt-1",
                day: "h-8 w-8 p-0 font-normal hover:bg-transparent rounded-full flex items-center justify-center",
                today: "bg-accent text-accent-foreground font-semibold rounded-full",
              }}
            />
          </div>

          {/* Bento 2: Up Next */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <CalendarIcon className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Up Next</h3>
            </div>
            
            <div className="flex flex-col gap-2">
              {upcomingQuery.isLoading ? (
                <div className="animate-pulse rounded-[1rem] bg-muted/50 h-[72px]" />
              ) : upcomingAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[1rem] border border-dashed border-border/50 p-6 text-center">
                  <p className="text-sm text-muted-foreground">No upcoming events today.</p>
                </div>
              ) : (
                upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="group relative flex flex-col gap-1 rounded-[1rem] border border-white/20 bg-white/40 p-3 transition-colors hover:bg-white/60 dark:border-white/10 dark:bg-black/20 dark:hover:bg-black/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-sm line-clamp-1">{apt.title}</span>
                      {apt.tags[0] && (
                        <span 
                          className="size-2.5 rounded-full shrink-0 mt-1" 
                          style={{ backgroundColor: apt.tags[0].color }} 
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <ClockIcon className="size-3" />
                      <span>
                        {format(new Date(apt.startAt), "h:mm a")} 
                        {isSameDay(new Date(apt.startAt), today) ? "" : ` • ${format(new Date(apt.startAt), "MMM d")}`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bento 3: Quick Tags */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <h3 className="text-sm font-medium text-muted-foreground">Quick Tags</h3>
            </div>
            <div className="flex flex-col gap-2">
              {tagsQuery.isLoading ? (
                <div className="animate-pulse flex gap-2 overflow-hidden">
                  <div className="h-8 w-16 bg-muted/50 rounded-full" />
                  <div className="h-8 w-20 bg-muted/50 rounded-full" />
                </div>
              ) : tags.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1">No tags defined.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-2 rounded-full border border-white/20 bg-white/40 px-3 py-1.5 dark:border-white/10 dark:bg-black/20"
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: tag.color || undefined }}
                      />
                      <span className="text-xs font-medium">{tag.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
