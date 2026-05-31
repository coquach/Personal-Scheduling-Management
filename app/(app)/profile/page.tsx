"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2Icon, MailIcon, MapPinIcon, UserCircleIcon } from "lucide-react";
import { useState } from "react";

import { PageSection } from "@/components/layout/page-section";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/api-core";
import { queryKeys } from "@/query/keys";
import { getProfile, updateProfile } from "@/services/profile.service";

const TIMEZONES = Intl.supportedValuesOf("timeZone");

function getInitials(name: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter((n) => n.trim().length > 0)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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

  // Auto-detect timezone if not set properly (UTC is default in db)
  if (profileQuery.isSuccess && !draftProfile && profileQuery.data) {
    let defaultTz = profileQuery.data.timezone;
    if (!defaultTz || defaultTz === "UTC") {
       try {
         defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
       } catch {
         defaultTz = "UTC";
       }
    }
    setDraftProfile({
      displayName: profileQuery.data.displayName ?? "",
      timezone: defaultTz,
    });
  }

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
    if (!draftProfile) return;
    setFeedbackMessage(null);
    setErrorMessage(null);

    updateMutation.mutate({
      displayName: draftProfile.displayName.trim(),
      timezone: draftProfile.timezone.trim(),
    });
  }

  const displayName = draftProfile?.displayName ?? profileQuery.data?.displayName ?? "";
  const email = profileQuery.data?.email ?? "";
  const timezone = draftProfile?.timezone ?? profileQuery.data?.timezone ?? "";
  
  const initials = getInitials(displayName || email);

  return (
    <div data-testid="profile-page">
      <PageSection>
        <div className="flex flex-col gap-8 max-w-3xl mx-auto mt-4">
          
          {/* Top Banner: Bento Hero Card */}
          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-primary/10 via-background to-muted/20">
            <CardContent className="p-8 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-primary/50 to-primary/20"></div>
              
              <Avatar className="w-28 h-28 border-4 border-background shadow-md">
                <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2 mt-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {displayName || "User"}
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-muted-foreground mt-2">
                  <div className="flex items-center justify-center gap-1.5 text-sm">
                    <MailIcon className="w-4 h-4 text-primary/70" />
                    <span>{email || "Loading..."}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-sm">
                    <MapPinIcon className="w-4 h-4 text-primary/70" />
                    <span>{timezone || "UTC"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Card: Form */}
          <Card className="border-border/50 shadow-sm backdrop-blur-xl bg-background/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <UserCircleIcon className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl">Account Settings</CardTitle>
              </div>
              <CardDescription>
                Update your display name and localized timezone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {profileQuery.isLoading && (
                <div className="flex items-center justify-center p-6 text-muted-foreground gap-2">
                  <Spinner size="lg" className="text-primary" />
                  Loading profile data...
                </div>
              )}
              
              {profileQuery.isError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>
                    {getApiErrorMessage(
                      profileQuery.error,
                      "Unable to load profile information.",
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {profileQuery.isSuccess && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2.5">
                    <Label htmlFor="displayName" className="font-semibold text-foreground">
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(event) =>
                        setDraftProfile((current) => ({
                          displayName: event.target.value,
                          timezone: current?.timezone ?? timezone,
                        }))
                      }
                      data-testid="profile-name-input"
                      disabled={updateMutation.isPending}
                      className="bg-muted/50 border-transparent focus:bg-background transition-colors"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="timezone" className="font-semibold text-foreground">
                      Timezone
                    </Label>
                    <Select
                      disabled={updateMutation.isPending}
                      value={timezone}
                      onValueChange={(val) =>
                        setDraftProfile((current) => ({
                          displayName: current?.displayName ?? displayName,
                          timezone: val || "",
                        }))
                      }
                    >
                      <SelectTrigger 
                        id="timezone"
                        data-testid="profile-timezone-select"
                        className="bg-muted/50 border-transparent focus:bg-background transition-colors w-full"
                      >
                        <SelectValue placeholder="Select a timezone" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {feedbackMessage && (
                <Alert className="border-primary/20 bg-primary/5 text-primary mt-4 animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle2Icon className="h-4 w-4 mr-2 inline" />
                  <AlertDescription className="inline-block font-medium">{feedbackMessage}</AlertDescription>
                </Alert>
              )}
              
              {errorMessage && (
                <Alert variant="destructive" className="mt-4 animate-in fade-in slide-in-from-bottom-2">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="pt-4 flex justify-end border-t border-border/50">
                <Button
                  data-testid="profile-save"
                  disabled={profileQuery.isLoading || updateMutation.isPending || !draftProfile}
                  isLoading={updateMutation.isPending}
                  onClick={handleSaveProfile}
                  className="rounded-full px-6 shadow-sm hover:-translate-y-0.5 transition-all"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageSection>
    </div>
  );
}
