"use client";

import { useState } from "react";
import { MailIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInviteMember, useSearchUserByEmailMutation } from "@/query/team-hooks";
import { toast } from "sonner";

export default function InviteMemberModal({
  teamId,
  open,
  onOpenChange,
}: {
  teamId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");

  const searchUserMutation = useSearchUserByEmailMutation();
  const inviteMutation = useInviteMember(teamId);

  const handleInvite = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter an email address.");
      return;
    }

    // 1. Search for user by email to get their UUID
    try {
      const user = await searchUserMutation.mutateAsync(trimmedEmail);
      
      if (!user || !user.id) {
        toast.error("User not found in the system.");
        return;
      }

      // 2. Send invitation using the user's UUID
      await inviteMutation.mutateAsync({
        invitedUserId: user.id,
        role: role,
      });

      toast.success("Invitation sent successfully.");
      onOpenChange(false);
      setEmail("");
      setRole("MEMBER");
    } catch (error) {
      // Error is handled globally by MutationCache
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Enter the email address of the user you want to invite to your team.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              User search by email uses the backend `/users/search` endpoint.
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(val) => setRole(val as "ADMIN" | "MEMBER")}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">MEMBER</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleInvite} 
            disabled={searchUserMutation.isPending || inviteMutation.isPending}
          >
            {searchUserMutation.isPending || inviteMutation.isPending ? "Inviting..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
