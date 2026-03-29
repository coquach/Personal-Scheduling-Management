"use client";

import { useState } from "react";

import { profileData } from "@/lib/scaffold-data";
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

export default function ProfilePage() {
  const [successVisible, setSuccessVisible] = useState(false);
  const [passwordErrorVisible, setPasswordErrorVisible] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div data-testid="profile-page" className="space-y-6">
      <PageSection
        title="Profile"
        description="Manage account settings, timezone preferences and security actions."
      >
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input defaultValue={profileData.fullName} data-testid="profile-name-input" />
              <Input
                defaultValue={profileData.email}
                readOnly
                data-testid="profile-email-input"
              />
              <Input defaultValue={profileData.timezone} data-testid="profile-timezone-select" />
              <Button data-testid="profile-save" onClick={() => setSuccessVisible(true)}>
                Save profile
              </Button>
              {successVisible ? (
                <Alert data-testid="profile-success-banner">
                  Profile preferences saved successfully.
                </Alert>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="password"
                placeholder="Current password"
                data-testid="profile-current-password-input"
              />
              <Input
                type="password"
                placeholder="New password"
                data-testid="profile-new-password-input"
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                data-testid="profile-confirm-password-input"
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  data-testid="profile-password-save"
                  onClick={() => setPasswordErrorVisible(true)}
                >
                  Update password
                </Button>
                <Button
                  variant="destructive"
                  data-testid="profile-delete-trigger"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete account
                </Button>
              </div>
              {passwordErrorVisible ? (
                <Alert variant="destructive" data-testid="profile-password-error">
                  Current password validation failed. Re-enter credentials to continue.
                </Alert>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </PageSection>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent data-testid="profile-delete-dialog">
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Type your email to confirm"
            defaultValue={profileData.email}
            data-testid="profile-delete-confirmation-input"
          />
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button variant="destructive" data-testid="profile-delete-submit">
              Confirm deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
