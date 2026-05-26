import { z } from "zod";

import { uuidSchema } from "@/model/appointments";

// --- Response schemas ---

export const tagSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1),
  color: z.string().nullable(),
});

export const tagListResponseSchema = z.array(tagSchema);

// --- Input schemas ---

export const createTagInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  color: z.string().trim().min(1).max(32).optional(),
});

export const updateTagInputSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  color: z.string().trim().min(1).max(32).optional(),
});

export const deleteTagResponseSchema = z.object({
  message: z.string().min(1),
});

// --- Inferred types ---

export type Tag = z.infer<typeof tagSchema>;
export type CreateTagInput = z.infer<typeof createTagInputSchema>;
export type UpdateTagInput = z.infer<typeof updateTagInputSchema>;
export type DeleteTagResponse = z.infer<typeof deleteTagResponseSchema>;
