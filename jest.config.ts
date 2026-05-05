import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  collectCoverage: true,
  collectCoverageFrom: [
    'services/appointments.service.ts',
    'services/auth.service.ts',
    'services/notification.service.ts',
    'services/profile.service.ts',
    'services/tags.service.ts',
    'model/validation/**/*.ts',
    'lib/firebase-messaging.ts',
    'query/keys.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      statements: 65,
      branches: 55,
      functions: 45,
      lines: 65,
    },
  },
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
