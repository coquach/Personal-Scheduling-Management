import { z } from "zod";

import { uuidSchema } from "@/model/appointments";

const isoDateTimeSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid datetime value.",
  });

// --- Response schema ---

export const userProfileSchema = z.object({
  id: uuidSchema,
  email: z.string().email(),
  displayName: z.string().nullable(),
  timezone: z.string().min(1),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema.optional(),
});

// --- Input schema ---

export const updateProfileInputSchema = z.object({
  displayName: z.string().trim().min(1).max(255).optional(),
  timezone: z.string().trim().min(1).max(64).optional(),
});

// --- Inferred types ---

export type UserProfile = z.infer<typeof userProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;
