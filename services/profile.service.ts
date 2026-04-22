import { browserApiRequest } from "@/lib/browser-api";

export type UserProfile = {
  id: string;
  email: string;
  displayName: string | null;
  timezone: string;
  createdAt: string;
  updatedAt?: string;
};

export async function getProfile() {
  return browserApiRequest<UserProfile>("/users/me");
}

export async function updateProfile(input: {
  displayName?: string;
  timezone?: string;
}) {
  return browserApiRequest<UserProfile>("/users/me", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
