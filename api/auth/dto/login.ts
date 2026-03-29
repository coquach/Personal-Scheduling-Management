import { z } from "zod";

import { authEmailField, authLoginPasswordField } from "@/api/auth/dto/fields";

export const loginRequestSchema = z.object({
  email: authEmailField,
  password: authLoginPasswordField,
});

export type LoginRequestDto = z.infer<typeof loginRequestSchema>;
