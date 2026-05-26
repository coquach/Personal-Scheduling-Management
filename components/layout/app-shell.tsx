"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";

import { AppHeader } from "@/components/layout/app-header";
import { AppDock } from "@/components/layout/app-dock";
import { RightBentoSidebar } from "@/components/layout/right-bento-sidebar";
import { NotificationBootstrap } from "@/components/notification/NotificationBootstrap";

type AppShellContextType = {
  isSidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
};

const AppShellContext = createContext<AppShellContextType | null>(null);

export function useAppShell() {
  const ctx = useContext(AppShellContext);
  if (!ctx) throw new Error("useAppShell must be used within AppShell");
  return ctx;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppShellContext.Provider value={{ isSidebarOpen, setSidebarOpen }}>
      <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
        <NotificationBootstrap />
        
        {/* Minimal Floating Header */}
        <AppHeader />
        
        {/* Main Canvas */}
        <main className="w-full flex-1 px-4 pb-32 pt-24 sm:px-6 lg:px-8">
          {children}
        </main>

        {/* Floating Right Sidebar Trigger (FAB) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full border border-white/20 bg-white/40 shadow-2xl backdrop-blur-3xl transition-transform hover:scale-105 hover:bg-white/50 dark:border-white/10 dark:bg-black/30 dark:hover:bg-white/10"
          aria-label="Open Agenda"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/></svg>
        </button>

        {/* Floating Bottom Dock */}
        <AppDock />

        {/* Right Bento Sidebar (Overlay Glass) */}
        <AnimatePresence>
          {isSidebarOpen && <RightBentoSidebar />}
        </AnimatePresence>
      </div>
    </AppShellContext.Provider>
  );
}
