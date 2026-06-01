"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageSection } from "@/components/layout/page-section";
import { getApiErrorMessage } from "@/lib/api-core";
import { type Tag } from "@/model/tags";
import {
  useCreateTagMutation,
  useDeleteTagMutation,
  useTagsQuery,
  useUpdateTagMutation,
} from "@/query/tags-hooks";

import { TagForm, PRESET_COLORS } from "@/components/tags/tag-form";
import { TagLibrary } from "@/components/tags/tag-library";

export default function TagsPage() {
  const tagsQuery = useTagsQuery();

  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[5]);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clear messages after a delay
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Click outside delete confirmation
  useEffect(() => {
    function handleClickOutside() {
      if (confirmDeleteId) setConfirmDeleteId(null);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [confirmDeleteId]);

  const resetForm = () => {
    setName("");
    setColor(PRESET_COLORS[5]);
    setEditingTag(null);
    setErrorMessage(null);
  };

  const createMutation = useCreateTagMutation({
    onSuccess: () => {
      resetForm();
      toast.success("Tag created successfully.");
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, "Unable to create tag."));
    },
  });

  const updateMutation = useUpdateTagMutation({
    onSuccess: () => {
      resetForm();
      toast.success("Tag updated successfully.");
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, "Unable to update tag."));
    },
  });

  const deleteMutation = useDeleteTagMutation({
    onSuccess: () => {
      setConfirmDeleteId(null);
      setErrorMessage(null);
      toast.success("Tag deleted successfully.");
      if (editingTag && !tagsQuery.data?.find((t) => t.id === editingTag.id)) {
        resetForm();
      }
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, "Unable to delete tag."));
    },
  });

  function handleSave() {
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Tag name is required.");
      return;
    }

    if (editingTag) {
      updateMutation.mutate({
        tagId: editingTag.id,
        payload: {
          name: trimmedName,
          color: color.trim() || undefined,
        },
      });
    } else {
      createMutation.mutate({
        name: trimmedName,
        color: color.trim() || undefined,
      });
    }
  }

  function handleEdit(tag: Tag) {
    setEditingTag(tag);
    setName(tag.name);
    setColor(tag.color ?? PRESET_COLORS[5]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(e: React.MouseEvent, tagId: string) {
    e.stopPropagation();
    if (confirmDeleteId === tagId) {
      deleteMutation.mutate(tagId);
    } else {
      setConfirmDeleteId(tagId);
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div data-testid="tags-page" className="space-y-6">
      <PageSection
        title="Tags"
        description="Organize appointment types and events using beautiful tags."
      >
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
            <TagForm
              name={name}
              setName={setName}
              color={color}
              setColor={setColor}
              editingTag={editingTag}
              onSave={handleSave}
              onReset={resetForm}
              isLoading={isLoading}
              errorMessage={errorMessage}
            />
          </div>
          <div className="space-y-4">
            <TagLibrary
              tags={tagsQuery.data ?? []}
              isLoading={tagsQuery.isLoading}
              isError={tagsQuery.isError}
              error={tagsQuery.error}
              confirmDeleteId={confirmDeleteId}
              onEdit={handleEdit}
              onDeleteRequest={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          </div>
        </div>
      </PageSection>
    </div>
  );
}

