"use client";

import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";

import { calendarAgenda, calendarDays } from "@/lib/scaffold-data";
import { PageSection } from "@/components/layout/page-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CalendarPage() {
  return (
    <div data-testid="calendar-page" className="space-y-6">
      <PageSection
        title="March 2026"
        description="A clean scheduling workspace with quick navigation, soft blue accents and focused agenda cards."
        actions={
          <Button>
            <PlusIcon />
            <span>Create event</span>
          </Button>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
          <Card>
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <Tabs defaultValue="month" className="gap-3">
                  <TabsList>
                    <TabsTrigger value="day" data-testid="calendar-view-day">
                      Day
                    </TabsTrigger>
                    <TabsTrigger value="week" data-testid="calendar-view-week">
                      Week
                    </TabsTrigger>
                    <TabsTrigger value="month" data-testid="calendar-view-month">
                      Month
                    </TabsTrigger>
                    <TabsTrigger value="agenda" data-testid="calendar-view-agenda">
                      Agenda
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon-sm" data-testid="calendar-nav-prev">
                    <ChevronLeftIcon />
                  </Button>
                  <div
                    className="rounded-lg border border-border bg-muted/70 px-4 py-2 text-sm font-medium"
                    data-testid="calendar-period-label"
                  >
                    March 2026
                  </div>
                  <Button variant="outline" size="icon-sm" data-testid="calendar-nav-next">
                    <ChevronRightIcon />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-7 gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
                  <p key={label} className="px-2">
                    {label}
                  </p>
                ))}
              </div>
              <div className="grid gap-3 md:grid-cols-7">
                {calendarDays.map((day) => (
                  <button
                    key={`${day.weekday}-${day.day}`}
                    type="button"
                    data-testid="calendar-day-cell"
                    className={`min-h-32 rounded-[16px] border p-4 text-left transition-colors ${
                      day.selected
                        ? "border-primary/25 bg-[#e8f0fe]"
                        : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{day.weekday}</p>
                        <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                          {day.day}
                        </p>
                      </div>
                      {day.selected ? (
                        <span className="rounded-full bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">
                          Today
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">{day.summary}</p>
                    <div className="mt-5 flex items-center gap-1.5">
                      {day.dots.length > 0 ? (
                        day.dots.map((dot, index) => (
                          <span
                            key={`${day.day}-${index}`}
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: dot }}
                          />
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground/75">Open</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today</CardTitle>
                <p className="text-sm text-muted-foreground">Friday, March 14, 2026</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {calendarAgenda.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-[16px] border border-border bg-background p-4"
                    data-testid="calendar-slot"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{appointment.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{appointment.time}</p>
                      </div>
                      <Badge
                        className="rounded-md border-0 px-2.5"
                        style={{ backgroundColor: `${appointment.color}14`, color: appointment.color }}
                      >
                        {appointment.tag}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {appointment.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Daily focus</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-muted-foreground">
                <div className="rounded-[14px] border border-border bg-muted/55 p-4">
                  Conflict detection, event chips and month overview are ready for real API wiring.
                </div>
                <div className="rounded-[14px] border border-border bg-muted/55 p-4">
                  Mobile will use sidebar drawer while the calendar collapses into an agenda-first view.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageSection>
    </div>
  );
}
