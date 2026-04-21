import { z } from "zod";

const EMAIL_MAX_LENGTH = 255;
const PASSWORD_MAX_LENGTH = 255;
const PASSWORD_MIN_LENGTH = 8;

const authEmailField = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .max(EMAIL_MAX_LENGTH, `Email must be at most ${EMAIL_MAX_LENGTH} characters.`)
  .email("Email is invalid.");

const authLoginPasswordField = z
  .string()
  .min(1, "Password is required.")
  .max(
    PASSWORD_MAX_LENGTH,
    `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`,
  );

const authPasswordField = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`,
  );

const authTokenField = z.string().min(1, "Token is required.");

export const loginPayloadSchema = z.object({
  email: authEmailField,
  password: authLoginPasswordField,
});

export const registerPayloadSchema = z.object({
  email: authEmailField,
  password: authPasswordField,
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required.")
    .max(100, "Display name must be at most 100 characters."),
});

export const registerFormSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Display name is required.")
      .max(100, "Display name must be at most 100 characters."),
    email: authEmailField,
    password: authPasswordField,
    confirmPassword: z.string().min(1, "Password confirmation is required."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Password confirmation does not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordRequestSchema = z.object({
  email: authEmailField,
});

export const resendVerificationEmailRequestSchema = z.object({
  email: authEmailField,
});

export const verifyEmailRequestSchema = z.object({
  token: authTokenField,
});

export const resetPasswordRequestSchema = z.object({
  token: authTokenField,
  newPassword: authPasswordField,
});

export const resetPasswordFormSchema = z
  .object({
    password: authPasswordField,
    confirmPassword: z.string().min(1, "Password confirmation is required."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Password confirmation does not match.",
    path: ["confirmPassword"],
  });

export type LoginPayload = z.infer<typeof loginPayloadSchema>;
export type RegisterPayload = z.infer<typeof registerPayloadSchema>;
export type RegisterFormDto = z.infer<typeof registerFormSchema>;
export type ForgotPasswordRequestDto = z.infer<typeof forgotPasswordRequestSchema>;
export type ResendVerificationEmailRequestDto = z.infer<
  typeof resendVerificationEmailRequestSchema
>;
export type VerifyEmailRequestDto = z.infer<typeof verifyEmailRequestSchema>;
export type ResetPasswordRequestDto = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordFormDto = z.infer<typeof resetPasswordFormSchema>;
