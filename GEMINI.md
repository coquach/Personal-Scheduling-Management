# Personal Scheduling Management (PSMS) - Project Context

## Project Overview
PSMS is a modern personal scheduling management application built with **Next.js 16 (App Router)** and **React 19**. It features a rich dashboard for managing appointments, calendars, reminders, and notifications.

### Core Tech Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript.
- **Styling:** Tailwind CSS v4, Shadcn UI.
- **State Management:** 
  - **Server State:** TanStack Query (`@tanstack/react-query`).
  - **Client State:** Preact Signals (`@preact/signals`) for lightweight reactive state.
- **Forms & Validation:** `react-hook-form` with `zod`.
- **Authentication:** Custom backend authentication with Firebase integration for messaging/notifications.
- **Calendar:** `@schedule-x/react` for the main calendar interface.
- **API Communication:** `axios` with custom wrappers for browser and server environments.
- **Date/Time:** `temporal-polyfill` for modern date handling.

## Directory Structure & Conventions
- `app/`: Next.js App Router routes.
  - `(app)/`: Protected dashboard routes.
  - `(auth)/`: Authentication routes (login, register, etc.).
- `components/`: Reusable UI components.
  - `ui/`: Shadcn UI base components.
  - `layout/`: Shell, sidebar, and header components.
  - `calendar/`, `auth/`, `notification/`: Feature-specific components.
- `services/`: **Server-only** business logic and API wrappers. Uses `backendApi` from `@/lib/api-core`.
- `query/`: TanStack Query hooks for client-side data fetching. Uses `browserApiRequest` from `@/lib/api-client`.
- `model/`: Data models, types, and Zod validation schemas.
- `lib/`: Utility functions, API configurations, constants, and shared logic.
  - `api-client.ts`: Client-side API request handler with auth interceptors.
  - `api-core.ts`: Core Axios instances and error handling.
- `features/`: Feature-scoped server logic, including Next.js Server Actions.
- `tests/`:
  - `unit/`: Jest tests for models, services, and libraries.
  - `integration/`: Jest tests for component interactions.
  - `e2e/`: Playwright end-to-end tests (mocks API in-browser).

## Building and Running
- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Production Start:** `npm run start`
- **Linting:** `npm run lint`

## Testing
- **Unit & Integration:** `npm run test` (Runs Jest)
- **Watch Mode:** `npm run test:watch`
- **End-to-End:** `npm run test:e2e` (Runs Playwright)
- **E2E UI Mode:** `npm run test:e2e:ui`

## Development Guidelines
- **API Requests:**
  - Client-side: Always use hooks from `query/` which utilize `browserApiRequest`.
  - Server-side (Actions/Services): Use `services/` which utilize `backendApi`.
- **Validation:** Define Zod schemas in `model/validation/` and use them for both form validation and API payload validation.
- **Styling:** Adhere to Tailwind CSS v4 patterns. Use Shadcn components as the foundation for new UI.
- **Types:** Ensure strict typing across the codebase. Favor interface/type definitions in `model/` or `features/`.
- **Testing Requirements:** 
  - New features should include E2E tests in `tests/e2e/`.
  - Complex business logic or service methods must have unit tests in `tests/unit/`.
  - Component interactions should be verified with integration tests in `tests/integration/`.
- **Error Handling:** Use `toBackendApiError` to wrap API errors for consistent error messaging across the app.
