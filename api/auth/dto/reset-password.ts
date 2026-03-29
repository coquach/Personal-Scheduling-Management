import { z } from "zod";

import { authPasswordField, authTokenField } from "@/api/auth/dto/fields";

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

export type ResetPasswordRequestDto = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordFormDto = z.infer<typeof resetPasswordFormSchema>;
