export const calendarDays = [
  { day: 10, weekday: "Mon", summary: "2 events", selected: false, dots: ["#1a73e8"] },
  { day: 11, weekday: "Tue", summary: "Focus time", selected: false, dots: ["#34a853"] },
  { day: 12, weekday: "Wed", summary: "Open slots", selected: false, dots: [] },
  { day: 13, weekday: "Thu", summary: "3 events", selected: false, dots: ["#1a73e8", "#fbbc04"] },
  { day: 14, weekday: "Fri", summary: "2 events", selected: true, dots: ["#ea4335", "#34a853"] },
  { day: 15, weekday: "Sat", summary: "Weekend", selected: false, dots: ["#12b5cb"] },
  { day: 16, weekday: "Sun", summary: "No events", selected: false, dots: [] },
  { day: 17, weekday: "Mon", summary: "Planning", selected: false, dots: ["#1a73e8"] },
  { day: 18, weekday: "Tue", summary: "Client calls", selected: false, dots: ["#12b5cb", "#34a853"] },
  { day: 19, weekday: "Wed", summary: "Review", selected: false, dots: ["#1a73e8"] },
  { day: 20, weekday: "Thu", summary: "Travel", selected: false, dots: ["#ea4335"] },
  { day: 21, weekday: "Fri", summary: "Workshop", selected: false, dots: ["#fbbc04"] },
  { day: 22, weekday: "Sat", summary: "Gym", selected: false, dots: ["#34a853"] },
  { day: 23, weekday: "Sun", summary: "Rest day", selected: false, dots: [] },
];

export const calendarAgenda = [
  {
    id: "agenda-1",
    title: "Team Standup",
    time: "09:00 - 09:30",
    description: "Weekly product and engineering sync.",
    tag: "Work",
    color: "#1a73e8",
  },
  {
    id: "agenda-2",
    title: "Doctor Appointment",
    time: "11:30 - 12:15",
    description: "Routine check-up downtown.",
    tag: "Health",
    color: "#ea4335",
  },
  {
    id: "agenda-3",
    title: "Study Session",
    time: "19:00 - 20:30",
    description: "Deep work block for system design notes.",
    tag: "Study",
    color: "#34a853",
  },
];

export const appointmentRows = [
  {
    id: "appt-1",
    date: "Mar 14",
    title: "Team Standup",
    status: "Scheduled",
    tag: "Work",
    time: "09:00",
  },
  {
    id: "appt-2",
    date: "Mar 14",
    title: "Doctor Appointment",
    status: "Scheduled",
    tag: "Health",
    time: "11:30",
  },
  {
    id: "appt-3",
    date: "Mar 15",
    title: "Study Session",
    status: "Completed",
    tag: "Study",
    time: "19:00",
  },
];

export const tagRows = [
  { id: "tag-1", name: "Work", color: "#1a73e8", appointments: 8 },
  { id: "tag-2", name: "Health", color: "#ea4335", appointments: 3 },
  { id: "tag-3", name: "Study", color: "#34a853", appointments: 5 },
  { id: "tag-4", name: "Personal", color: "#fbbc04", appointments: 4 },
];

export const reminderRows = [
  { id: "reminder-1", label: "Project kickoff", offset: "10 minutes before", channel: "Push" },
  { id: "reminder-2", label: "Therapy session", offset: "1 hour before", channel: "Email" },
];

export const notificationRows = [
  {
    id: "notif-1",
    title: "Team Standup starts in 10 minutes",
    channel: "In-app reminder",
    status: "Due",
    time: "08:50",
  },
  {
    id: "notif-2",
    title: "Weekly review moved to tomorrow",
    channel: "System update",
    status: "Unread",
    time: "07:20",
  },
];

export const statisticsSummary = {
  total: "24",
  completed: "18",
  completionRate: "75%",
  periodLabel: "Mar 08 - Mar 14, 2026",
};

export const statisticsTagDistribution = [
  { tag: "Work", count: 10, percent: 42, color: "#1a73e8" },
  { tag: "Personal", count: 7, percent: 29, color: "#12b5cb" },
  { tag: "Study", count: 4, percent: 17, color: "#34a853" },
  { tag: "Health", count: 3, percent: 12, color: "#fbbc04" },
];

export const statisticsTimeSlots = [
  { label: "09:00", value: "5 completed / 6" },
  { label: "14:00", value: "4 completed / 5" },
  { label: "11:00", value: "3 completed / 4" },
  { label: "16:00", value: "2 completed / 3" },
];

export const exportPreviewRows = [
  { id: "export-1", title: "Team Standup", tag: "Work", status: "Completed", date: "2026-03-12" },
  { id: "export-2", title: "Study Session", tag: "Study", status: "Scheduled", date: "2026-03-14" },
];

export const profileData = {
  fullName: "John Doe",
  email: "john.doe@example.com",
  timezone: "UTC+08:00 - Singapore Time",
  role: "Planner",
};
