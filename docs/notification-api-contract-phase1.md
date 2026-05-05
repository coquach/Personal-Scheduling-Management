# Notification API Contract (Phase 1)

## Base
- Base URL: `${NEXT_PUBLIC_PSMS_API_URL}`
- Auth: `Authorization: Bearer <access_token>`
- Content-Type: `application/json`

## Endpoints

1. `GET /users/me/notifications`
- Response data shape:
  - `NotificationItem[]`

2. `PATCH /users/me/notifications/:notificationId`
- Path param:
  - `notificationId: uuid`
- Response:
  - `200` with updated `NotificationItem`

3. `PATCH /users/me/notifications/all`
- Response data shape:
  - `count: number`

4. `POST /users/devices`
- Request body:
  - `fcmToken: string`
  - `deviceName?: string`
  - `platform?: string`
- Response:
  - `200/201` with `UserDevice`

5. `GET /users/devices`
- Response:
  - `200` with `UserDevice[]`

6. `DELETE /users/devices`
- Request body:
  - `fcmToken: string`
- Response:
  - `200` with deleted `UserDevice`

## NotificationItem
- `id: uuid`
- `userId: uuid`
- `appointmentId: uuid | null`
- `reminderId: uuid | null`
- `type: "REMINDER" | "SYSTEM"`
- `message: string`
- `triggeredAt: ISO datetime string | null`
- `createdAt: ISO datetime string`
- `readAt: ISO datetime string | null`

## UserDevice
- `id: uuid`
- `fcmToken: string`
- `deviceName: string | null`
- `platform: string | null`
- `lastActiveAt: ISO datetime string`

## Note About Envelope
- Backend `se113` wraps every success response using:
  - `success: true`
  - `message: string`
  - `data: <payload>`
- Frontend service already consumes `data` payload via `browserApiRequest`.

## Frontend source of truth
- Paths: `lib/constants/notification.ts`
- Models: `model/notification.model.ts`
- Validation: `model/validation/notification.ts`
- Service contract calls: `services/notification.service.ts`
