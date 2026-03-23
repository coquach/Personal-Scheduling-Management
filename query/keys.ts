export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
  },
  profile: {
    detail: ["profile", "detail"] as const,
  },
  appointments: {
    all: ["appointments"] as const,
    list: (filters: Record<string, string | undefined>) =>
      ["appointments", "list", filters] as const,
  },
  tags: {
    all: ["tags"] as const,
  },
  reminders: {
    all: ["reminders"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
  statistics: {
    summary: (period: string) => ["statistics", period] as const,
  },
  export: {
    preview: (filters: Record<string, string | undefined>) =>
      ["export", "preview", filters] as const,
  },
};
