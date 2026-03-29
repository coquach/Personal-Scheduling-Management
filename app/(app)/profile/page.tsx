"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProfile, updateProfile } from "@/api/profile";
import { getApiErrorMessage } from "@/api/client";
import { PageSection } from "@/components/layout/page-section";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/query/keys";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: queryKeys.profile.detail,
    queryFn: getProfile,
  });

  const [draftProfile, setDraftProfile] = useState<{
    displayName: string;
    timezone: string;
  } | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (profile) => {
      setFeedbackMessage("Profile preferences saved successfully.");
      setErrorMessage(null);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.profile.detail,
      });
      setDraftProfile({
        displayName: profile.displayName ?? "",
        timezone: profile.timezone,
      });
    },
    onError: (error) => {
      setFeedbackMessage(null);
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to save profile changes. Please check the values and try again.",
        ),
      );
    },
  });

  function handleSaveProfile() {
    setFeedbackMessage(null);
    setErrorMessage(null);

    updateMutation.mutate({
      displayName: (draftProfile?.displayName ?? profileQuery.data?.displayName ?? "").trim(),
      timezone: (draftProfile?.timezone ?? profileQuery.data?.timezone ?? "").trim(),
    });
  }

  const displayName = draftProfile?.displayName ?? profileQuery.data?.displayName ?? "";
  const timezone = draftProfile?.timezone ?? profileQuery.data?.timezone ?? "";

  return (
    <div data-testid="profile-page" className="space-y-6">
      <PageSection
        title="Profile"
        description="Manage account settings and timezone preferences using the current backend profile APIs."
      >
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileQuery.isLoading ? (
                <Alert>
                  <AlertDescription>Loading profile...</AlertDescription>
                </Alert>
              ) : null}
              {profileQuery.isError ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    {getApiErrorMessage(
                      profileQuery.error,
                      "Unable to load profile information.",
                    )}
                  </AlertDescription>
                </Alert>
              ) : null}
              <Input
                value={displayName}
                onChange={(event) =>
                  setDraftProfile((current) => ({
                    displayName: event.target.value,
                    timezone: current?.timezone ?? profileQuery.data?.timezone ?? "",
                  }))
                }
                data-testid="profile-name-input"
                disabled={profileQuery.isLoading || updateMutation.isPending}
              />
              <Input
                value={profileQuery.data?.email ?? ""}
                readOnly
                data-testid="profile-email-input"
              />
              <Input
                value={timezone}
                onChange={(event) =>
                  setDraftProfile((current) => ({
                    displayName:
                      current?.displayName ?? profileQuery.data?.displayName ?? "",
                    timezone: event.target.value,
                  }))
                }
                data-testid="profile-timezone-select"
                placeholder="Asia/Ho_Chi_Minh"
                disabled={profileQuery.isLoading || updateMutation.isPending}
              />
              <p className="text-xs leading-5 text-muted-foreground">
                Backend currently validates timezone in IANA format, for example{" "}
                <span className="font-medium text-foreground">
                  Asia/Ho_Chi_Minh
                </span>
                .
              </p>
              <Button
                data-testid="profile-save"
                disabled={profileQuery.isLoading || updateMutation.isPending}
                onClick={handleSaveProfile}
              >
                {updateMutation.isPending ? "Saving..." : "Save profile"}
              </Button>
              {feedbackMessage ? (
                <Alert data-testid="profile-success-banner">
                  <AlertDescription>{feedbackMessage}</AlertDescription>
                </Alert>
              ) : null}
              {errorMessage ? (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>API scope aligned to backend</AlertTitle>
                <AlertDescription>
                  The current SE113 backend exposes profile read/update APIs.
                  Password change and account deletion are not available yet, so
                  these actions are intentionally disabled in the frontend.
                </AlertDescription>
              </Alert>
              <Input
                type="password"
                placeholder="Current password"
                data-testid="profile-current-password-input"
                disabled
              />
              <Input
                type="password"
                placeholder="New password"
                data-testid="profile-new-password-input"
                disabled
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                data-testid="profile-confirm-password-input"
                disabled
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  data-testid="profile-password-save"
                  disabled
                >
                  Update password
                </Button>
                <Button
                  variant="destructive"
                  data-testid="profile-delete-trigger"
                  disabled
                >
                  Delete account
                </Button>
              </div>
              <Alert data-testid="profile-password-error">
                <AlertDescription>
                  Waiting for backend APIs for password updates and account
                  deletion.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </PageSection>
    </div>
  );
}
