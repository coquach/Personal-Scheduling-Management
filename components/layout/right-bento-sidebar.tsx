"use client";

import { motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { useAppShell } from "./app-shell";
import { Button } from "@/components/ui/button";
import { tagRows } from "@/lib/scaffold-data";
import { Badge } from "@/components/ui/badge";

export function RightBentoSidebar() {
  const { setSidebarOpen } = useAppShell();

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
        className="fixed inset-y-4 right-4 z-50 flex w-80 flex-col overflow-hidden rounded-[2rem] border border-white/20 bg-white/60 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-black/40"
      >
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <h2 className="text-lg font-semibold text-foreground">Agenda & Tags</h2>
          <Button variant="ghost" size="icon-sm" onClick={() => setSidebarOpen(false)}>
            <XIcon />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Quick Tags</h3>
            <div className="flex flex-col gap-3">
              {tagRows.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between rounded-[1rem] border border-white/20 bg-white/40 p-3 dark:border-white/10 dark:bg-black/20"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm font-medium">{tag.name}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="rounded-md bg-white/50 dark:bg-black/50"
                  >
                    {tag.appointments}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
