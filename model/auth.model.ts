export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
  roles: string[];
};

export type ProfileResponse = {
  id: string;
  email: string;
  displayName: string | null;
  roles?: string[];
};

export type AuthTokenBundle = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};

export type LoginResponse = AuthTokenBundle & {
  refreshToken: string;
  refreshTokenExpiresIn?: number;
  user: AuthUser;
};

export type RefreshResponse = AuthTokenBundle & {
  refreshToken?: string;
  refreshTokenExpiresIn?: number;
  user: AuthUser;
};

export type LogoutPayload = {
  refreshToken: string;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};
