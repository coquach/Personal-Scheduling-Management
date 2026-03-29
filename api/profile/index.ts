import { apiClient } from "@/api/client";

export type UserProfile = {
  id: string;
  email: string;
  displayName: string | null;
  timezone: string;
  createdAt: string;
  updatedAt?: string;
};

export async function getProfile() {
  return apiClient<UserProfile>("/profile");
}

export async function updateProfile(input: {
  displayName?: string;
  timezone?: string;
}) {
  return apiClient<UserProfile>("/profile", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
