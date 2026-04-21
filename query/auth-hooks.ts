"use client";

import { useMutation } from "@tanstack/react-query";

import { browserApiRequest } from "@/lib/browser-api";
import { AUTH_API_PATHS } from "@/lib/constants/auth";

type RegisterInput = {
  displayName: string;
  email: string;
  password: string;
};

type RegisterResponse = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
};

type ForgotPasswordInput = {
  email: string;
};

type VerifyEmailInput = {
  token: string;
};

type ResendVerificationEmailInput = {
  email: string;
};

type ResetPasswordInput = {
  token: string;
  newPassword: string;
};

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (input: RegisterInput) =>
      browserApiRequest<RegisterResponse>(
        AUTH_API_PATHS.register,
        {
          method: "POST",
          body: JSON.stringify({
            displayName: input.displayName.trim(),
            email: input.email.trim(),
            password: input.password,
          }),
        },
        { auth: false },
      ),
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (input: ForgotPasswordInput) =>
      browserApiRequest<null>(
        AUTH_API_PATHS.forgotPassword,
        {
          method: "POST",
          body: JSON.stringify({
            email: input.email.trim(),
          }),
        },
        { auth: false },
      ),
  });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: async (input: VerifyEmailInput) =>
      browserApiRequest<null>(
        AUTH_API_PATHS.verifyEmail,
        {
          method: "POST",
          body: JSON.stringify({
            token: input.token,
          }),
        },
        { auth: false },
      ),
  });
}

export function useResendVerificationEmailMutation() {
  return useMutation({
    mutationFn: async (input: ResendVerificationEmailInput) =>
      browserApiRequest<null>(
        AUTH_API_PATHS.resendVerificationEmail,
        {
          method: "POST",
          body: JSON.stringify({
            email: input.email.trim(),
          }),
        },
        { auth: false },
      ),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (input: ResetPasswordInput) =>
      browserApiRequest<null>(
        AUTH_API_PATHS.resetPassword,
        {
          method: "POST",
          body: JSON.stringify({
            token: input.token,
            newPassword: input.newPassword,
          }),
        },
        { auth: false },
      ),
  });
}
