import { browserApiRequest } from "@/lib/browser-api";

export type AppointmentStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "MISSED"
  | "CANCELLED";

export type Appointment = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentListResponse = {
  items: Appointment[];
  page: number;
  limit: number;
  total: number;
};

export async function getAppointments(input: {
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();

  if (input.page) {
    searchParams.set("page", String(input.page));
  }

  if (input.limit) {
    searchParams.set("limit", String(input.limit));
  }

  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  return browserApiRequest<AppointmentListResponse>(`/appointments${suffix}`);
}

export async function createAppointment(input: {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
}) {
  return browserApiRequest<{ id: string }>("/appointments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAppointment(
  id: string,
  input: {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    isAllDay?: boolean;
    scope?: "single";
  },
) {
  return browserApiRequest<Appointment>(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteAppointment(id: string) {
  return browserApiRequest<{ success: boolean; deletedCount: number }>(
    `/appointments/${id}?scope=single`,
    {
      method: "DELETE",
    },
  );
}
