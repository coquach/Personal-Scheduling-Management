import { z } from "zod";

import {
  authDisplayNameField,
  authEmailField,
  authPasswordField,
} from "@/api/auth/dto/fields";

export const registerRequestSchema = z
  .object({
    displayName: authDisplayNameField,
    email: authEmailField,
    password: authPasswordField,
    confirmPassword: z.string().min(1, "Password confirmation is required."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Password confirmation does not match.",
    path: ["confirmPassword"],
  });

export type RegisterRequestDto = z.infer<typeof registerRequestSchema>;
