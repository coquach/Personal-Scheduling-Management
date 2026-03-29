import { z } from "zod";

import { authRefreshTokenField } from "@/api/auth/dto/fields";

export const logoutRequestSchema = z.object({
  refreshToken: authRefreshTokenField.optional(),
});

export type LogoutRequestDto = z.infer<typeof logoutRequestSchema>;
