# 3. Frontend-Backend Integration Architecture

Date: 2026-05-25
Status: Accepted

## Context
The PSMS application is composed of a decoupled Next.js 16 frontend and a NestJS backend (SE113 repo). Establishing a strict, efficient, and maintainable data flow boundary between the client application and the backend API gateway is critical to ensure high performance and a clean developer experience.

## Decision
We have adopted the following integration architecture to handle data fetching, token management, and code organization:

1. **Data Flow Boundary (Strict Client-to-Backend)**:
   - For standard CRUD operations, Next.js Client Components will communicate directly with the NestJS backend API using TanStack Query.
   - We deliberately bypass Next.js Server Actions and Route Handlers (`app/api/`) for these operations to minimize intermediate network latency and reduce load on the Next.js server. 
   - Server Actions are strictly reserved for sensitive operations (like Authentication Cookie management) or Initial Server-Side Render (SSR) data fetching.

2. **Authentication & Token Management**:
   - We implement a **Centralized Axios Interceptor with Silent Refresh** inside the core API client (`lib/api-client.ts`).
   - The Request Interceptor automatically injects the current JWT into outgoing requests.
   - The Response Interceptor catches `401 Unauthorized` errors, pauses incoming requests, performs a silent token refresh, and automatically retries the failed requests. If the refresh fails, the session is purged and the user is redirected to the login page globally.

3. **Code Organization (Domain-Driven Structure)**:
   - To maintain scalability, API integration code is strictly split by domain into two distinct layers:
     - **Fetcher Layer (`services/`)**: Contains pure Axios utility functions (e.g., `createAppointment()`, `getAppointments()`) that handle the actual HTTP calls and basic type enforcement. These functions are agnostic of React.
     - **Hook Layer (`query/`)**: Contains React-specific custom hooks (e.g., `useAppointments()`, `useCreateAppointment()`) powered by TanStack Query. This layer is responsible for Cache Management (Query Keys), Cache Invalidation logic, and integrating UI feedback (Toast notifications).

## Consequences
- **Positive:** Maximum client-side performance for data mutations by eliminating the Next.js middleman layer for standard API interactions.
- **Positive:** A highly resilient user experience where token expirations are handled seamlessly without disrupting complex workflows (like filling out an appointment form).
- **Positive:** Clear separation of concerns allows API fetch functions to be tested independently or reused outside of the React component tree.
- **Negative/Risk:** The client bundle will contain the actual NestJS API endpoint URLs. While standard for SPAs, developers must remember that authorization and business rule enforcement must happen strictly on the NestJS backend, not just obscured via the frontend.
