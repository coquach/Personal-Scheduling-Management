import { CheckIcon, PaletteIcon, XIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type Tag } from "@/model/tags";

export const PRESET_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#64748b", // Slate
];

interface TagFormProps {
  name: string;
  setName: (name: string) => void;
  color: string;
  setColor: (color: string) => void;
  editingTag: Tag | null;
  onSave: () => void;
  onReset: () => void;
  isLoading: boolean;
  errorMessage: string | null;
}

export function TagForm({
  name,
  setName,
  color,
  setColor,
  editingTag,
  onSave,
  onReset,
  isLoading,
  errorMessage,
}: TagFormProps) {
  const isCustomColor = !PRESET_COLORS.includes(color);

  return (
    <Card className="border-border/50 shadow-sm transition-all sticky top-20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {editingTag ? "Edit Tag" : "Create Tag"}
          {editingTag && (
            <Button variant="ghost" size="icon-sm" onClick={onReset} title="Cancel edit">
              <XIcon className="size-4" />
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          {editingTag
            ? "Update the details for this tag."
            : "Add a new tag to your library."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Tag Name</label>
          <Input
            placeholder="e.g. Work, Personal, Gym..."
            value={name}
            onChange={(event) => setName(event.target.value)}
            data-testid="tag-name-input"
            className="bg-muted/50"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Color</label>
          <div className="flex flex-wrap gap-2.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`size-8 rounded-full flex items-center justify-center transition-all ${
                  color === c
                    ? "ring-2 ring-ring ring-offset-2 ring-offset-background scale-110"
                    : "hover:scale-110 opacity-90 hover:opacity-100 shadow-sm"
                }`}
                style={{ backgroundColor: c }}
                type="button"
                title={c}
              >
                {color === c && (
                  <CheckIcon className="size-4 text-white drop-shadow-md" />
                )}
              </button>
            ))}
            
            <label
              title="Custom color"
              className={`relative size-8 flex items-center justify-center rounded-full cursor-pointer transition-all border ${
                isCustomColor
                  ? "ring-2 ring-ring ring-offset-2 ring-offset-background scale-110 border-transparent shadow-sm"
                  : "border-dashed border-border hover:border-foreground hover:scale-110 bg-muted/30"
              }`}
              style={{ backgroundColor: isCustomColor ? color : "transparent" }}
            >
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="sr-only"
                data-testid="tag-color-input"
              />
              {isCustomColor ? (
                <CheckIcon className="size-4 text-white drop-shadow-md mix-blend-difference" />
              ) : (
                <PaletteIcon className="size-4 text-muted-foreground" />
              )}
            </label>
          </div>
        </div>

        <div className="rounded-[16px] border border-border/50 bg-muted/30 p-5">
          <p className="mb-3 text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            Preview
          </p>
          <div
            data-testid="tag-preview"
            className="inline-flex items-center gap-2 rounded-lg border border-border/50 px-3 py-1.5 text-sm font-medium shadow-sm transition-colors"
            style={{ backgroundColor: `${color}15` }}
          >
            <span className="size-2.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
            <span className="text-foreground">{name || "Tag name"}</span>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={onSave}
          data-testid="tag-save"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : editingTag ? "Save Changes" : "Create Tag"}
        </Button>

        {errorMessage && (
          <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
