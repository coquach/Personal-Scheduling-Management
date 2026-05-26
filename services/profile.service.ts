import { browserApiRequest } from "@/lib/api-client";
import {
  updateProfileInputSchema,
  userProfileSchema,
  type UpdateProfileInput,
  type UserProfile,
} from "@/model/profile";

export async function getProfile(): Promise<UserProfile> {
  const raw = await browserApiRequest<unknown>("/users/me");
  return userProfileSchema.parse(raw);
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UserProfile> {
  const parsedInput = updateProfileInputSchema.parse(input);
  const raw = await browserApiRequest<unknown>("/users/me", {
    method: "PUT",
    body: JSON.stringify(parsedInput),
  });
  return userProfileSchema.parse(raw);
}
