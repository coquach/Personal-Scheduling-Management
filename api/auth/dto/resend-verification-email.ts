import { z } from "zod";

import { authEmailField } from "@/api/auth/dto/fields";

export const resendVerificationEmailRequestSchema = z.object({
  email: authEmailField,
});

export type ResendVerificationEmailRequestDto = z.infer<
  typeof resendVerificationEmailRequestSchema
>;
