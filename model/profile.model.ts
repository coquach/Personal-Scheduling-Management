export type UserProfile = {
  id: string;
  email: string;
  displayName: string | null;
  timezone: string;
  createdAt: string;
  updatedAt?: string;
};

export type UpdateProfileInput = {
  displayName?: string;
  timezone?: string;
};
