import { apiClient } from "@/api/client";
import {
  type ForgotPasswordRequestDto,
  type LoginRequestDto,
  type RegisterRequestDto,
  type ResetPasswordRequestDto,
  type ResendVerificationEmailRequestDto,
  type VerifyEmailRequestDto,
} from "@/api/auth/dto";
import {
  clearAuthSession,
  getRefreshToken,
  setAuthSession,
  type AuthSession,
} from "@/api/auth/session";

export type AuthRegisterResponse = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
};

export async function login(input: LoginRequestDto) {
  const session = await apiClient<AuthSession>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    { auth: false },
  );

  setAuthSession(session);
  return session;
}

export async function register(
  input: Omit<RegisterRequestDto, "confirmPassword">,
) {
  return apiClient<AuthRegisterResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    { auth: false },
  );
}

export async function resendVerificationEmail(
  input: ResendVerificationEmailRequestDto["email"],
) {
  return apiClient<null>(
    "/auth/resend-verification-email",
    {
      method: "POST",
      body: JSON.stringify({ email: input }),
    },
    { auth: false },
  );
}

export async function forgotPassword(input: ForgotPasswordRequestDto["email"]) {
  return apiClient<null>(
    "/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify({ email: input }),
    },
    { auth: false },
  );
}

export async function resetPassword(input: ResetPasswordRequestDto) {
  return apiClient<null>(
    "/auth/reset-password",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    { auth: false },
  );
}

export async function verifyEmail(input: VerifyEmailRequestDto["token"]) {
  return apiClient<null>(
    "/auth/verify-email",
    {
      method: "POST",
      body: JSON.stringify({ token: input }),
    },
    { auth: false },
  );
}

export async function logout() {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await apiClient(
        "/auth/logout",
        {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        },
        { auth: false },
      );
    }
  } finally {
    clearAuthSession();
  }
}
