import { z } from "zod";

import { authEmailField } from "@/api/auth/dto/fields";

export const forgotPasswordRequestSchema = z.object({
  email: authEmailField,
});

export type ForgotPasswordRequestDto = z.infer<
  typeof forgotPasswordRequestSchema
>;
