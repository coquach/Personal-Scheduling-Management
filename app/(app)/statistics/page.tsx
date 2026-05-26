"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, DownloadIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { PageSection } from "@/components/layout/page-section";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getApiErrorMessage } from "@/lib/api-core";
import {
  exportAppointmentsInputSchema,
  type ExportAppointmentsInput,
  type GetStatisticsInput
} from "@/model/statistics";
import { useExportAppointments, useGetStatistics } from "@/query/statistics-hooks";

function getThisWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  
  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    startDate: monday.toISOString(),
    endDate: sunday.toISOString(),
  };
}

export default function StatisticsPage() {
  const [period] = useState<GetStatisticsInput>(() => getThisWeekDates());
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data: stats, isLoading, isError, error } = useGetStatistics(period);
  const exportMutation = useExportAppointments();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExportAppointmentsInput>({
    resolver: zodResolver(exportAppointmentsInputSchema),
    defaultValues: {
      startDate: period.startDate,
      endDate: period.endDate,
    },
  });

  const handleOpenExport = () => {
    reset({
      startDate: period.startDate,
      endDate: period.endDate,
    });
    setExportError(null);
    setIsExportDialogOpen(true);
  };

  const onExportSubmit = (data: ExportAppointmentsInput) => {
    setExportError(null);
    exportMutation.mutate(data, {
      onSuccess: () => {
        setIsExportDialogOpen(false);
      },
      onError: (err) => {
        setExportError(getApiErrorMessage(err, "Failed to export appointments."));
      },
    });
  };

  const formattedPeriodLabel = useMemo(() => {
    if (!period.startDate || !period.endDate) return "All time";
    const start = new Date(period.startDate).toLocaleDateString();
    const end = new Date(period.endDate).toLocaleDateString();
    return `${start} - ${end}`;
  }, [period]);

  return (
    <div data-testid="statistics-page" className="space-y-6">
      <PageSection
        title="Statistics"
        description="Weekly productivity metrics, tag distribution and completion trends."
        actions={
          <>
            <Button variant="outline" data-testid="statistics-period-filter">
              <CalendarIcon className="mr-2 h-4 w-4" />
              This week
            </Button>
            <Button onClick={handleOpenExport} data-testid="statistics-export-trigger">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export
            </Button>
          </>
        }
      >
        <p
          className="text-sm font-medium text-muted-foreground"
          data-testid="statistics-period-label"
        >
          {formattedPeriodLabel}
        </p>

        {isLoading && (
          <Alert>
            <AlertDescription>Loading statistics...</AlertDescription>
          </Alert>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {getApiErrorMessage(error, "Failed to load statistics data.")}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !isError && stats && (
          <>
            <div className="grid gap-4 lg:grid-cols-3">
              <Card data-testid="statistics-total-card">
                <CardHeader>
                  <CardTitle>Total appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
                    {stats.totalAppointments}
                  </p>
                </CardContent>
              </Card>
              <Card data-testid="statistics-completed-card">
                <CardHeader>
                  <CardTitle>Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
                    {stats.completedAppointments}
                  </p>
                </CardContent>
              </Card>
              <Card data-testid="statistics-completion-rate-card">
                <CardHeader>
                  <CardTitle>Completion rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
                    {stats.completionRate}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Completion Trend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.trend.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No trend data available.</p>
                  ) : (
                    stats.trend.map((item) => (
                      <div key={item.bucket} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{item.bucket}</span>
                          <span className="text-muted-foreground">
                            {item.completed} / {item.total}
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ 
                              width: `${(item.completed / Math.max(1, item.total)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Most productive time slot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!stats.mostProductiveSlot ? (
                    <p className="text-sm text-muted-foreground">No completed appointments yet.</p>
                  ) : (
                    <div className="rounded-[16px] border border-border bg-background p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-foreground">{stats.mostProductiveSlot}</span>
                        <span className="text-sm text-muted-foreground">Highest completion rate</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {stats.totalAppointments === 0 && (
              <Card data-testid="statistics-empty-state">
                <CardHeader>
                  <CardTitle>No activity</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                  When a period has limited data, this card guides the user back to scheduling and
                  completion habits.
                </CardContent>
              </Card>
            )}
          </>
        )}
      </PageSection>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit(onExportSubmit)}>
            <DialogHeader>
              <DialogTitle>Export Data (CSV)</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Start Date</Label>
                  <Input {...register("startDate")} type="date" />
                  {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>End Date</Label>
                  <Input {...register("endDate")} type="date" />
                  {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
                </div>
              </div>
              
              <div className="space-y-1">
                <Label>Search Query (Optional)</Label>
                <Input {...register("query")} placeholder="Filter by title or description" />
                {errors.query && <p className="text-sm text-destructive">{errors.query.message}</p>}
              </div>

              {exportError && (
                <Alert variant="destructive">
                  <AlertDescription>{exportError}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={exportMutation.isPending}>
                {exportMutation.isPending ? "Exporting..." : "Download CSV"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
