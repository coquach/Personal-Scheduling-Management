'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarIcon,
  CheckCircle2Icon,
  FileDownIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Label as PieLabel,
  XAxis,
} from 'recharts';
import { z } from 'zod';

import { PageSection } from '@/components/layout/page-section';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { DateTimePicker } from '@/components/ui/datetime-picker';

import { getApiErrorMessage } from '@/lib/api-core';
import {
  type ExportAppointmentsInput
} from '@/model/statistics';
import { useAppointmentsListQuery } from '@/query/appointments-hooks';
import {
  useExportAppointments,
  useGetStatistics,
} from '@/query/statistics-hooks';
import { useTagsQuery } from '@/query/tags-hooks';

const exportFormSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tagId: z.string().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'MISSED', 'all']).optional(),
  query: z.string().max(255).optional(),
});
type ExportFormValues = z.infer<typeof exportFormSchema>;

function getDefaultDates() {
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  oneWeekAgo.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  return {
    startDate: oneWeekAgo.toISOString().slice(0, 16),
    endDate: endOfToday.toISOString().slice(0, 16),
  };
}

export default function StatisticsPage() {
  const [dateFromValue, setDateFromValue] = useState<string | undefined>(
    getDefaultDates().startDate,
  );
  const [dateToValue, setDateToValue] = useState<string | undefined>(
    getDefaultDates().endDate,
  );
  const [exportError, setExportError] = useState<string | null>(null);

  const dateRangeValidation = useMemo(() => {
    if (!dateFromValue || !dateToValue) return { isValid: true, error: null };
    const from = new Date(dateFromValue).getTime();
    const to = new Date(dateToValue).getTime();
    if (to < from)
      return { isValid: false, error: 'End date cannot be before start date.' };
    const diffDays = (to - from) / (1000 * 3600 * 24);
    if (diffDays > 30)
      return { isValid: false, error: 'Date range cannot exceed 30 days.' };
    return { isValid: true, error: null };
  }, [dateFromValue, dateToValue]);

  const validDateFrom = dateRangeValidation.isValid
    ? dateFromValue
    : getDefaultDates().startDate;
  const validDateTo = dateRangeValidation.isValid
    ? dateToValue
    : getDefaultDates().endDate;

  const [manualGroupBy, setManualGroupBy] = useState<'day' | 'week' | null>(null);

  const groupBy = useMemo(() => {
    if (manualGroupBy) return manualGroupBy;
    if (!validDateFrom || !validDateTo) return 'day' as const;
    const from = new Date(validDateFrom).getTime();
    const to = new Date(validDateTo).getTime();
    const diffDays = (to - from) / (1000 * 3600 * 24);
    if (diffDays > 14) return 'week' as const;
    return 'day' as const;
  }, [validDateFrom, validDateTo, manualGroupBy]);

  const {
    data: stats,
    isLoading,
    isError,
    error,
  } = useGetStatistics({
    startDate: validDateFrom
      ? new Date(validDateFrom).toISOString()
      : new Date().toISOString(),
    endDate: validDateTo
      ? new Date(validDateTo).toISOString()
      : new Date().toISOString(),
    groupBy: groupBy,
  });

  const { data: tagsData } = useTagsQuery();
  const tags = tagsData || [];

  const { data: appointmentsData } = useAppointmentsListQuery({
    page: 1,
    limit: 1000,
    fromDate: validDateFrom
      ? new Date(validDateFrom).toISOString()
      : new Date().toISOString(),
    toDate: validDateTo
      ? new Date(validDateTo).toISOString()
      : new Date().toISOString(),
  });

  const tagDistribution = useMemo(() => {
    if (!appointmentsData?.items) return [];

    const countByTag: Record<
      string,
      { name: string; color: string; value: number }
    > = {};
    let totalTags = 0;

    appointmentsData.items.forEach((apt) => {
      apt.tags.forEach((tag) => {
        if (!countByTag[tag.id]) {
          countByTag[tag.id] = {
            name: tag.name,
            color: tag.color || 'hsl(var(--muted-foreground))',
            value: 0,
          };
        }
        countByTag[tag.id].value += 1;
        totalTags += 1;
      });
    });

    if (totalTags === 0) return [];

    return Object.values(countByTag).sort((a, b) => b.value - a.value);
  }, [appointmentsData]);

  const totalTagsCount = useMemo(() => {
    return tagDistribution.reduce((acc, curr) => acc + curr.value, 0);
  }, [tagDistribution]);

  const exportMutation = useExportAppointments();

  const { register, handleSubmit, control } = useForm<ExportFormValues>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      query: '',
    },
  });

  const onExportSubmit = (data: ExportFormValues) => {
    setExportError(null);
    const payload: ExportAppointmentsInput = { 
      ...data,
      status: data.status === 'all' ? undefined : data.status,
      tagId: data.tagId === 'all' ? undefined : data.tagId,
    };
    
    if (payload.startDate)
      payload.startDate = new Date(payload.startDate).toISOString();
    if (payload.endDate)
      payload.endDate = new Date(payload.endDate).toISOString();

    exportMutation.mutate(payload, {
      onError: (err) => {
        setExportError(
          getApiErrorMessage(err, 'Failed to export appointments.'),
        );
      },
    });
  };

  const chartConfig = {
    completed: {
      label: 'Completed',
      color: 'hsl(var(--primary))',
    },
    total: {
      label: 'Total',
      color: 'hsl(var(--muted-foreground))',
    },
  };

  return (
    <div data-testid="statistics-page" className="space-y-6">
      <PageSection
        title="Statistics"
        description="Productivity metrics, trends, and history export."
        actions={
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <DateTimePicker
              placeholder="From Date"
              value={dateFromValue}
              onChange={(val) => setDateFromValue(val)}
              className="w-[260px]"
              align="end"
            />
            <span className="text-muted-foreground text-sm font-medium">
              to
            </span>
            <DateTimePicker
              placeholder="To Date"
              value={dateToValue}
              onChange={(val) => setDateToValue(val)}
              className="w-[260px]"
              align="end"
            />
          </div>
        }
      >
        {!dateRangeValidation.isValid && (
          <Alert
            variant="destructive"
            className="rounded-2xl shadow-sm border-destructive/20 bg-destructive/5"
          >
            <AlertDescription className="font-medium">
              {dateRangeValidation.error}
            </AlertDescription>
          </Alert>
        )}

        {dateRangeValidation.isValid && isLoading && (
          <Alert className="animate-pulse rounded-2xl shadow-sm">
            <AlertDescription>Loading statistics...</AlertDescription>
          </Alert>
        )}

        {dateRangeValidation.isValid && isError && (
          <Alert
            variant="destructive"
            className="rounded-2xl shadow-sm border-destructive/20 bg-destructive/5"
          >
            <AlertDescription className="font-medium">
              {getApiErrorMessage(error, 'Failed to load statistics data.')}
            </AlertDescription>
          </Alert>
        )}

        {dateRangeValidation.isValid && !isLoading && !isError && stats && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {stats.totalAppointments === 0 ? (
              <div
                data-testid="statistics-empty-state"
                className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 p-12 text-center"
              >
                <div className="mb-4 flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                  <CalendarIcon className="size-10" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  No data for this period
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Try selecting a different date range or create some
                  appointments to see your productivity metrics.
                </p>
              </div>
            ) : (
              <>
                {/* Metric Cards */}
                <div className="grid gap-4 lg:grid-cols-4">
                  <Card
                    data-testid="statistics-total-card"
                    className="border-border/50 shadow-sm bg-card/60 backdrop-blur-xl"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <CalendarIcon className="size-4" /> Total Scheduled
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold tracking-[-0.04em] text-foreground">
                        {stats.totalAppointments}
                      </p>
                    </CardContent>
                  </Card>
                  <Card
                    data-testid="statistics-completed-card"
                    className="border-border/50 shadow-sm bg-card/60 backdrop-blur-xl relative overflow-hidden"
                  >
                    <div className="absolute -right-4 -top-4 size-24 rounded-full blur-3xl opacity-10 bg-primary pointer-events-none" />
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <CheckCircle2Icon className="size-4" /> Completed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold tracking-[-0.04em] text-foreground">
                        {stats.completedAppointments}
                      </p>
                    </CardContent>
                  </Card>
                  <Card
                    data-testid="statistics-completion-rate-card"
                    className="border-border/50 shadow-sm bg-card/60 backdrop-blur-xl"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <TrendingUpIcon className="size-4" /> Completion Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold tracking-[-0.04em] text-primary">
                        {stats.completionRate}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 size-24 rounded-full blur-3xl opacity-20 bg-primary pointer-events-none" />
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <TrendingUpIcon className="size-4" /> Peak Productivity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold tracking-[-0.04em] text-foreground drop-shadow-sm">
                        {stats.mostProductiveSlot
                          ? `${stats.mostProductiveSlot}:00`
                          : '--:--'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  {/* ... rest of the grid ... */}
                  {/* Chart Card */}
                  <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-xl flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle>Completion Trend</CardTitle>
                        <CardDescription>
                          {groupBy === 'day'
                            ? 'Daily completed vs scheduled tasks'
                            : 'Weekly completed vs scheduled tasks'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={groupBy}
                          onValueChange={(val) => setManualGroupBy(val as "day" | "week")}
                        >
                          <SelectTrigger
                            data-testid="statistics-period-filter"
                            className="h-8 w-[110px] text-xs font-semibold rounded-lg shadow-sm"
                          >
                            <span data-testid="statistics-period-label">
                              <SelectValue />
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="day" className="text-xs">Daily</SelectItem>
                            <SelectItem value="week" className="text-xs">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 pb-4">
                      {stats.trend.length === 0 ? (
                        <div className="flex h-[250px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20">
                          <p className="text-sm text-muted-foreground">
                            No trend data available.
                          </p>
                        </div>
                      ) : (
                        <ChartContainer
                          config={chartConfig}
                          className="min-h-[250px] w-full"
                        >
                          <BarChart
                            data={stats.trend}
                            accessibilityLayer
                            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                          >
                            <CartesianGrid
                              vertical={false}
                              strokeDasharray="3 3"
                              className="stroke-muted"
                            />
                            <XAxis
                              dataKey="bucket"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                              tickFormatter={(value: string) =>
                                value.slice(0, 10)
                              }
                              className="text-xs font-medium"
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar
                              dataKey="total"
                              fill="var(--color-total)"
                              radius={[4, 4, 0, 0]}
                              barSize={32}
                              opacity={0.3}
                            />
                            <Bar
                              dataKey="completed"
                              fill="var(--color-completed)"
                              radius={[4, 4, 0, 0]}
                              barSize={32}
                            />
                          </BarChart>
                        </ChartContainer>
                      )}
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    {/* Donut Chart */}
                    <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-xl">
                      <CardHeader>
                        <CardTitle>Tag Distribution</CardTitle>
                        <CardDescription>
                          Time allocation across categories
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center pb-4">
                        {tagDistribution.length === 0 ? (
                          <div className="flex h-[200px] items-center justify-center w-full rounded-2xl border border-dashed border-border bg-muted/20">
                            <p className="text-sm text-muted-foreground">
                              No tags assigned.
                            </p>
                          </div>
                        ) : (
                          <ChartContainer
                            config={{}}
                            className="h-[250px] w-full"
                          >
                            <PieChart>
                              <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                              />
                              <Pie
                                data={tagDistribution}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                outerRadius={80}
                                strokeWidth={5}
                              >
                                {tagDistribution.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                                <PieLabel
                                  content={({ viewBox }) => {
                                    if (
                                      viewBox &&
                                      'cx' in viewBox &&
                                      'cy' in viewBox
                                    ) {
                                      return (
                                        <text
                                          x={viewBox.cx}
                                          y={viewBox.cy}
                                          textAnchor="middle"
                                          dominantBaseline="middle"
                                        >
                                          <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            className="fill-foreground text-3xl font-bold"
                                          >
                                            {totalTagsCount}
                                          </tspan>
                                          <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 24}
                                            className="fill-muted-foreground text-xs"
                                          >
                                            Tags Total
                                          </tspan>
                                        </text>
                                      );
                                    }
                                  }}
                                />
                              </Pie>
                            </PieChart>
                          </ChartContainer>
                        )}
                      </CardContent>
                    </Card>

                    {/* Export Card */}
                    <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-xl">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FileDownIcon className="size-5" /> Export Data
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form
                          onSubmit={handleSubmit(onExportSubmit)}
                          className="space-y-4"
                        >
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Start Date
                              </Label>
                              <Input
                                {...register('startDate')}
                                type="date"
                                className="h-9 rounded-xl shadow-sm bg-background/50"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                End Date
                              </Label>
                              <Input
                                {...register('endDate')}
                                type="date"
                                className="h-9 rounded-xl shadow-sm bg-background/50"
                              />
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Status
                              </Label>
                              <Controller
                                control={control}
                                name="status"
                                render={({ field }) => (
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value || 'all'}
                                  >
                                    <SelectTrigger
                                      data-testid="export-status-filter"
                                      className="h-9 rounded-xl shadow-sm bg-background/50"
                                    >
                                      <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">
                                        All Status
                                      </SelectItem>
                                      <SelectItem value="SCHEDULED">
                                        Scheduled
                                      </SelectItem>
                                      <SelectItem value="COMPLETED">
                                        Completed
                                      </SelectItem>
                                      <SelectItem value="CANCELLED">
                                        Cancelled
                                      </SelectItem>
                                      <SelectItem value="MISSED">
                                        Missed
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Tag Filter
                              </Label>
                              <Controller
                                control={control}
                                name="tagId"
                                render={({ field }) => (
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value || 'all'}
                                  >
                                    <SelectTrigger
                                      data-testid="export-tag-filter"
                                      className="h-9 rounded-xl shadow-sm bg-background/50"
                                    >
                                      <SelectValue placeholder="All Tags" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">
                                        All Tags
                                      </SelectItem>
                                      {tags.map((tag) => (
                                        <SelectItem key={tag.id} value={tag.id}>
                                          <div className="flex items-center gap-2">
                                            <div
                                              className="size-2.5 rounded-full"
                                              style={{
                                                backgroundColor:
                                                  tag.color ||
                                                  'hsl(var(--muted-foreground))',
                                              }}
                                            />
                                            {tag.name}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              Search filter (Optional)
                            </Label>
                            <Input
                              {...register('query')}
                              placeholder="Keyword or tag..."
                              className="h-9 rounded-xl shadow-sm bg-background/50"
                            />
                          </div>
                          {exportError && (
                            <p
                              data-testid="export-error"
                              className="text-sm font-medium text-destructive"
                            >
                              {exportError}
                            </p>
                          )}
                          <Button
                            data-testid="export-submit"
                            type="submit"
                            disabled={exportMutation.isPending}
                            className="w-full rounded-xl shadow-sm transition-transform active:scale-95 mt-2"
                          >
                            {exportMutation.isPending
                              ? 'Exporting...'
                              : 'Download CSV'}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </PageSection>
    </div>
  );
}
