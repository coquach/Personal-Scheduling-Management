import { browserApiRequest, type FullBrowserApiResponse } from "@/lib/api-client";
import {
  getStatisticsInputSchema,
  statisticsSummaryResponseSchema,
  exportAppointmentsInputSchema,
  type GetStatisticsInput,
  type StatisticsSummaryResponse,
  type ExportAppointmentsInput,
} from "@/model/statistics";

export async function getStatistics(
  input: GetStatisticsInput,
): Promise<StatisticsSummaryResponse> {
  const parsedInput = getStatisticsInputSchema.parse(input);
  
  const rawResponse = await browserApiRequest<unknown>("/statistics/me", undefined, {
    params: {
      startDate: parsedInput.startDate,
      endDate: parsedInput.endDate,
      groupBy: parsedInput.groupBy,
      timezone: parsedInput.timezone,
    }
  });

  return statisticsSummaryResponseSchema.parse(rawResponse);
}

export async function exportAppointments(input: ExportAppointmentsInput): Promise<void> {
  const parsedInput = exportAppointmentsInputSchema.parse(input);
  
  const response = await browserApiRequest<FullBrowserApiResponse<Blob>>(
    "/statistics/export",
    undefined,
    { 
      responseType: "blob", 
      returnFullResponse: true,
      params: {
        startDate: parsedInput.startDate,
        endDate: parsedInput.endDate,
        tagId: parsedInput.tagId,
        status: parsedInput.status,
        query: parsedInput.query,
        timezone: parsedInput.timezone,
      }
    }
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
