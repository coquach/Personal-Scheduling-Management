"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useDeleteTeam } from "@/query/team-hooks";

interface DeleteTeamModalProps {
  teamId: string;
  teamName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteTeamModal({ teamId, teamName, open, onOpenChange }: DeleteTeamModalProps) {
  const router = useRouter();
  const [confirmationText, setConfirmationText] = useState("");
  
  const deleteMutation = useDeleteTeam();

  const isConfirmed = confirmationText === teamName;

  const handleDelete = () => {
    if (!isConfirmed) return;
    
    deleteMutation.mutate(teamId, {
      onSuccess: () => {
        onOpenChange(false);
        router.push("/teams");
      },
    });
  };

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      setConfirmationText("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Team</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the <strong>{teamName}</strong> team, 
            including all members, invitations, and team appointments.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-foreground">
              Please type <strong>{teamName}</strong> to confirm.
            </p>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={teamName}
              data-testid="delete-team-confirmation-input"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            disabled={!isConfirmed || deleteMutation.isPending} 
            onClick={handleDelete}
            data-testid="delete-team-confirm-btn"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
