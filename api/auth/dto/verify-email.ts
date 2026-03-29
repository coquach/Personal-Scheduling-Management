import { z } from "zod";

import { authTokenField } from "@/api/auth/dto/fields";

export const verifyEmailRequestSchema = z.object({
  token: authTokenField,
});

export type VerifyEmailRequestDto = z.infer<typeof verifyEmailRequestSchema>;
