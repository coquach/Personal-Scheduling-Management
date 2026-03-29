import { z } from "zod";

const EMAIL_MAX_LENGTH = 255;
const PASSWORD_MAX_LENGTH = 255;
const PASSWORD_MIN_LENGTH = 8;
const DISPLAY_NAME_MAX_LENGTH = 100;

export const authEmailField = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .max(EMAIL_MAX_LENGTH, `Email must be at most ${EMAIL_MAX_LENGTH} characters.`)
  .email("Email is invalid.");

export const authLoginPasswordField = z
  .string()
  .min(1, "Password is required.")
  .max(
    PASSWORD_MAX_LENGTH,
    `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`,
  );

export const authPasswordField = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`,
  );

export const authDisplayNameField = z
  .string()
  .trim()
  .min(1, "Full name is required.")
  .max(
    DISPLAY_NAME_MAX_LENGTH,
    `Full name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters.`,
  );

export const authTokenField = z
  .string()
  .min(1, "Token is required.");

export const authRefreshTokenField = z
  .string()
  .min(1, "Refresh token is required.");
