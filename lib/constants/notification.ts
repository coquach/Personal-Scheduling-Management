export const NOTIFICATION_API_PATHS = {
  list: "/users/me/notifications",
  markRead: (notificationId: string) => `/users/me/notifications/${notificationId}`,
  markAllRead: "/users/me/notifications/all",
  registerDevice: "/users/devices",
  listDevices: "/users/devices",
  unregisterDevice: "/users/devices",
} as const;
