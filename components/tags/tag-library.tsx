import { PencilLineIcon, TagIcon, Trash2Icon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-core";
import { type Tag } from "@/model/tags";

interface TagLibraryProps {
  tags: Tag[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  confirmDeleteId: string | null;
  onEdit: (tag: Tag) => void;
  onDeleteRequest: (e: React.MouseEvent, tagId: string) => void;
  isDeleting: boolean;
}

export function TagLibrary({
  tags,
  isLoading,
  isError,
  error,
  confirmDeleteId,
  onEdit,
  onDeleteRequest,
  isDeleting,
}: TagLibraryProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/50" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {getApiErrorMessage(error, "Unable to load tags.")}
        </AlertDescription>
      </Alert>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center animate-in fade-in">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <TagIcon className="size-8" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">No tags yet</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Create your first tag using the form on the left to start organizing your schedule with vibrant colors.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="group relative flex h-24 flex-col justify-between rounded-2xl border border-border/50 p-4 transition-all duration-300 hover:border-border hover:shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4"
          style={{
            backgroundColor: tag.color ? `${tag.color}08` : "var(--muted)",
          }}
        >
          {/* Decorative gradient blur */}
          <div 
            className="absolute -right-4 -top-4 size-16 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40"
            style={{ backgroundColor: tag.color ?? "#94a3b8" }}
          />

          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span
                className="size-3.5 rounded-full shadow-sm ring-2 ring-background/50"
                style={{ backgroundColor: tag.color ?? "#94a3b8" }}
              />
              <div>
                <p className="font-semibold text-foreground leading-none">{tag.name}</p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-end gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
            <Button
              variant="secondary"
              size="icon-sm"
              className="h-8 w-8 bg-background/80 hover:bg-background shadow-sm"
              data-testid="tag-rename-trigger"
              onClick={() => onEdit(tag)}
            >
              <PencilLineIcon className="size-3.5" />
            </Button>
            
            {confirmDeleteId === tag.id ? (
              <Button
                variant="destructive"
                size="sm"
                className="h-8 px-2.5 text-xs font-medium animate-in zoom-in-95"
                onClick={(e) => onDeleteRequest(e, tag.id)}
                disabled={isDeleting}
              >
                {isDeleting ? "..." : "Sure?"}
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="icon-sm"
                className="h-8 w-8 bg-background/80 hover:bg-destructive hover:text-destructive-foreground shadow-sm transition-colors"
                data-testid="tag-delete-trigger"
                onClick={(e) => onDeleteRequest(e, tag.id)}
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
