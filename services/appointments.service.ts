import { browserApiRequest } from "@/lib/browser-api";
import {
  appointmentListResponseSchema,
  createAppointmentInputSchema,
  createSeriesRequestSchema,
  deleteAppointmentResponseSchema,
  deleteAppointmentScopeSchema,
  getAppointmentsInputSchema,
  idResponseSchema,
  uuidSchema,
  updateAppointmentInputSchema,
  updateAppointmentStatusInputSchema,
  updateAppointmentStatusResponseSchema,
  updateSeriesRequestSchema,
  type AppointmentBackendDto,
  type AppointmentStatus as AppointmentStatusType,
  type AppointmentTag,
  type CreateSeriesRequest,
  type DeleteAppointmentScope,
  type RecurrenceType,
  type UpdateSeriesRequest,
} from "@/lib/validation/appointments";

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

function mapAppointmentFromBackend(dto: AppointmentBackendDto): Appointment {
  return {
    id: dto.id,
    userId: dto.userId,
    seriesId: dto.seriesId,
    title: dto.title,
    description: dto.description,
    startTime: dto.startAt,
    endTime: dto.endAt,
    isRecurringInstance: dto.isRecurringInstance,
    status: dto.status,
    jobId: dto.jobId,
    tags: dto.tags ?? [],
  };
}

function getBrowserTimezone() {
  if (typeof Intl === "undefined") {
    return "UTC";
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export async function getAppointments(input: {
  page?: number;
  limit?: number;
}) {
  const parsedInput = getAppointmentsInputSchema.parse(input);
  const searchParams = new URLSearchParams();

  if (parsedInput.page) {
    searchParams.set("page", String(parsedInput.page));
  }

  if (parsedInput.limit) {
    searchParams.set("limit", String(parsedInput.limit));
  }

  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  const rawResponse = await browserApiRequest<unknown>(
    `/appointments${suffix}`,
  );
  const response = appointmentListResponseSchema.parse(rawResponse);

  return {
    items: (response.items ?? []).map(mapAppointmentFromBackend),
    page: response.page,
    limit: response.limit,
    total: response.total,
  } satisfies AppointmentListResponse;
}

export async function createAppointment(input: {
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
}) {
  const parsedInput = createAppointmentInputSchema.parse(input);

  const payload: CreateSeriesRequest = {
    title: parsedInput.title,
    description: parsedInput.description,
    startAt: parsedInput.startTime,
    endAt: parsedInput.endTime,
    recurrenceType: parsedInput.recurrenceType ?? "ONETIME",
    weeklyDay: parsedInput.weeklyDay ?? [],
    monthlyDay: parsedInput.monthlyDay ?? null,
    yearlyDay: parsedInput.yearlyDay ?? null,
    yearlyMonth: parsedInput.yearlyMonth ?? null,
    seriesTimezone: parsedInput.seriesTimezone ?? getBrowserTimezone(),
    tagIds: parsedInput.tagIds ?? [],
  };
  const parsedPayload = createSeriesRequestSchema.parse(payload);

  const rawResponse = await browserApiRequest<unknown>("/series", {
    method: "POST",
    body: JSON.stringify(parsedPayload),
  });

  return idResponseSchema.parse(rawResponse);
}

export async function updateAppointment(
  seriesId: string,
  input: {
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
  },
) {
  const parsedSeriesId = uuidSchema.parse(seriesId);
  const parsedInput = updateAppointmentInputSchema.parse(input);

  const payload: UpdateSeriesRequest = {
    ...(parsedInput.title !== undefined ? { title: parsedInput.title } : {}),
    ...(parsedInput.description !== undefined ? { description: parsedInput.description } : {}),
    ...(parsedInput.startTime !== undefined ? { startAt: parsedInput.startTime } : {}),
    ...(parsedInput.endTime !== undefined ? { endAt: parsedInput.endTime } : {}),
    ...(parsedInput.recurrenceType !== undefined
      ? { recurrenceType: parsedInput.recurrenceType }
      : {}),
    ...(parsedInput.weeklyDay !== undefined ? { weeklyDay: parsedInput.weeklyDay } : {}),
    ...(parsedInput.monthlyDay !== undefined ? { monthlyDay: parsedInput.monthlyDay } : {}),
    ...(parsedInput.yearlyDay !== undefined ? { yearlyDay: parsedInput.yearlyDay } : {}),
    ...(parsedInput.yearlyMonth !== undefined ? { yearlyMonth: parsedInput.yearlyMonth } : {}),
    ...(parsedInput.seriesTimezone !== undefined
      ? { seriesTimezone: parsedInput.seriesTimezone }
      : {}),
    ...(parsedInput.tagIds !== undefined ? { tagIds: parsedInput.tagIds } : {}),
  };
  const parsedPayload = updateSeriesRequestSchema.parse(payload);

  const rawResponse = await browserApiRequest<unknown>(`/series/${parsedSeriesId}`, {
    method: "PATCH",
    body: JSON.stringify(parsedPayload),
  });

  return idResponseSchema.parse(rawResponse);
}

export async function deleteAppointment(
  seriesId: string,
  scope: DeleteAppointmentScope = "series",
) {
  const parsedSeriesId = uuidSchema.parse(seriesId);
  const parsedScope = deleteAppointmentScopeSchema.parse(scope);
  const rawResponse = await browserApiRequest<unknown>(
    `/series/${parsedSeriesId}?scope=${parsedScope}`,
    {
      method: "DELETE",
    },
  );

  return deleteAppointmentResponseSchema.parse(rawResponse);
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
) {
  const parsedAppointmentId = uuidSchema.parse(appointmentId);
  const parsedPayload = updateAppointmentStatusInputSchema.parse({ status });
  const rawResponse = await browserApiRequest<unknown>(
    `/appointments/${parsedAppointmentId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(parsedPayload),
    },
  );

  return updateAppointmentStatusResponseSchema.parse(rawResponse);
}
