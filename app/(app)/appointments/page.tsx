"use client";

import { useState } from "react";
import {
  CalendarClockIcon,
  PencilLineIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { appointmentRows } from "@/lib/scaffold-data";
import { PageSection } from "@/components/layout/page-section";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

function FilterInput({
  value,
  onChange,
  type = "text",
  placeholder,
  testId,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  testId: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      data-testid={testId}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-lg border border-border bg-input px-3.5 py-2 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/10"
    />
  );
}

export default function AppointmentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [tagValue, setTagValue] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [dateFromValue, setDateFromValue] = useState("");
  const [dateToValue, setDateToValue] = useState("");

  return (
    <div data-testid="appointments-page" className="space-y-6">
      <PageSection
        title="Appointments"
        description="Manage recurring events, statuses, reminders and quick edits from a single clean workspace."
        actions={
          <>
            <Button variant="outline">Export</Button>
            <Button
              data-testid="appointment-create-trigger"
              onClick={() => setIsDialogOpen(true)}
            >
              <PlusIcon />
              <span>New appointment</span>
            </Button>
          </>
        }
      >
        <Card>
          <CardContent className="space-y-5 pt-5">
            <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
              <FilterInput
                placeholder="Search appointments"
                value={searchValue}
                onChange={setSearchValue}
                testId="appointment-search-input"
              />
              <FilterInput
                placeholder="All tags"
                value={tagValue}
                onChange={setTagValue}
                testId="filter-tag"
              />
              <FilterInput
                placeholder="All status"
                value={statusValue}
                onChange={setStatusValue}
                testId="filter-status"
              />
              <FilterInput
                type="date"
                value={dateFromValue}
                onChange={setDateFromValue}
                testId="filter-date-from"
              />
              <FilterInput
                type="date"
                value={dateToValue}
                onChange={setDateToValue}
                testId="filter-date-to"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointmentRows.map((row) => (
                  <TableRow key={row.id} data-testid="appointment-row">
                    <TableCell>{row.date}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{row.title}</p>
                        <p className="text-xs text-muted-foreground">{row.time}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-md">
                        {row.tag}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="rounded-md">{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          data-testid="appointment-edit-trigger"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          <PencilLineIcon />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          data-testid="appointment-status-trigger"
                        >
                          <CalendarClockIcon />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          data-testid="appointment-delete-trigger"
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </PageSection>
      {isDialogOpen ? (
        <div
          className="rounded-[18px] border border-border bg-background p-5 shadow-[0_18px_38px_rgba(60,64,67,0.12)]"
          data-testid="appointment-form-modal"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
                Create new appointment
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Quick-create panel for scheduling review during UI iteration.
              </p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setIsDialogOpen(false)}>
              <span className="text-lg leading-none">×</span>
            </Button>
          </div>
          <div className="grid gap-4">
            <Input placeholder="Title" />
            <Textarea placeholder="Description" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="datetime-local" />
              <Input type="datetime-local" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Tags" />
              <Input placeholder="Status" />
            </div>
            <Alert data-testid="appointment-conflict-alert">
              <AlertTitle>Time conflict detected</AlertTitle>
              <AlertDescription>
                Overlaps with &quot;Doctor Appointment&quot; at 11:30.
              </AlertDescription>
            </Alert>
          </div>
          <div className="mt-5 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button>Save appointment</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
