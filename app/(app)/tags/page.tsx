"use client";

import { useState } from "react";
import { PencilLineIcon, Trash2Icon } from "lucide-react";

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
import { getApiErrorMessage } from "@/lib/backend-api";
import {
  type Tag,
} from "@/services/tags.service";
import {
  useCreateTagMutation,
  useDeleteTagMutation,
  useTagsQuery,
  useUpdateTagMutation,
} from "@/query/tags-hooks";

export default function TagsPage() {
  const tagsQuery = useTagsQuery();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#1d4ed8");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameColor, setRenameColor] = useState("#1d4ed8");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const createMutation = useCreateTagMutation({
    onSuccess: () => {
      setName("");
      setColor("#1d4ed8");
      setErrorMessage(null);
      setFeedbackMessage("Tag created successfully.");
    },
    onError: (error) => {
      setFeedbackMessage(null);
      setErrorMessage(getApiErrorMessage(error, "Unable to create tag."));
    },
  });

  const updateMutation = useUpdateTagMutation({
    onSuccess: () => {
      setEditingTag(null);
      setRenameValue("");
      setRenameColor("#1d4ed8");
      setErrorMessage(null);
      setFeedbackMessage("Tag updated successfully.");
    },
    onError: (error) => {
      setFeedbackMessage(null);
      setErrorMessage(getApiErrorMessage(error, "Unable to update tag."));
    },
  });

  const deleteMutation = useDeleteTagMutation({
    onSuccess: () => {
      setDeleteDialogOpen(false);
      setDeleteTagId(null);
      setErrorMessage(null);
      setFeedbackMessage("Tag deleted successfully.");
    },
    onError: (error) => {
      setFeedbackMessage(null);
      setErrorMessage(getApiErrorMessage(error, "Unable to delete tag."));
    },
  });

  function handleCreateTag() {
    setErrorMessage(null);
    setFeedbackMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Tag name is required.");
      return;
    }

    createMutation.mutate({
      name: trimmedName,
      color: color.trim() || undefined,
    });
  }

  function openEditDialog(tag: Tag) {
    setErrorMessage(null);
    setFeedbackMessage(null);
    setEditingTag(tag);
    setRenameValue(tag.name);
    setRenameColor(tag.color ?? "#1d4ed8");
  }

  function handleUpdateTag() {
    if (!editingTag) {
      return;
    }

    setErrorMessage(null);
    setFeedbackMessage(null);

    const trimmedName = renameValue.trim();
    if (!trimmedName) {
      setErrorMessage("Tag name is required.");
      return;
    }

    updateMutation.mutate({
      tagId: editingTag.id,
      payload: {
        name: trimmedName,
        color: renameColor.trim() || undefined,
      },
    });
  }

  function openDeleteDialog(tagId: string) {
    setDeleteTagId(tagId);
    setDeleteDialogOpen(true);
  }

  function handleDeleteTag() {
    if (!deleteTagId) {
      return;
    }

    deleteMutation.mutate(deleteTagId);
  }

  function closeEditDialog() {
    setEditingTag(null);
  }

  function closeDeleteDialog() {
    setDeleteDialogOpen(false);
    setDeleteTagId(null);
  }

  return (
    <div data-testid="tags-page" className="space-y-6">
      <PageSection
        title="Tags"
        description="Organize appointment types using tag APIs from the backend."
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
              <Button
                onClick={handleCreateTag}
                data-testid="tag-save"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Saving..." : "Save tag"}
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
              {errorMessage ? (
                <Alert variant="destructive" data-testid="tag-name-error">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : null}
              {feedbackMessage ? (
                <Alert>
                  <AlertDescription>{feedbackMessage}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tag library</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tagsQuery.isLoading ? (
                <Alert>
                  <AlertDescription>Loading tags...</AlertDescription>
                </Alert>
              ) : null}
              {tagsQuery.isError ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    {getApiErrorMessage(tagsQuery.error, "Unable to load tags.")}
                  </AlertDescription>
                </Alert>
              ) : null}
              <div className="grid gap-3">
                {(tagsQuery.data ?? []).map((tag) => (
                  <div
                    key={tag.id}
                    className="flex flex-col gap-3 rounded-[16px] border border-border bg-background p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: tag.color ?? "#94a3b8" }}
                      />
                      <div>
                        <p className="font-medium text-foreground">{tag.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {tag.color ?? "No color"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        data-testid="tag-rename-trigger"
                        onClick={() => openEditDialog(tag)}
                      >
                        <PencilLineIcon />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        data-testid="tag-delete-trigger"
                        onClick={() => openDeleteDialog(tag.id)}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </div>
                ))}
                {!tagsQuery.isLoading && !tagsQuery.isError && (tagsQuery.data ?? []).length === 0 ? (
                  <div className="rounded-[16px] border border-border bg-background p-4 text-sm text-muted-foreground">
                    No tags yet. Create your first tag to organize appointments.
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageSection>
      <Dialog
        open={Boolean(editingTag)}
        onOpenChange={(open) => {
          if (!open) {
            closeEditDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              data-testid="tag-rename-input"
              placeholder="Tag name"
            />
            <Input
              type="text"
              value={renameColor}
              onChange={(event) => setRenameColor(event.target.value)}
              placeholder="#1d4ed8"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              Cancel
            </Button>
            <Button
              variant="outline"
              data-testid="tag-rename-save"
              onClick={handleUpdateTag}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDialog();
          } else {
            setDeleteDialogOpen(true);
          }
        }}
      >
        <DialogContent data-testid="tag-delete-dialog">
          <DialogHeader>
            <DialogTitle>Delete tag</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Removing this tag will detach it from existing appointments but keep the events.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-testid="tag-delete-confirm"
              onClick={handleDeleteTag}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
