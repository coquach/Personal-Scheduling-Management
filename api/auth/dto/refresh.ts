import { z } from "zod";

import { authRefreshTokenField } from "@/api/auth/dto/fields";

export const refreshRequestSchema = z.object({
  refreshToken: authRefreshTokenField,
});

export type RefreshRequestDto = z.infer<typeof refreshRequestSchema>;
