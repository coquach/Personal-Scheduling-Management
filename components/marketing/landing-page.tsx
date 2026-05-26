import { BrandLogo } from '@/components/ui/brand-logo';
import {
  ArrowRightIcon,
  BellRingIcon,
  CalendarDaysIcon,
  ChartColumnIcon,
  CheckCircle2Icon
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';

const featureCards = [
  {
    title: 'Calendar-first planning',
    description:
      'Move from monthly overview to daily agenda quickly, with a layout that stays clean under dense schedules.',
    icon: CalendarDaysIcon,
  },
  {
    title: 'Reminders that stay useful',
    description:
      'Default reminders, quick snooze actions and notification logs are visible in one flow instead of being buried.',
    icon: BellRingIcon,
  },
  {
    title: 'Progress you can read fast',
    description:
      'Track completion, active tags and productive slots with dashboard cards that are easy to scan in a few seconds.',
    icon: ChartColumnIcon,
  },
];

const baseButtonLinkClass =
  'group relative inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-all duration-300 outline-none overflow-hidden';

const primaryButtonLinkClass = `${baseButtonLinkClass} border-primary/90 bg-primary px-4 text-primary-foreground shadow-[0_8px_16px_rgba(139,92,246,0.25)] hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:-translate-y-1`;
const ghostButtonLinkClass = `${baseButtonLinkClass} border-transparent bg-transparent px-4 text-foreground hover:bg-accent`;
const outlineButtonLinkClass = `${baseButtonLinkClass} border-border bg-transparent px-4 text-foreground hover:bg-accent hover:border-primary/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)]`;
const largePrimaryButtonLinkClass = `${primaryButtonLinkClass} h-12 px-5 text-base`;
const largeOutlineButtonLinkClass = `${outlineButtonLinkClass} h-12 px-5 text-base`;

const bentoCardClass = "flex flex-col justify-center rounded-[2rem] border border-white/40 bg-white/60 p-8 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:bg-white/80 hover:border-white/80 hover:shadow-[0_12px_40px_rgba(139,92,246,0.15)] dark:border-white/10 dark:bg-black/40 dark:hover:bg-black/60 dark:hover:border-primary/40 dark:hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]";

export function MarketingLandingPage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
      data-testid="marketing-page"
    >
      {/* Animated Mesh Gradients */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[50vh] w-[50vw] animate-mesh-1 rounded-full bg-violet-400/30 blur-[120px] mix-blend-normal dark:bg-violet-900/40" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[60vh] w-[60vw] animate-mesh-2 rounded-full bg-sky-300/30 blur-[120px] mix-blend-normal dark:bg-sky-900/40" />
      <div className="pointer-events-none absolute top-[20%] left-[30%] h-[40vh] w-[40vw] animate-mesh-3 rounded-full bg-rose-300/20 blur-[120px] mix-blend-normal dark:bg-rose-900/30" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-[18px] border border-border/80 bg-white/72 dark:border-white/10 dark:bg-black/20 px-4 py-3 backdrop-blur-xl sm:px-5">
          <BrandLogo size="md" />
          <div className="flex items-center gap-2">
            <a
              href="/login"
              data-testid="marketing-auth-link"
              className={ghostButtonLinkClass}
            >
              Login
            </a>
            <a
              href="/register"
              data-testid="marketing-primary-cta"
              className={primaryButtonLinkClass}
            >
              Get started
            </a>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-6 lg:gap-6">
            {/* HERO TEXT CARD (Span 4) */}
            <div className={`col-span-1 md:col-span-4 lg:col-span-4 space-y-6 lg:p-12 ${bentoCardClass}`}>
              <h1 className="max-w-2xl text-[2.9rem] leading-[1.05] font-black tracking-[-0.04em] sm:text-[4rem] lg:text-[4.5rem] bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70 dark:from-white dark:to-white/50 drop-shadow-sm">
                Plan the day, keep control.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl font-medium">
                A unified workspace for calendar planning, reminders,
                statistics, and export workflows—all wrapped in a
                distraction-free, premium interface.
              </p>
              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <a
                  href="/auth"
                  data-testid="marketing-open-workspace"
                  className={largePrimaryButtonLinkClass}
                >
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <span className="relative flex items-center gap-2">
                    Start with login <ArrowRightIcon className="size-4" />
                  </span>
                </a>
                <a
                  href="/calendar"
                  data-testid="marketing-secondary-cta"
                  className={largeOutlineButtonLinkClass}
                >
                  Open calendar
                </a>
              </div>
            </div>

            {/* MOCKUP CARD (Span 2) */}
            <div className={`col-span-1 !p-0 justify-between overflow-hidden md:col-span-4 lg:col-span-2 ${bentoCardClass}`}>
              <div className="p-8 pb-0">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Workspace snapshot
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Agenda, metrics and reminders in one bright surface.
                </p>
              </div>
              <div className="relative mt-8 h-full min-h-[280px] w-full translate-x-6 translate-y-6 rounded-tl-[1.5rem] border border-border/50 bg-background/95 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 flex">
                {/* Mini Sidebar */}
                <div className="w-12 h-full border-r border-border/50 pr-3 flex flex-col gap-3 hidden sm:flex">
                  <div className="w-8 h-8 rounded-full bg-primary/20 mb-2"></div>
                  <div className="w-8 h-8 rounded-lg bg-muted/60"></div>
                  <div className="w-8 h-8 rounded-lg bg-muted/60"></div>
                  <div className="w-8 h-8 rounded-lg bg-muted/60"></div>
                </div>
                {/* Main Content */}
                <div className="flex-1 pl-0 sm:pl-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className="size-3 rounded-full bg-destructive/80 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      <span className="size-3 rounded-full bg-chart-5 shadow-[0_0_8px_rgba(253,224,71,0.5)]" />
                      <span className="size-3 rounded-full bg-chart-2 shadow-[0_0_8px_rgba(110,231,183,0.5)]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Time Column */}
                    <div className="col-span-1 space-y-4 pt-2">
                      <div className="h-2 w-8 bg-muted/80 rounded"></div>
                      <div className="h-2 w-8 bg-muted/80 rounded"></div>
                      <div className="h-2 w-8 bg-muted/80 rounded"></div>
                    </div>
                    {/* Events */}
                    <div className="col-span-2 space-y-2 relative">
                      <div className="absolute top-4 left-0 w-full h-[1px] bg-primary/30 z-0"></div>
                      <div className="h-14 w-full rounded-lg border border-primary/30 bg-primary/10 relative z-10 p-2 flex flex-col justify-center">
                        <div className="h-2 w-1/2 bg-primary/40 rounded mb-1"></div>
                        <div className="h-1.5 w-1/3 bg-primary/20 rounded"></div>
                      </div>
                      <div className="h-10 w-3/4 rounded-lg border border-chart-4/30 bg-chart-4/10 relative z-10 mt-6 p-2 flex flex-col justify-center">
                        <div className="h-2 w-1/2 bg-chart-4/40 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STAT CARD (Span 2) */}
            <div className={`col-span-1 md:col-span-2 lg:col-span-2 ${bentoCardClass}`}>
              <p className="text-5xl font-extrabold tracking-tight text-primary">
                8
              </p>
              <p className="mt-3 text-lg font-bold text-foreground">
                Core modules
              </p>
              <p className="text-sm text-muted-foreground">
                Seamlessly integrated across one shared shell.
              </p>
            </div>

            {/* FEATURE CARDS (Span 2 each) */}
            {featureCards.slice(0, 2).map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`col-span-1 md:col-span-2 lg:col-span-2 ${bentoCardClass}`}
                >
                  <div className="mb-6 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
            {/* ROW 3: EXTRA BENTO BOXES */}
            <div className={`col-span-1 md:col-span-4 lg:col-span-4 lg:flex-row lg:items-center lg:justify-between lg:p-12 ${bentoCardClass}`}>
              <div className="max-w-md space-y-4">
                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ChartColumnIcon className="size-6" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  {featureCards[2].title}
                </h3>
                <p className="text-base text-muted-foreground">
                  {featureCards[2].description}
                </p>
              </div>
              <div className="mt-8 flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-white/40 bg-white/50 p-4 shadow-inner dark:border-white/10 dark:bg-black/40 lg:mt-0 lg:ml-8">
                <div className="h-2 w-1/3 rounded-full bg-primary/40" />
                <div className="h-2 w-2/3 rounded-full bg-primary/20" />
                <div className="h-2 w-1/2 rounded-full bg-primary/20" />
              </div>
            </div>

            <div className={`col-span-1 items-center space-y-6 text-center md:col-span-2 lg:col-span-2 bg-gradient-to-br from-primary/10 to-transparent ${bentoCardClass}`}>
              <CheckCircle2Icon className="size-10 text-primary" />
              <div>
                <h3 className="text-xl font-bold text-foreground">Ready?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Free for personal use.
                </p>
              </div>
              <a
                href="/register"
                className={primaryButtonLinkClass}
              >
                Join now
              </a>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="mx-auto w-full max-w-7xl pb-8 pt-4">
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/20 pt-8 sm:flex-row dark:border-white/10">
            <p className="text-sm text-muted-foreground">© 2026 PSMS Workspace. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
              <a href="#" className="transition-colors hover:text-foreground">Terms</a>
              <a href="#" className="transition-colors hover:text-foreground">Twitter</a>
              <a href="#" className="transition-colors hover:text-foreground">GitHub</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
