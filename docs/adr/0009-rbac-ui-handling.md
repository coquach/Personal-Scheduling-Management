# 0009. Role-Based Access Control (RBAC) UI & Route Protection

## Status
Accepted

## Context
Our application features a `Team` module where users have specific roles (`OWNER`, `ADMIN`, `MEMBER`). These roles dictate both the visibility of UI elements (e.g., the "Delete Team" button) and access to specific sub-routes (e.g., `/teams/[id]/settings`).

Because the system relies on Next.js 16 App Router and the Team roles are stored dynamically in the database (not embedded in the JWT), we need a strategy to enforce RBAC without causing Flash of Unstyled Content (FOUC) and without compromising route security. Traditional SPA approaches like Higher-Order Components (HOCs) or Client-side Auth Guards are inadequate as they introduce FOUC and unnecessary client-side rendering overhead.

## Decision
We will enforce RBAC entirely via **React Server Components (RSC)** using a two-pronged approach:

1. **Component-Level Authorization (Zero FOUC):**
   Following our Hybrid Fetching strategy (ADR-0004), we will fetch the Team details (which includes `myRole`) at the RSC level. For UI elements requiring authorization, we will either conditionally render them directly on the server (for static layouts) or pass the resolved permission (e.g., `canDelete={true}`) as props/`initialData` to Client Components. This ensures the client receives a fully authorized, pre-rendered UI with 0ms of FOUC.

2. **Route-Level Protection (Server-Side Redirect):**
   We will not use Edge Middleware for Team-level RBAC since the JWT lacks team role information. Instead, we will authorize route access inside the target `page.tsx` (RSC). If a user attempts to access a restricted route (e.g., navigating directly to a Settings page while only being a `MEMBER`), the RSC will immediately invoke Next.js's `redirect()` or `notFound()` methods to bounce the user securely on the server side.

## Consequences
- **Positive:** Absolute security against DOM-tampering bypasses. Zero FOUC for users, maintaining the premium Bento UI feel. Faster client hydration.
- **Negative:** Increased initial server-side processing for routes requiring DB calls to check roles. Developers must remember to add RBAC checks to `page.tsx` for every protected route.
