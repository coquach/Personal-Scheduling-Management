"use client";

import { exportPreviewRows } from "@/lib/scaffold-data";
import { PageSection } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ExportPage() {
  return (
    <div data-testid="export-page" className="space-y-6">
      <PageSection
        title="Export"
        description="Create clean, filterable exports from your schedule history."
      >
        <Card>
          <CardContent className="space-y-5 pt-5">
            <div className="grid gap-3 lg:grid-cols-5">
              <Input type="date" data-testid="export-date-from" />
              <Input type="date" data-testid="export-date-to" />
              <Input placeholder="Tag" data-testid="export-tag-filter" />
              <Input placeholder="Status" data-testid="export-status-filter" />
              <Button data-testid="export-submit">Generate export</Button>
            </div>
            <Card data-testid="export-preview-table" size="sm">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Tag</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exportPreviewRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.title}</TableCell>
                        <TableCell>{row.tag}</TableCell>
                        <TableCell>{row.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card data-testid="export-empty-state" size="sm">
              <CardHeader>
                <CardTitle>No export yet</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                Once filters are connected to the API, this area can also show true empty search
                results.
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </PageSection>
    </div>
  );
}
