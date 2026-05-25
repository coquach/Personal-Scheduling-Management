# 8. Quality Assurance and Testing Strategy

Date: 2026-05-25
Status: Accepted

## Context
As the PSMS frontend grows, ensuring stability without grinding development velocity to a halt is critical. A traditional "Testing Pyramid" (heavy on unit tests for every single UI component) often results in brittle tests that break upon minor visual changes. Furthermore, testing components that fetch data from the backend introduces severe flakiness if the real backend is unavailable or its state changes. We need a pragmatic testing strategy that maximizes confidence while minimizing maintenance overhead.

## Decision
We have adopted the following Quality Assurance and Testing Strategy:

1. **The Testing Trophy Methodology**:
   - We abandon the classic Testing Pyramid in favor of the "Testing Trophy" pattern.
   - **Unit Tests (20%)**: Reserved strictly for complex, framework-agnostic business logic (e.g., timezone math, date formatting utilities, recurring event algorithms). We will *not* write isolated unit tests for simple UI components.
   - **Integration Tests (60%)**: This forms the core of our testing suite. We will test the composition of components. For example, rendering the entire Event Creation Form, simulating real user input, and asserting that Zod validation errors appear correctly and that the TanStack Query mutation is successfully fired.
   - **E2E Tests (20%)**: Using Playwright, we will automate only the most critical "Happy Paths" (e.g., Login -> Create Event -> Verify Event on Calendar) to ensure the entire system operates correctly in a real browser environment.

2. **API Mocking with MSW (Mock Service Worker)**:
   - To decouple our Integration and E2E tests from the real backend (SE113), we will utilize **MSW**.
   - MSW intercepts outgoing network requests at the browser/Node network level and returns predefined mock JSON responses.
   - Unlike standard Jest mocks (e.g., `jest.mock('axios')`), MSW allows our React components and TanStack Query hooks to operate exactly as they would in production, completely unaware they are communicating with a mock server. This ensures our tests are robust against internal refactoring and the mock handlers can be reused across both Jest and Playwright.

## Consequences
- **Positive:** High confidence in system stability; tests verify actual user behavior rather than testing implementation details.
- **Positive:** Drastically reduced test maintenance overhead, as tests will not break when internal function names or component structures are refactored.
- **Positive:** MSW handlers can be shared and reused across local development, Jest integration tests, and Playwright E2E tests.
- **Negative/Risk:** Setting up MSW and Playwright requires a steeper initial configuration investment compared to a basic Jest setup.
