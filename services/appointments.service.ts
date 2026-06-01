import { browserApiRequest } from "@/lib/api-client";
import {
  appointmentListResponseSchema,
  createAppointmentInputSchema,
  createSeriesRequestSchema,
  deleteAppointmentResponseSchema,
  getAppointmentsInputSchema,
  idResponseSchema,
  updateAppointmentInputSchema,
  updateAppointmentStatusInputSchema,
  updateAppointmentStatusResponseSchema,
  updateSeriesRequestSchema,
  getAppointmentSeriesInputSchema,
  appointmentSeriesListResponseSchema,
  uuidSchema,
  type AppointmentStatus,
  type CreateAppointmentInput,
  type CreateSeriesRequest,
  type GetAppointmentsInput,
  type GetAppointmentSeriesInput,
  type UpdateAppointmentInput,
  type UpdateSeriesRequest
} from "@/model/appointments";

export type {
  Appointment,
  AppointmentListResponse,
  AppointmentSeries,
  AppointmentSeriesListResponse,
  AppointmentStatus,
  CreateAppointmentInput,
  GetAppointmentsInput,
  GetAppointmentSeriesInput,
  UpdateAppointmentInput
} from "@/model/appointments";



function getBrowserTimezone() {
  if (typeof Intl === "undefined") {
    return "UTC";
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export async function getAppointments(input: GetAppointmentsInput) {
  const parsedInput = getAppointmentsInputSchema.parse(input);
  
  const rawResponse = await browserApiRequest<unknown>("/appointments", undefined, {
    params: {
      page: parsedInput.page,
      limit: parsedInput.limit,
      ...(parsedInput.fromDate && { fromDate: parsedInput.fromDate }),
      ...(parsedInput.toDate && { toDate: parsedInput.toDate }),
      ...(parsedInput.seriesId && { seriesId: parsedInput.seriesId }),
    },
  });
  const response = appointmentListResponseSchema.parse(rawResponse);

  return response;
}

export async function getAppointmentSeries(input: GetAppointmentSeriesInput) {
  const parsedInput = getAppointmentSeriesInputSchema.parse(input);
  
  const rawResponse = await browserApiRequest<unknown>("/series", undefined, {
    params: {
      page: parsedInput.page,
      limit: parsedInput.limit,
      ...(parsedInput.recurrenceType && { recurrenceType: parsedInput.recurrenceType }),
    },
  });
  const response = appointmentSeriesListResponseSchema.parse(rawResponse);

  return response;
}

export async function createAppointment(input: CreateAppointmentInput) {
  const parsedInput = createAppointmentInputSchema.parse(input);

  const payload: CreateSeriesRequest = {
    title: parsedInput.title,
    description: parsedInput.description,
    startAt: parsedInput.startAt,
    endAt: parsedInput.endAt,
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
  input: UpdateAppointmentInput,
) {
  const parsedSeriesId = uuidSchema.parse(seriesId);
  const parsedInput = updateAppointmentInputSchema.parse(input);

  const payload: UpdateSeriesRequest = {
    ...(parsedInput.title !== undefined ? { title: parsedInput.title } : {}),
    ...(parsedInput.description !== undefined ? { description: parsedInput.description } : {}),
    ...(parsedInput.startAt !== undefined ? { startAt: parsedInput.startAt } : {}),
    ...(parsedInput.endAt !== undefined ? { endAt: parsedInput.endAt } : {}),
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

export async function deleteAppointment(seriesId: string) {
  const parsedSeriesId = uuidSchema.parse(seriesId);
  const rawResponse = await browserApiRequest<unknown>(
    `/series/${parsedSeriesId}`,
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


