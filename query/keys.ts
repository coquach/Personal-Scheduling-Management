export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
  },
  profile: {
    detail: ["profile", "detail"] as const,
  },
  appointments: {
    all: ["appointments"] as const,
    calendar: (filters: Record<string, string | undefined>) =>
      ["appointments", "calendar", filters] as const,
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
  teams: {
    all: ["teams"] as const,
    list: (filters: Record<string, unknown>) => ["teams", "list", filters] as const,
    detail: (teamId: string) => ["teams", "detail", teamId] as const,
    members: (teamId: string, query?: Record<string, unknown>) => ["teams", "members", teamId, query] as const,
    invitations: (filters: Record<string, unknown>) => ["teams", "invitations", filters] as const,
  },
  teamAppointments: {
    all: (teamId: string) => ["teams", teamId, "appointments"] as const,
    list: (teamId: string, filters: Record<string, unknown>) => ["teams", teamId, "appointments", filters] as const,
  },
};
