# Notification Phase 3 Wiring

## Implemented
- Added `NotificationBootstrap` in authenticated shell:
  - `components/notification/NotificationBootstrap.tsx`
  - Mounted in `components/layout/app-shell.tsx`

## Behavior
- When `accessToken` appears in `auth-store`, app:
  1. Requests notification permission.
  2. Retrieves FCM token.
  3. Calls `POST /users/devices` via `registerNotificationDevice`.
  4. Stores registered token in `localStorage` (`psms:registered-fcm-token`) to avoid duplicate registration.
- Foreground push invalidates React Query key: `queryKeys.notifications.all`.

## Logout behavior
- `components/auth/LogoutButton.tsx` now:
  1. Reads cached FCM token.
  2. Calls `DELETE /users/devices` with `{ fcmToken }`.
  3. Clears cached token.
  4. Continues normal logout flow.

