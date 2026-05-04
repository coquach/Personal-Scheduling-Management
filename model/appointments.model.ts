import type {
  AppointmentStatus as AppointmentStatusType,
  AppointmentTag,
  DeleteAppointmentScope,
  RecurrenceType,
} from "@/model/validation/appointments";

export type AppointmentStatus = AppointmentStatusType;

export type Appointment = {
  id: string;
  userId: string;
  seriesId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  isRecurringInstance: boolean;
  status: AppointmentStatus;
  jobId: string | null;
  tags: AppointmentTag[];
};

export type AppointmentListResponse = {
  items: Appointment[];
  page: number;
  limit: number;
  total: number;
};

export type GetAppointmentsInput = {
  page?: number;
  limit?: number;
};

export type CreateAppointmentInput = {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  recurrenceType?: RecurrenceType;
  weeklyDay?: string[];
  monthlyDay?: number | null;
  yearlyDay?: number | null;
  yearlyMonth?: number | null;
  seriesTimezone?: string;
  tagIds?: string[];
};

export type UpdateAppointmentInput = {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  recurrenceType?: RecurrenceType;
  weeklyDay?: string[];
  monthlyDay?: number | null;
  yearlyDay?: number | null;
  yearlyMonth?: number | null;
  seriesTimezone?: string;
  tagIds?: string[];
};

export type DeleteAppointmentScopeInput = DeleteAppointmentScope;
