"use client";

import { useState } from "react";
import { PencilLineIcon, Trash2Icon } from "lucide-react";

import { tagRows } from "@/lib/scaffold-data";
import { PageSection } from "@/components/layout/page-section";
import { Alert } from "@/components/ui/alert";
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

export default function TagsPage() {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#1d4ed8");
  const [renameValue, setRenameValue] = useState("Finance");
  const [showError, setShowError] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div data-testid="tags-page" className="space-y-6">
      <PageSection
        title="Tags"
        description="Organize appointment types with a restrained color system that stays bright and clear."
      >
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle>Create tag</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Tag name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                data-testid="tag-name-input"
              />
              <Input
                type="text"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                data-testid="tag-color-input"
              />
              <Button onClick={() => setShowError(true)} data-testid="tag-save">
                Save tag
              </Button>
              <div
                className="rounded-[16px] border border-border bg-muted/50 p-4"
                data-testid="tag-preview"
              >
                <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Preview
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
                  {name || "Work"}
                </div>
              </div>
              {showError ? (
                <Alert variant="destructive" data-testid="tag-name-error">
                  Tag name already exists in the current workspace.
                </Alert>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tag library</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {tagRows.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex flex-col gap-3 rounded-[16px] border border-border bg-background p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="size-3 rounded-full" style={{ backgroundColor: tag.color }} />
                      <div>
                        <p className="font-medium text-foreground">{tag.name}</p>
                        <p className="text-sm text-muted-foreground">{tag.appointments} appointments</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon-sm" data-testid="tag-rename-trigger">
                        <PencilLineIcon />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        data-testid="tag-delete-trigger"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-[16px] border border-border bg-muted/40 p-4">
                <p className="mb-3 text-sm font-medium text-foreground">Rename preview</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    data-testid="tag-rename-input"
                  />
                  <Button variant="outline" data-testid="tag-rename-save">
                    Save rename
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageSection>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent data-testid="tag-delete-dialog">
          <DialogHeader>
            <DialogTitle>Delete tag</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Removing this tag will detach it from existing appointments but keep the events.
          </p>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button variant="destructive" data-testid="tag-delete-confirm">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
