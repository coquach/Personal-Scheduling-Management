"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

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
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useCreateTeam } from "@/query/team-hooks";
import {
  createTeamRequestSchema,
  type CreateTeamRequest,
} from "@/model/validation/team";
import { getApiErrorMessage } from "@/lib/api-core";

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTeamModal({ open, onOpenChange }: CreateTeamModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const createMutation = useCreateTeam();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTeamRequest>({
    resolver: zodResolver(createTeamRequestSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: CreateTeamRequest) => {
    setApiError(null);
    createMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        reset();
      },
      onError: (err) => {
        setApiError(getApiErrorMessage(err, "Failed to create team."));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) {
        reset();
        setApiError(null);
      }
    }}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create new team</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label>Team Name</Label>
              <Input
                {...register("name")}
                placeholder="e.g. Marketing Department"
                data-testid="team-name-input"
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
                data-testid="team-description-input"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {apiError && (
              <Alert variant="destructive">
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
                setApiError(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} data-testid="team-save">
              {createMutation.isPending ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
