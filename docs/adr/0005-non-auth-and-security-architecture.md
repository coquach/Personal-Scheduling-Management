# 5. Non-Auth and Security Architecture

Date: 2026-05-25
Status: Accepted

## Context
The PSMS application features a private scheduling dashboard for authenticated users. The public-facing (non-auth) pages (Login, Register) serve as the gateway to this system. We need to define their visual architecture to ensure consistency with the internal "Premium Bento" theme, while establishing a robust, highly secure authentication flow that completely eliminates the "Flash of Unauthenticated Content" (FOUC) issue common in SPAs.

## Decision
We have adopted the following architecture for non-authenticated pages and session security:

1. **Visual Consistency (Floating Auth Bento)**:
   - The Login/Register screens will abandon traditional split-screen or marketing-heavy layouts.
   - We will use a subtle, slow-moving **Animated Mesh Gradient** as the full-screen background.
   - The authentication forms will be housed inside a single, centered **Floating Bento Card** utilizing Glassmorphism. This ensures a seamless, premium design DNA transition from the login screen directly into the main app dashboard.

2. **Authentication Flow (Server Actions + HTTP-Only Cookies)**:
   - The authentication forms will submit via **Next.js Server Actions** rather than standard client-side API requests.
   - Upon successful credential validation with the NestJS backend API, the Next.js Server Action will securely inject the resulting JWT token directly into an **HTTP-Only Cookie**.
   - This approach mitigates XSS vulnerabilities associated with LocalStorage token storage and allows for instant, server-driven redirects (`redirect('/calendar')`) without intermediary loading spinners.

3. **Route Protection (Next.js Edge Middleware)**:
   - We will utilize a standard `middleware.ts` executing on the Next.js Edge runtime as our universal security gatekeeper.
   - The middleware will intercept all incoming requests and inspect them for the presence of the HTTP-Only Auth Cookie.
   - If an unauthenticated user attempts to access protected routes (e.g., `/calendar`, `/appointments`), the middleware will halt the request and redirect to `/login` *before* any HTML is streamed to the browser. This definitively prevents any FOUC.

## Consequences
- **Positive:** Maximum security posture by entirely removing access tokens from the browser's JavaScript scope.
- **Positive:** A flawless, high-end user experience entering the application with zero layout shifts or flashing screens.
- **Positive:** Consistent visual identity (Bento + Glassmorphism) solidifies the premium feel of the product from the very first interaction.
- **Negative/Risk:** Relying on Server Actions and Edge Middleware couples the authentication routing heavily to Next.js specific features, increasing architectural lock-in compared to a pure React SPA approach.
