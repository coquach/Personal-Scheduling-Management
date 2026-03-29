import {
  ArrowRightIcon,
  BellRingIcon,
  CalendarDaysIcon,
  ChartColumnIcon,
  CheckCircle2Icon,
  Clock3Icon,
  Layers3Icon,
  SparklesIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const featureCards = [
  {
    title: "Calendar-first planning",
    description:
      "Move from monthly overview to daily agenda quickly, with a layout that stays clean under dense schedules.",
    icon: CalendarDaysIcon,
  },
  {
    title: "Reminders that stay useful",
    description:
      "Default reminders, quick snooze actions and notification logs are visible in one flow instead of being buried.",
    icon: BellRingIcon,
  },
  {
    title: "Progress you can read fast",
    description:
      "Track completion, active tags and productive slots with dashboard cards that are easy to scan in a few seconds.",
    icon: ChartColumnIcon,
  },
];

const benefits = [
  "Unified calendar, appointment, reminder and export flows.",
  "Bright productivity visual language with blue-led accents.",
  "Clear entry path from marketing to auth and then into the workspace.",
];

const schedulePreview = [
  { time: "09:00", title: "Team standup", color: "#1a73e8", state: "Shared" },
  { time: "11:30", title: "Doctor appointment", color: "#ea4335", state: "Personal" },
  { time: "15:00", title: "Weekly review", color: "#34a853", state: "Ready" },
];

const baseButtonLinkClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none";

const primaryButtonLinkClass = `${baseButtonLinkClass} border-primary/90 bg-primary px-4 text-primary-foreground shadow-sm hover:bg-[#1765cc]`;
const ghostButtonLinkClass = `${baseButtonLinkClass} border-transparent bg-transparent px-4 text-foreground hover:bg-accent`;
const outlineButtonLinkClass = `${baseButtonLinkClass} border-border bg-background px-4 text-foreground hover:bg-accent`;
const largePrimaryButtonLinkClass = `${primaryButtonLinkClass} h-12 px-5 text-base`;
const largeOutlineButtonLinkClass = `${outlineButtonLinkClass} h-12 px-5 text-base`;

export function MarketingLandingPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      data-testid="marketing-page"
    >
      <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top_left,_rgba(26,115,232,0.18),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(52,168,83,0.14),_transparent_22%),linear-gradient(180deg,_rgba(255,255,255,0.6),_rgba(248,250,253,0))]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-[18px] border border-border/80 bg-white/72 px-4 py-3 backdrop-blur-xl sm:px-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-[14px] bg-primary text-sm font-semibold text-primary-foreground">
              P
            </div>
            <div>
              <p className="text-sm font-bold tracking-[-0.03em]">PSMS</p>
              <p className="text-xs text-muted-foreground">Personal scheduling workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/auth"
              data-testid="marketing-auth-link"
              className={ghostButtonLinkClass}
            >
              Login
            </a>
            <a
              href="/auth"
              data-testid="marketing-primary-cta"
              className={primaryButtonLinkClass}
            >
              Get started
            </a>
          </div>
        </header>

        <main className="flex-1 py-8 sm:py-10 lg:py-12">
          <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="space-y-6">
              <Badge className="rounded-md border-0 bg-[#e8f0fe] px-3 py-1 text-[#174ea6]">
                Scheduling system for focused daily planning
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-[2.9rem] leading-[0.96] font-extrabold tracking-[-0.07em] text-balance sm:text-[4rem] lg:text-[5.35rem]">
                  Plan the day, manage appointments and keep your calendar under control.
                </h1>
                <p className="max-w-2xl text-[1.02rem] leading-8 text-muted-foreground sm:text-[1.1rem]">
                  PSMS gives you a clear entry point before login, then a full workspace for
                  calendar planning, reminders, statistics and export workflows without visual
                  clutter.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="/auth"
                  data-testid="marketing-open-workspace"
                  className={largePrimaryButtonLinkClass}
                >
                  Start with login
                  <ArrowRightIcon />
                </a>
                <a
                  href="/calendar"
                  data-testid="marketing-secondary-cta"
                  className={largeOutlineButtonLinkClass}
                >
                  Open calendar
                </a>
              </div>
              <div className="grid gap-3 pt-2 sm:grid-cols-3">
                <Card className="bg-white/85">
                  <CardContent className="pt-5">
                    <p className="text-3xl font-bold tracking-[-0.06em] text-foreground">8</p>
                    <p className="mt-1 text-sm text-muted-foreground">core workspace modules</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/85">
                  <CardContent className="pt-5">
                    <p className="text-3xl font-bold tracking-[-0.06em] text-foreground">1</p>
                    <p className="mt-1 text-sm text-muted-foreground">shared shell across the app</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/85">
                  <CardContent className="pt-5">
                    <p className="text-3xl font-bold tracking-[-0.06em] text-foreground">1</p>
                    <p className="mt-1 text-sm text-muted-foreground">auth gateway before workspace</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="overflow-visible border-border/80 bg-white/88 shadow-[0_18px_48px_rgba(60,64,67,0.14)]">
              <CardHeader className="gap-4 border-b border-border/70 pb-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Workspace snapshot</CardTitle>
                    <CardDescription>
                      A bright planning surface with agenda, metrics and reminders in one system.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <span className="size-3 rounded-full bg-[#ea4335]" />
                    <span className="size-3 rounded-full bg-[#fbbc04]" />
                    <span className="size-3 rounded-full bg-[#34a853]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[16px] border border-border bg-muted/45 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">March 2026</p>
                        <p className="text-xs text-muted-foreground">This week</p>
                      </div>
                      <Badge variant="secondary" className="rounded-md">
                        Active
                      </Badge>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {["M", "T", "W", "T", "F", "S", "S"].map((label, index) => (
                        <div
                          key={`${label}-${index}`}
                          className={`grid aspect-square place-items-center rounded-[14px] border text-xs font-medium ${
                            index === 4
                              ? "border-primary/25 bg-[#e8f0fe] text-[#174ea6]"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          {index + 10}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 rounded-[16px] border border-border bg-background p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Today</p>
                        <p className="text-xs text-muted-foreground">Agenda overview</p>
                      </div>
                      <Clock3Icon className="size-4 text-muted-foreground" />
                    </div>
                    {schedulePreview.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-[14px] border border-border bg-muted/35 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.time}</p>
                          </div>
                          <span
                            className="rounded-md px-2 py-1 text-[11px] font-semibold"
                            style={{
                              backgroundColor: `${item.color}16`,
                              color: item.color,
                            }}
                          >
                            {item.state}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[14px] border border-border bg-background p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Layers3Icon className="size-4 text-primary" />
                      Modules
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Calendar, appointments, notifications, statistics and export flows share the
                      same layout language.
                    </p>
                  </div>
                  <div className="rounded-[14px] border border-border bg-background p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <SparklesIcon className="size-4 text-primary" />
                      Clean UI
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Brighter surfaces, stronger spacing and moderate corner radius keep the
                      interface modern without feeling soft.
                    </p>
                  </div>
                  <div className="rounded-[14px] border border-border bg-background p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <CheckCircle2Icon className="size-4 text-primary" />
                      Ready to review
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      The landing page now gives a proper first impression before users move into
                      the working area.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="mt-12 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="bg-white/82">
              <CardHeader>
                <CardTitle>Why start here</CardTitle>
                <CardDescription>
                  A front-facing page that explains the system before users jump into the calendar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3 rounded-[14px] border border-border bg-background p-3.5">
                    <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p className="text-sm leading-6 text-muted-foreground">{benefit}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="grid gap-5 md:grid-cols-3">
              {featureCards.map((feature) => {
                const Icon = feature.icon;

                return (
                  <Card key={feature.title} className="bg-white/82">
                    <CardHeader className="gap-4">
                      <div className="grid size-11 place-items-center rounded-[14px] bg-[#e8f0fe] text-[#174ea6]">
                        <Icon className="size-5" />
                      </div>
                      <div className="space-y-2">
                        <CardTitle>{feature.title}</CardTitle>
                        <CardDescription className="leading-6">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
