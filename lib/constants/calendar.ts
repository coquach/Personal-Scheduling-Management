export const CALENDAR_QUERY_DEFAULTS = {
  page: 1,
  limit: 10,
} as const;

export const CALENDAR_STATUS_IDS = {
  scheduled: "scheduled",
  completed: "completed",
  missed: "missed",
  cancelled: "cancelled",
} as const;
