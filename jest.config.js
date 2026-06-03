/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('jest').Config} */
const nextJest = require("next/jest.js");

const createJestConfig = nextJest({
  // Load next.config.js and .env files
  dir: "./",
});

const config = {
  coverageProvider: "v8",
  collectCoverage: true,
  collectCoverageFrom: [
    "services/appointments.service.ts",
    "services/auth.service.ts",
    "services/notification.service.ts",
    "services/profile.service.ts",
    "services/tags.service.ts",
    "services/teams.service.ts",
    "services/team-appointments.service.ts",
    "model/validation/**/*.ts",
    "lib/firebase-messaging.ts",
    "query/keys.ts",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["<rootDir>/tests/e2e/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

module.exports = createJestConfig(config);
