import { browserApiRequest } from "@/lib/api-client";
import type { AxiosResponse } from "axios";
import {
  getStatisticsInputSchema,
  statisticsSummaryResponseSchema,
  exportAppointmentsInputSchema,
  type GetStatisticsInput,
  type StatisticsSummaryResponse,
  type ExportAppointmentsInput,
} from "@/model/validation/statistics";

export async function getStatistics(
  input: GetStatisticsInput,
): Promise<StatisticsSummaryResponse> {
  const parsedInput = getStatisticsInputSchema.parse(input);
  const searchParams = new URLSearchParams();

  searchParams.set("startDate", parsedInput.startDate);
  searchParams.set("endDate", parsedInput.endDate);
  
  if (parsedInput.groupBy) searchParams.set("groupBy", parsedInput.groupBy);
  if (parsedInput.timezone) searchParams.set("timezone", parsedInput.timezone);

  const rawResponse = await browserApiRequest<unknown>(
    `/statistics/me?${searchParams.toString()}`
  );

  return statisticsSummaryResponseSchema.parse(rawResponse);
}

function buildExportAppointmentsQuery(
  input: ExportAppointmentsInput,
): string {
  const parsedInput = exportAppointmentsInputSchema.parse(input);
  const searchParams = new URLSearchParams();

  if (parsedInput.startDate) searchParams.set("startDate", parsedInput.startDate);
  if (parsedInput.endDate) searchParams.set("endDate", parsedInput.endDate);
  if (parsedInput.tagId) searchParams.set("tagId", parsedInput.tagId);
  if (parsedInput.status) searchParams.set("status", parsedInput.status);
  if (parsedInput.query) searchParams.set("query", parsedInput.query);

  return searchParams.size > 0 ? `?${searchParams.toString()}` : "";
}

export async function exportAppointments(input: ExportAppointmentsInput): Promise<void> {
  const query = buildExportAppointmentsQuery(input);
  
  const response = await browserApiRequest<AxiosResponse<Blob>>(
    `/statistics/export${query}`,
    undefined,
    { responseType: "blob", returnFullResponse: true }
  );

  // Create a blob URL and trigger download
  const blob = new Blob([response.data], { type: response.headers["content-type"] || "text/csv" });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  
  // Try to extract filename from content-disposition header if available
  const contentDisposition = response.headers["content-disposition"];
  let filename = "appointments-export.csv";
  if (contentDisposition && contentDisposition.includes("filename=")) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }
  
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
