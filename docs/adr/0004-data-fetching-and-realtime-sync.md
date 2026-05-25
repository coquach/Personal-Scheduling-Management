# 4. Data Fetching Boundary & Real-time Sync

Date: 2026-05-25
Status: Accepted

## Context
The PSMS frontend requires a strategy for loading data on the initial page visit and keeping that data synchronized across multiple devices or team members. 
1. The initial load must feel premium and instantaneous, avoiding the traditional "blank screen with a spinner" SPA experience.
2. The calendar must reflect real-time updates (like incoming reminders or new team appointments) without jarring the user or causing layout shifts.

## Decision
We decided to adopt a **Hybrid Fetching Boundary** and a **Silent Invalidation** real-time strategy.

1. **Hybrid Fetching (RSC + Client Query)**:
   - **React Server Components (RSC)**: We will use RSC to pre-fetch and render core, static, or slow-changing layout data (e.g., User Profile, Tag configuration, App Settings) directly on the Next.js server. This guarantees that the app's visual shell (Bento Sidebar, Floating Dock, Header) paints instantly with real data on the first request.
   - **Client-Side TanStack Query**: We will deliberately defer the fetching of Calendar/Agenda events to the client side. Scheduling data is heavy, highly dynamic, and fundamentally dependent on the user's local browser timezone. During the brief fetch window, a premium Skeleton UI will be displayed within the Calendar Bento box.

2. **Real-time Syncing & Notification Handling**:
   - The application receives push notifications from the backend via **Firebase Cloud Messaging (FCM)**.
   - **Reminders**: When an FCM payload identifies as an event reminder, the `NotificationBootstrap` component will emit a non-intrusive Toast Notification (e.g., via Sonner) containing quick actions (Join, Snooze).
   - **Data Syncs**: When an FCM payload indicates that a calendar event was added, modified, or deleted (e.g., by another team member), no visible notification will interrupt the user. Instead, the system will perform a **Silent Invalidation** by calling `queryClient.invalidateQueries(['appointments'])`. TanStack Query will seamlessly fetch the delta and update the UI in the background.

3. **Offline Support (Transparent Optimistic UI)**:
   - **Offline Reading**: TanStack Query's Persister will cache the calendar state to `IndexedDB`. If the user opens the app without an internet connection, they will instantly see their cached calendar instead of a blank page or error.
   - **Offline Writing**: When a user creates/edits an event while offline, we will use **Optimistic Updates** to immediately render the event on the calendar grid, maintaining a fluid UX. However, to maintain trust, we will NOT pretend it fully succeeded. The system will trigger a Toast warning (e.g., "Saved locally. Will sync when online.") and push the mutation into an offline queue. Once connectivity is restored, the queue will drain to the backend.

## Consequences
- **Positive:** Initial load times are vastly improved. The user instantly sees the UI shell, creating a perception of extreme speed.
- **Positive:** We avoid complex Server-to-Client timezone Hydration errors since all date math happens on the client.
- **Positive:** Real-time collaboration feels "magical" as the calendar updates itself without disruptive page reloads or intrusive prompts.
- **Positive:** Exceptional resilience for mobile or traveling users; the app remains fully functional (read/write) during network drops.
- **Negative/Risk:** Offline mutation queues are complex to manage. We must handle edge cases where a user creates an event offline, but the backend later rejects it (e.g., due to a strict time conflict rule) upon reconnection.
