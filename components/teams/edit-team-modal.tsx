"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { useUpdateTeam } from "@/query/team-hooks";
import {
  updateTeamRequestSchema,
  type UpdateTeamRequest,
} from "@/model/team";

interface EditTeamModalProps {
  teamId: string;
  initialName: string;
  initialDescription?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditTeamModal({ teamId, initialName, initialDescription, open, onOpenChange }: EditTeamModalProps) {
  const updateMutation = useUpdateTeam(teamId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateTeamRequest>({
    resolver: zodResolver(updateTeamRequestSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      name: initialName,
      description: initialDescription || "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initialName,
        description: initialDescription || "",
      });
    }
  }, [open, initialName, initialDescription, reset]);

  const onSubmit = (data: UpdateTeamRequest) => {
    // Remove description if empty to keep it undefined
    const payload = {
      ...data,
      description: data.description || undefined,
    };
    
    updateMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Team updated successfully.");
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) {
        reset();
      }
    }}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit team details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label>Team Name</Label>
              <Input
                {...register("name")}
                placeholder="e.g. Marketing Department"
                data-testid="edit-team-name-input"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Description (Optional)</Label>
              <Textarea
                {...register("description")}
                placeholder="What is this team about?"
                data-testid="edit-team-description-input"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending || !isDirty} data-testid="edit-team-save">
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
