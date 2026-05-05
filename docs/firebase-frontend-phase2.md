# Firebase Frontend Setup (Phase 2)

## Added in this phase
- Firebase Web SDK dependency (`firebase`)
- Client setup helpers:
  - `lib/firebase-config.ts`
  - `lib/firebase-messaging.ts`
- Background service worker:
  - `public/firebase-messaging-sw.js`
- Environment template updates in `.env.example`

## Required environment variables
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

## Runtime notes
- Service worker is registered at `/firebase-messaging-sw.js` with Firebase config passed via query string.
- Foreground/background token handling is available in `lib/firebase-messaging.ts`.
- UI wiring and backend device registration are implemented in Phase 3.

